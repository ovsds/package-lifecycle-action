import * as githubServices from "../../../src/github/service";
import * as githubClients from "../../../src/github/clients";
import * as githubModels from "../../../src/github/models";
import { beforeEach, describe, expect, test, vitest, afterEach } from "vitest";

const testPackageName = "test-package-name";
const testPackageType = "container" as githubModels.PackageTypeLiteral;

describe("getAllPackageVersions", () => {
  let mockGithubClient: githubClients.GithubClientInterface;
  let testOwner: githubModels.User;

  beforeEach(() => {
    mockGithubClient = {
      getUser: vitest.fn(),
      getPackageVersions: vitest.fn(),
      deletePackageVersion: vitest.fn(),
    };
    testOwner = { type: "User" as githubModels.UserTypeLiteral, login: "test-owner" };
  });

  test("with empty versions", async () => {
    mockGithubClient.getPackageVersions.mockResolvedValue([] as githubModels.PackageVersion[]);
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getAllPackageVersions(mockGithubClient, testOwner, testPackageName, testPackageType);

    expect(result).toEqual([]);
    expect(mockGithubClient.getPackageVersions).toHaveBeenCalledWith(
      testOwner,
      testPackageName,
      testPackageType,
      1,
      100,
    );
  });

  test("with multiple pages", async () => {
    const now = Date.now();
    const versions = Array.from({ length: githubClients.defaultPerPage * 2 - 1 }, (_, i: number) => ({
      createdAt: new Date(now - i),
    }));

    const page1 = versions.slice(0, githubClients.defaultPerPage);
    const page2 = versions.slice(githubClients.defaultPerPage);
    const service = new githubServices.GithubPackageVersionService();

    mockGithubClient.getPackageVersions.mockResolvedValueOnce(page1);
    mockGithubClient.getPackageVersions.mockResolvedValueOnce(page2);

    const result = await service.getAllPackageVersions(mockGithubClient, testOwner, testPackageName, testPackageType);

    expect(result).toEqual([...page1, ...page2]);
    expect(mockGithubClient.getPackageVersions).toHaveBeenNthCalledWith(
      1,
      testOwner,
      testPackageName,
      testPackageType,
      1,
      githubClients.defaultPerPage,
    );
    expect(mockGithubClient.getPackageVersions).toHaveBeenNthCalledWith(
      2,
      testOwner,
      testPackageName,
      testPackageType,
      2,
      githubClients.defaultPerPage,
    );
  });

  test("sorted in DESC by createdAt", async () => {
    const versions = [
      { createdAt: new Date("2022-01-03") },
      { createdAt: new Date("2022-01-01") },
      { createdAt: new Date("2022-01-02") },
    ];
    const service = new githubServices.GithubPackageVersionService();

    mockGithubClient.getPackageVersions.mockResolvedValue(versions);

    const result = await service.getAllPackageVersions(mockGithubClient, testOwner, testPackageName, testPackageType);

    expect(result).toEqual([
      { createdAt: new Date("2022-01-03") },
      { createdAt: new Date("2022-01-02") },
      { createdAt: new Date("2022-01-01") },
    ]);
  });
});

describe("deletePackageVersions", () => {
  let mockGithubClient: githubClients.GithubClientInterface;
  let testOwner: githubModels.User;

  beforeEach(() => {
    mockGithubClient = {
      getUser: vitest.fn(),
      getPackageVersions: vitest.fn(),
      deletePackageVersion: vitest.fn(),
    };
    testOwner = { type: "User" as githubModels.UserTypeLiteral, login: "test-owner" };
  });

  test("with empty packageVersions", async () => {
    const packageVersions = [];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.deletePackageVersions(
      mockGithubClient,
      testOwner,
      testPackageName,
      testPackageType,
      packageVersions,
    );

    expect(result).toEqual([]);
    expect(mockGithubClient.deletePackageVersion).not.toHaveBeenCalled();
  });

  test("with multiple packageVersions", async () => {
    const packageVersions = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.deletePackageVersions(
      mockGithubClient,
      testOwner,
      testPackageName,
      testPackageType,
      packageVersions,
    );

    expect(result).toEqual(packageVersions);
    expect(mockGithubClient.deletePackageVersion).toHaveBeenCalledTimes(3);
    expect(mockGithubClient.deletePackageVersion).toHaveBeenCalledWith(testOwner, testPackageName, testPackageType, 1);
    expect(mockGithubClient.deletePackageVersion).toHaveBeenCalledWith(testOwner, testPackageName, testPackageType, 2);
    expect(mockGithubClient.deletePackageVersion).toHaveBeenCalledWith(testOwner, testPackageName, testPackageType, 3);
  });
});

