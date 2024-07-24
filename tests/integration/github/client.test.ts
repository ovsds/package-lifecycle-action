import * as githubClients from "../../../src/github/clients";
import * as parseUtils from "../../../src/utils/parse";
import * as githubModels from "../../../src/github/models";
import { beforeAll, describe, expect, test } from "vitest";

describe("GithubClient tests", function () {
  let client: githubClients.GithubClient;
  let settings: {
    githubToken: string;
    githubTestUser: string;
    githubTestOrganization: string;
    githubTestImageName: string;
    githubTestImageTag: string;
    githubTestImageTagToDelete: string;
  };
  let testUser: githubModels.User;
  let testOrganization: githubModels.User;

  beforeAll(() => {
    settings = {
      githubToken: parseUtils.parseNonEmptyString(process.env.GITHUB_TOKEN),
      githubTestUser: parseUtils.parseNonEmptyString(process.env.GITHUB_TEST_USER),
      githubTestOrganization: parseUtils.parseNonEmptyString(process.env.GITHUB_TEST_ORGANIZATION),
      githubTestImageName: parseUtils.parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_NAME),
      githubTestImageTag: parseUtils.parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_TAG),
      githubTestImageTagToDelete: parseUtils.parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_TAG_TO_DELETE),
    };

    client = githubClients.GithubClient.fromGithubToken(settings.githubToken);
    testUser = { login: settings.githubTestUser, type: "User" };
    testOrganization = { login: settings.githubTestOrganization, type: "Organization" };
  });

  // TODO: Add before hook to create a package version to test delete methods
  test.skip("deleteUserPackageVersion", async () => {
    const versions = await client.getPackageVersions(testUser, settings.githubTestImageName, "container");
    const version = versions.find((version) => version.tags.includes(settings.githubTestImageTagToDelete));
    expect(version).toBeDefined();
    await client.deletePackageVersion(testUser, settings.githubTestImageName, "container", version.id);
    const versions2 = await client.getPackageVersions(testUser, settings.githubTestImageName, "container");
    const version2 = versions2.find((version) => version.tags.includes(settings.githubTestImageTagToDelete));
    expect(version2).toBeUndefined();
  });

  test.skip("deleteOrganizationPackageVersion", async () => {
    const versions = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container");
    const version = versions.find((version) => version.tags.includes(settings.githubTestImageTagToDelete));
    expect(version).toBeDefined();
    await client.deletePackageVersion(testOrganization, settings.githubTestImageName, "container", version.id);
    const versions2 = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container");
    const version2 = versions2.find((version) => version.tags.includes(settings.githubTestImageTagToDelete));
    expect(version2).toBeUndefined();
  });

  test("getUser user type", async () => {
    const user = await client.getUser(settings.githubTestUser);
    expect(user).toEqual(testUser);
  });

  test("getUser organization type", async () => {
    const user = await client.getUser(settings.githubTestOrganization);
    expect(user).toEqual(testOrganization);
  });

  test("getUserPackageVersions", async () => {
    const versions = await client.getPackageVersions(testUser, settings.githubTestImageName, "container", 1, 5);
    expect(versions.length).toEqual(5);
    expect(versions[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      tags: [settings.githubTestImageTag],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    const version_ids = versions.map((version) => version.id);

    const versions2 = await client.getPackageVersions(testUser, settings.githubTestImageName, "container", 2, 2);
    expect(versions2.length).toEqual(2);
    const version_ids2 = versions2.map((version) => version.id);
    expect(version_ids2).toEqual([version_ids[2], version_ids[3]]);
  });

  test("getOrganizationPackageVersions", async () => {
    const versions = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container", 1, 5);
    expect(versions.length).toEqual(5);
    expect(versions[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      tags: [settings.githubTestImageTag],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    const version_ids = versions.map((version) => version.id);

    const versions2 = await client.getPackageVersions(
      testOrganization,
      settings.githubTestImageName,
      "container",
      2,
      2,
    );
    expect(versions2.length).toEqual(2);
    const version_ids2 = versions2.map((version) => version.id);
    expect(version_ids2).toEqual([version_ids[2], version_ids[3]]);
  });
});
