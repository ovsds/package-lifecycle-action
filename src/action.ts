import * as githubClients from "./github/clients";
import * as githubModels from "./github/models";
import * as githubServices from "./github/service";

function packageVersionToString(version: githubModels.PackageVersion): string {
  return `${version.name}(${version.tags.join(", ")})`;
}

function reasonedPackageVersionToString(reasonedPackageVersion: githubModels.ReasonedPackageVersion): string {
  return `${packageVersionToString(reasonedPackageVersion.version)} - ${reasonedPackageVersion.reason}`;
}

function packageVersionsToString(versions: githubModels.PackageVersion[]): string {
  return versions.map(packageVersionToString).join("\n");
}

function reasonedPackageVersionsToString(versions: githubModels.ReasonedPackageVersion[]): string {
  return versions.map(reasonedPackageVersionToString).join("\n");
}

interface ActionResult {
  owner: githubModels.User;
  packageVersions: {
    all: githubModels.PackageVersion[];
    reasonedFiltered: githubModels.ReasonedPackageVersion[];
    reasonedExpired: githubModels.ReasonedPackageVersion[];
    reasonedRetained: githubModels.ReasonedPackageVersion[];
    unwanted: githubModels.PackageVersion[];
    deleted: githubModels.PackageVersion[];
  };
}

interface ActionOptions {
  owner: string;
  packageName: string;
  packageType: githubModels.PackageTypeLiteral;
  tagRegex: RegExp;
  untagged: boolean;
  expirePeriodDays: number;
  retainedTaggedTop: number;
  retainUntagged: boolean;
  dryRun: boolean;
  githubToken: string;
  retainUntaggedDriftSeconds: number;
  logger: (message: string) => void;
}

export class Action {
  static fromOptions(actionOptions: ActionOptions): Action {
    return new Action(
      actionOptions,
      githubClients.GithubClient.fromGithubToken(actionOptions.githubToken),
      new githubServices.GithubPackageVersionService(),
    );
  }

  private readonly options: ActionOptions;
  private readonly githubClient: githubClients.GithubClientInterface;
  private readonly packageVersionService: githubServices.GithubPackageVersionServiceInterface;

  constructor(
    actionOptions: ActionOptions,
    githubClient: githubClients.GithubClientInterface,
    packageVersionService: githubServices.GithubPackageVersionServiceInterface,
  ) {
    this.options = actionOptions;
    this.githubClient = githubClient;
    this.packageVersionService = packageVersionService;
  }

  async run(): Promise<ActionResult> {
    this.options.logger(`Target owner: ${this.options.owner}.`);
    const owner = await this.githubClient.getUser(this.options.owner);
    this.options.logger(`User type: ${owner.type}.`);
    this.options.logger(`Target package: ${this.options.packageName}. Package type: ${this.options.packageType}.\n`);

    const all = await this.packageVersionService.getAllPackageVersions(
      this.githubClient,
      owner,
      this.options.packageName,
      this.options.packageType,
    );
    this.options.logger(`All package versions:\n${packageVersionsToString(all)}\n`);

    this.options.logger(`Tag regex: ${this.options.tagRegex}. Untagged: ${this.options.untagged}.`);
    const reasonedFiltered = await this.packageVersionService.filterPackageVersions(
      all,
      this.options.tagRegex,
      this.options.untagged,
    );
    const filtered = reasonedFiltered.map((item) => item.version);
    this.options.logger(`Filtered package versions:\n${reasonedPackageVersionsToString(reasonedFiltered)}\n`);

    this.options.logger(`Expire period days: ${this.options.expirePeriodDays}.`);
    const reasonedExpired = await this.packageVersionService.getExpiredPackageVersions(
      filtered,
      this.options.expirePeriodDays,
    );
    const expired = reasonedExpired.map((item) => item.version);
    this.options.logger(`Expired package versions:\n${reasonedPackageVersionsToString(reasonedExpired)}\n`);

    this.options.logger(`Retained tagged top: ${this.options.retainedTaggedTop}.`);
    this.options.logger(
      `Retain untagged: ${this.options.retainUntagged}, drift: ${this.options.retainUntaggedDriftSeconds} seconds.`,
    );
    const reasonedRetained = await this.packageVersionService.getRetainedPackageVersions(
      all,
      filtered,
      this.options.retainedTaggedTop,
      this.options.retainUntagged,
      this.options.retainUntaggedDriftSeconds,
    );
    const retained = reasonedRetained.map((item) => item.version);
    this.options.logger(`Retained package versions:\n${reasonedPackageVersionsToString(reasonedRetained)}\n`);

    const unwanted = await this.packageVersionService.getUnwantedPackageVersions(expired, retained);
    this.options.logger(`Unwanted package versions:\n${packageVersionsToString(unwanted)}\n`);

    this.options.logger(`Dry run: ${this.options.dryRun}.`);
    let deleted: githubModels.PackageVersion[] = [];
    if (!this.options.dryRun) {
      deleted = await this.packageVersionService.deletePackageVersions(
        this.githubClient,
        owner,
        this.options.packageName,
        this.options.packageType,
        unwanted,
      );
    }
    this.options.logger(`Deleted package versions:\n${packageVersionsToString(deleted)}`);

    return {
      owner,
      packageVersions: {
        all,
        reasonedFiltered,
        reasonedExpired,
        reasonedRetained,
        unwanted,
        deleted,
      },
    };
  }
}
