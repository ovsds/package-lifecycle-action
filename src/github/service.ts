import { GithubClientInterface, defaultPerPage } from "./clients";
import { PackageTypeLiteral, PackageVersion, ReasonedPackageVersion, User } from "./models";

export interface GithubPackageVersionServiceInterface {
  getAllPackageVersions(
    client: GithubClientInterface,
    owner: User,
    packageName: string,
    packageType: PackageTypeLiteral,
  ): Promise<PackageVersion[]>;

  deletePackageVersions(
    client: GithubClientInterface,
    owner: User,
    packageName: string,
    packageType: PackageTypeLiteral,
    packageVersions: PackageVersion[],
  ): Promise<PackageVersion[]>;

  filterPackageVersions(
    packageVersions: PackageVersion[],
    tagRegex: RegExp,
    untagged: boolean,
  ): Promise<ReasonedPackageVersion[]>;

  getExpiredPackageVersions(
    packageVersions: PackageVersion[],
    expirePeriodDays: number,
  ): Promise<ReasonedPackageVersion[]>;

  getRetainedPackageVersions(
    allPackageVersions: PackageVersion[],
    filteredPackageVersions: PackageVersion[],
    retainedTaggedTop: number,
    retainUntagged: boolean,
    retainUntaggedDriftSeconds: number,
  ): Promise<ReasonedPackageVersion[]>;

  getUnwantedPackageVersions(expired: PackageVersion[], retained: PackageVersion[]): Promise<PackageVersion[]>;
}

export class GithubPackageVersionService implements GithubPackageVersionServiceInterface {
  async getAllPackageVersions(
    client: GithubClientInterface,
    owner: User,
    packageName: string,
    packageType: PackageTypeLiteral,
  ): Promise<PackageVersion[]> {
    let result: PackageVersion[] = [];

    let currentPage = 1;
    const perPage = defaultPerPage;

    while (true) {
      const versionsPage = await client.getPackageVersions(owner, packageName, packageType, currentPage, perPage);

      result = result.concat(versionsPage);
      if (versionsPage.length < perPage) {
        break;
      }
      currentPage++;
    }

    // Sort by createdAt in descending order
    result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }

  async deletePackageVersions(
    client: GithubClientInterface,
    owner: User,
    packageName: string,
    packageType: PackageTypeLiteral,
    packageVersions: PackageVersion[],
  ): Promise<PackageVersion[]> {
    for (const version of packageVersions) {
      await client.deletePackageVersion(owner, packageName, packageType, version.id);
    }

    return packageVersions;
  }

  async filterPackageVersions(
    packageVersions: PackageVersion[],
    tagRegex: RegExp,
    untagged: boolean,
  ): Promise<ReasonedPackageVersion[]> {
    const result: ReasonedPackageVersion[] = [];

    for (const version of packageVersions) {
      if (version.tags.some((tag) => tagRegex.test(tag))) {
        result.push({ version, reason: "Tag regex" });
      } else if (untagged && version.tags.length === 0) {
        result.push({ version, reason: "Untagged" });
      }
    }

    return result;
  }

  async getExpiredPackageVersions(
    packageVersions: PackageVersion[],
    expirePeriodDays: number,
  ): Promise<ReasonedPackageVersion[]> {
    const result: ReasonedPackageVersion[] = [];
    const expirationDate = new Date(Date.now() - expirePeriodDays * 24 * 60 * 60 * 1000);
    expirationDate.setHours(0, 0, 0, 0);

    for (const version of packageVersions) {
      if (version.createdAt < expirationDate) {
        result.push({
          version,
          reason: `Expired: created at ${version.createdAt.toDateString()}`,
        });
      }
    }

    return result;
  }

  async getRetainedPackageVersions(
    allPackageVersions: PackageVersion[],
    filteredPackageVersions: PackageVersion[],
    retainedTaggedTop: number,
    retainUntagged: boolean,
    retainUntaggedDriftSeconds: number,
  ): Promise<ReasonedPackageVersion[]> {
    if (filteredPackageVersions.length === 0) {
      return [];
    }
    if (retainedTaggedTop === 0) {
      if (allPackageVersions.length === filteredPackageVersions.length) {
        return [{ version: filteredPackageVersions[0], reason: "Retained newest, impossible to delete all versions" }];
      }
      return [];
    }

    const result: ReasonedPackageVersion[] = [];
    let retainedCount = 0;
    let lastRetainedCreatedAt = filteredPackageVersions[0].createdAt;

    for (const version of filteredPackageVersions) {
      if (version.tags.length === 0) {
        if (!retainUntagged) {
          continue;
        }
        if (retainedCount < retainedTaggedTop) {
          result.push({ version, reason: "Retained untagged" });
        } else if (lastRetainedCreatedAt.getTime() - version.createdAt.getTime() < retainUntaggedDriftSeconds * 1000) {
          result.push({ version, reason: "Retained untagged due to drift" });
        } else {
          break;
        }
      } else if (retainedCount < retainedTaggedTop) {
        result.push({ version, reason: "Retained tagged" });
        lastRetainedCreatedAt = version.createdAt;
        retainedCount++;
      }
    }

    return result;
  }

  async getUnwantedPackageVersions(expired: PackageVersion[], retained: PackageVersion[]): Promise<PackageVersion[]> {
    const retainedIds = new Set(retained.map((version) => version.id));
    return expired.filter((version) => !retainedIds.has(version.id));
  }
}
