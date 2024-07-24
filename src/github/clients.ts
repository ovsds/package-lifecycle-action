import { Octokit } from "@octokit/rest";

import * as githubModels from "./models";

export const defaultPerPage = 100;

interface GetUserResponse {
  login: string;
  type: string;
}

function parseUser(raw: GetUserResponse): githubModels.User {
  return {
    login: raw.login,
    type: githubModels.parseUserType(raw.type),
  };
}

interface GetPackageVersionResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  metadata?: { container?: { tags: string[] } };
}

function parsePackageVersion(raw: GetPackageVersionResponse): githubModels.PackageVersion {
  return {
    id: raw.id,
    name: raw.name,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
    tags: raw.metadata?.container?.tags ?? [],
  };
}

export interface GithubClientInterface {
  getUser(username: string): Promise<githubModels.User>;
  getPackageVersions(
    owner: githubModels.User,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    page?: number,
    perPage?: number,
    state?: githubModels.PackageVersionStateLiteral,
  ): Promise<githubModels.PackageVersion[]>;
  deletePackageVersion(
    owner: githubModels.User,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    packageVersionId: number,
  ): Promise<void>;
}

// TODO: add rate limiting
export class GithubClient implements GithubClientInterface {
  static fromGithubToken(githubToken: string): GithubClient {
    return new GithubClient(
      new Octokit({
        auth: githubToken,
      }),
    );
  }

  private readonly octokitClient: Octokit;

  constructor(octokitClient: Octokit) {
    this.octokitClient = octokitClient;
  }

  // https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#list-package-versions-for-a-package-owned-by-a-user
  async getUser(username: string): Promise<githubModels.User> {
    const response = await this.octokitClient.users.getByUsername({ username });

    return parseUser(response.data);
  }

  async getPackageVersions(
    owner: githubModels.User,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    page = 1,
    perPage = 100,
    state: githubModels.PackageVersionStateLiteral = "active",
  ): Promise<githubModels.PackageVersion[]> {
    if (owner.type === "User") {
      return this.getUserPackageVersions(owner.login, packageName, packageType, page, perPage, state);
    } else if (owner.type === "Organization") {
      return this.getOrganizationPackageVersions(owner.login, packageName, packageType, page, perPage, state);
    } else {
      throw new Error(`Invalid owner type: ${owner.type}`);
    }
  }

  async deletePackageVersion(
    owner: githubModels.User,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    packageVersionId: number,
  ): Promise<void> {
    if (owner.type === "User") {
      await this.deleteUserPackageVersion(owner.login, packageName, packageType, packageVersionId);
    } else if (owner.type === "Organization") {
      await this.deleteOrganizationPackageVersion(owner.login, packageName, packageType, packageVersionId);
    } else {
      throw new Error(`Invalid owner type: ${owner.type}`);
    }
  }

  // https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#list-package-versions-for-a-package-owned-by-a-user
  private async getUserPackageVersions(
    username: string,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    page = 1,
    perPage = defaultPerPage,
    state: githubModels.PackageVersionStateLiteral = "active",
  ): Promise<githubModels.PackageVersion[]> {
    const response = await this.octokitClient.packages.getAllPackageVersionsForPackageOwnedByUser({
      package_type: packageType,
      package_name: packageName,
      username,
      page,
      per_page: perPage,
      state,
    });

    return response.data.map((version: GetPackageVersionResponse) => parsePackageVersion(version));
  }

  // https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#list-package-versions-for-a-package-owned-by-an-organization
  private async getOrganizationPackageVersions(
    organization: string,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    page = 1,
    perPage = defaultPerPage,
    state: githubModels.PackageVersionStateLiteral = "active",
  ): Promise<githubModels.PackageVersion[]> {
    const response = await this.octokitClient.packages.getAllPackageVersionsForPackageOwnedByOrg({
      package_type: packageType,
      package_name: packageName,
      org: organization,
      page,
      per_page: perPage,
      state,
    });

    return response.data.map((version: GetPackageVersionResponse) => parsePackageVersion(version));
  }

  // https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#delete-package-version-for-a-user
  private async deleteUserPackageVersion(
    username: string,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    packageVersionId: number,
  ): Promise<void> {
    await this.octokitClient.rest.packages.deletePackageVersionForUser({
      package_type: packageType,
      package_name: packageName,
      package_version_id: packageVersionId,
      username,
    });
  }

  // https://docs.github.com/en/rest/packages/packages?apiVersion=2022-11-28#delete-package-version-for-an-organization
  private async deleteOrganizationPackageVersion(
    organization: string,
    packageName: string,
    packageType: githubModels.PackageTypeLiteral,
    packageVersionId: number,
  ): Promise<void> {
    await this.octokitClient.rest.packages.deletePackageVersionForOrg({
      package_type: packageType,
      package_name: packageName,
      package_version_id: packageVersionId,
      org: organization,
    });
  }
}
