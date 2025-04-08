import { beforeAll, describe, expect, test } from "vitest";

import { GithubClient } from "../../../src/github/clients";
import { User } from "../../../src/github/models";
import { parseNonEmptyString } from "../../../src/utils/parse";

describe("GithubClient tests", () => {
  let client: GithubClient;
  let settings: {
    githubToken: string;
    githubTestUser: string;
    githubTestOrganization: string;
    githubTestImageName: string;
    githubTestImageTag: string;
    githubTestImageTagToDelete: string;
  };
  let testUser: User;
  let testOrganization: User;

  beforeAll(() => {
    settings = {
      githubToken: parseNonEmptyString(process.env.GITHUB_TOKEN),
      githubTestUser: parseNonEmptyString(process.env.GITHUB_TEST_USER),
      githubTestOrganization: parseNonEmptyString(process.env.GITHUB_TEST_ORGANIZATION),
      githubTestImageName: parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_NAME),
      githubTestImageTag: parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_TAG),
      githubTestImageTagToDelete: parseNonEmptyString(process.env.GITHUB_TEST_IMAGE_TAG_TO_DELETE),
    };

    client = GithubClient.fromGithubToken(settings.githubToken);
    testUser = { login: settings.githubTestUser, type: "User" };
    testOrganization = { login: settings.githubTestOrganization, type: "Organization" };
  });

  // TODO: Add before hook to create a package version to test delete methods
  test.skip("deleteUserPackageVersion", async () => {
    const versions = await client.getPackageVersions(testUser, settings.githubTestImageName, "container");
    const version = versions.find((item) => item.tags.includes(settings.githubTestImageTagToDelete));
    expect(version).toBeDefined();
    await client.deletePackageVersion(testUser, settings.githubTestImageName, "container", version.id);
    const versions2 = await client.getPackageVersions(testUser, settings.githubTestImageName, "container");
    const version2 = versions2.find((item) => item.tags.includes(settings.githubTestImageTagToDelete));
    expect(version2).toBeUndefined();
  });

  test.skip("deleteOrganizationPackageVersion", async () => {
    const versions = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container");
    const version = versions.find((item) => item.tags.includes(settings.githubTestImageTagToDelete));
    expect(version).toBeDefined();
    await client.deletePackageVersion(testOrganization, settings.githubTestImageName, "container", version.id);
    const versions2 = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container");
    const version2 = versions2.find((item) => item.tags.includes(settings.githubTestImageTagToDelete));
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
    expect(versions.length).toEqual(2);
    expect(versions[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      tags: [settings.githubTestImageTag],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    // const versionIds = versions.map((version) => version.id);

    const versions2 = await client.getPackageVersions(testUser, settings.githubTestImageName, "container", 2, 2);
    expect(versions2.length).toEqual(0);
    // const versionIds2 = versions2.map((version) => version.id);
    // expect(versionIds2).toEqual([versionIds[2], versionIds[3]]);
  });

  test("getOrganizationPackageVersions", async () => {
    const versions = await client.getPackageVersions(testOrganization, settings.githubTestImageName, "container", 1, 5);
    expect(versions.length).toEqual(2);
    expect(versions[0]).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      tags: [settings.githubTestImageTag],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    // const versionIds = versions.map((version) => version.id);

    const versions2 = await client.getPackageVersions(
      testOrganization,
      settings.githubTestImageName,
      "container",
      2,
      2,
    );
    expect(versions2.length).toEqual(0);
    // const versionIds2 = versions2.map((version) => version.id);
    // expect(versionIds2).toEqual([versionIds[2], versionIds[3]]);
  });
});
