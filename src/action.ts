import * as githubClients from "./github/clients";
import * as githubModels from "./github/models";
import * as githubServices from "./github/service";
import * as input from "./input";

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

export class Action {
  static fromInput(actionInput: input.Input): Action {
    return new Action(
      actionInput,
      githubClients.GithubClient.fromGithubToken(actionInput.githubToken),
      new githubServices.GithubPackageVersionService(),
    );
  }

  private readonly actionInput: input.Input;
  private readonly githubClient: githubClients.GithubClientInterface;
  private readonly packageVersionService: githubServices.GithubPackageVersionServiceInterface;

  constructor(
    actionInput: input.Input,
    githubClient: githubClients.GithubClientInterface,
    packageVersionService: githubServices.GithubPackageVersionServiceInterface,
  ) {
    this.actionInput = actionInput;
    this.githubClient = githubClient;
    this.packageVersionService = packageVersionService;
  }

  async run(): Promise<ActionResult> {
    console.info(`Target owner: ${this.actionInput.owner}.`);
    const owner = await this.githubClient.getUser(this.actionInput.owner);
    console.info(`User type: ${owner.type}.`);
    console.info(`Target package: ${this.actionInput.packageName}. Package type: ${this.actionInput.packageType}.\n`);

    const all = await this.packageVersionService.getAllPackageVersions(
      this.githubClient,
      owner,
      this.actionInput.packageName,
      this.actionInput.packageType,
    );
    console.info(`All package versions:\n${packageVersionsToString(all)}\n`);

    console.info(`Tag regex: ${this.actionInput.tagRegex}. Untagged: ${this.actionInput.untagged}.`);
    const reasonedFiltered = await this.packageVersionService.filterPackageVersions(
      all,
      this.actionInput.tagRegex,
      this.actionInput.untagged,
    );
    const filtered = reasonedFiltered.map((item) => item.version);
    console.info(`Filtered package versions:\n${reasonedPackageVersionsToString(reasonedFiltered)}\n`);

    console.info(`Expire period days: ${this.actionInput.expirePeriodDays}.`);
    const reasonedExpired = await this.packageVersionService.getExpiredPackageVersions(
      filtered,
      this.actionInput.expirePeriodDays,
    );
    const expired = reasonedExpired.map((item) => item.version);
    console.info(`Expired package versions:\n${reasonedPackageVersionsToString(reasonedExpired)}\n`);

    console.info(`Retained tagged top: ${this.actionInput.retainedTaggedTop}.`);
    console.info(`Retain untagged: ${this.actionInput.retainUntagged}.`);
    const reasonedRetained = await this.packageVersionService.getRetainedPackageVersions(
      all,
      filtered,
      this.actionInput.retainedTaggedTop,
      this.actionInput.retainUntagged,
    );
    const retained = reasonedRetained.map((item) => item.version);
    console.info(`Retained package versions:\n${reasonedPackageVersionsToString(reasonedRetained)}\n`);

    const unwanted = await this.packageVersionService.getUnwantedPackageVersions(expired, retained);
    console.info(`Unwanted package versions:\n${packageVersionsToString(unwanted)}\n`);

    console.info(`Dry run: ${this.actionInput.dryRun}.`);
    let deleted: githubModels.PackageVersion[] = [];
    if (!this.actionInput.dryRun) {
      deleted = await this.packageVersionService.deletePackageVersions(
        this.githubClient,
        owner,
        this.actionInput.packageName,
        this.actionInput.packageType,
        unwanted,
      );
    }
    console.info(`Deleted package versions:\n${packageVersionsToString(deleted)}`);

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