describe("filterPackageVersions", () => {
  test("with empty packageVersions", async () => {
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.filterPackageVersions([], /./, false);
    expect(result).toEqual([]);
  });

  test("tag regex", async () => {
    const packageVersions = [
      { name: "v3", tags: ["another-tag"] },
      { name: "v2", tags: [] },
      { name: "v1", tags: ["tag"] },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.filterPackageVersions(packageVersions, /^tag$/, false);
    expect(result).toEqual([{ version: packageVersions[2], reason: "Tag regex" }]);
  });

  test("with untagged", async () => {
    const packageVersions = [
      { name: "v3", tags: ["tag3"] },
      { name: "v2", tags: [] },
      { name: "v1", tags: ["tag1"] },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.filterPackageVersions(packageVersions, /./, true);
    expect(result).toEqual([
      { version: packageVersions[0], reason: "Tag regex" },
      { version: packageVersions[1], reason: "Untagged" },
      { version: packageVersions[2], reason: "Tag regex" },
    ]);
  });

  test("without untagged", async () => {
    const packageVersions = [
      { name: "v3", tags: ["tag3"] },
      { name: "v2", tags: [] },
      { name: "v1", tags: ["tag1"] },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.filterPackageVersions(packageVersions, /./, false);
    expect(result).toEqual([
      { version: packageVersions[0], reason: "Tag regex" },
      { version: packageVersions[2], reason: "Tag regex" },
    ]);
  });
});

describe("getExpiredPackageVersions", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vitest.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vitest.useRealTimers();
  });

  test("with empty packageVersions", async () => {
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getExpiredPackageVersions([], 1);
    expect(result).toEqual([]);
  });

  test("with expired packageVersions", async () => {
    vitest.setSystemTime(new Date("2022-01-04"));

    const packageVersions = [
      { name: "v3", createdAt: new Date("2022-01-03") },
      { name: "v2", createdAt: new Date("2022-01-02") },
      { name: "v1", createdAt: new Date("2022-01-01") },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getExpiredPackageVersions(packageVersions, 1);
    expect(result).toEqual([
      { version: packageVersions[1], reason: "Expired: created at Sun Jan 02 2022" },
      { version: packageVersions[2], reason: "Expired: created at Sat Jan 01 2022" },
    ]);
  });
});

describe("getRetainedPackageVersions", () => {
  test("with empty packageVersions", async () => {
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getRetainedPackageVersions([], [], 1, true);
    expect(result).toEqual([]);
  });

  test("with retainedTop = 0", async () => {
    const packageVersions = [
      { name: "v3", tags: ["tag3"], createdAt: new Date("2022-01-03") },
      { name: "v2", createdAt: new Date("2022-01-02") },
      { name: "v1", tags: ["tag1"], createdAt: new Date("2022-01-01") },
    ];
    const allPackageVersions = [...packageVersions, { name: "v4", tags: [], createdAt: new Date("2022-01-04") }];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getRetainedPackageVersions(allPackageVersions, packageVersions, 0, true);
    expect(result).toEqual([]);
  });

  test("with retainedTop = 0 and all=filtered", async () => {
    const packageVersions = [
      { name: "v3", tags: ["tag3"], createdAt: new Date("2022-01-03") },
      { name: "v2", tags: [], createdAt: new Date("2022-01-02") },
      { name: "v1", tags: ["tag1"], createdAt: new Date("2022-01-01") },
    ];
    const allPackageVersions = [...packageVersions];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getRetainedPackageVersions(allPackageVersions, packageVersions, 0, true);
    expect(result).toEqual([
      { version: packageVersions[0], reason: "Retained newest, impossible to delete all versions" },
    ]);
  });

  test("with retainedTop = 1", async () => {
    const packageVersions = [
      { name: "v3", tags: ["tag3"], createdAt: new Date("2022-01-03") },
      { name: "v2", tags: [], createdAt: new Date("2022-01-02") },
      { name: "v1", tags: ["tag1"], createdAt: new Date("2022-01-01") },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getRetainedPackageVersions([], packageVersions, 1, true);
    expect(result).toEqual([{ version: packageVersions[0], reason: "Retained tagged" }]);
  });

  test("with retainedTop = 1 and retainUntagged = true", async () => {
    const packageVersions = [
      { name: "v4", tags: [], createdAt: new Date("2022-01-04") },
      { name: "v4", tags: [], createdAt: new Date("2022-01-03") },
      { name: "v3", tags: ["tag3"], createdAt: new Date("2022-01-03") },
      { name: "v2", tags: [], createdAt: new Date("2022-01-02") },
      { name: "v1", tags: ["tag1"], createdAt: new Date("2022-01-01") },
    ];
    const service = new githubServices.GithubPackageVersionService();

    const result = await service.getRetainedPackageVersions([], packageVersions, 1, true);
    expect(result).toEqual([
      { version: packageVersions[0], reason: "Retained untagged" },
      { version: packageVersions[1], reason: "Retained untagged" },
      { version: packageVersions[2], reason: "Retained tagged" },
    ]);
  });
});
