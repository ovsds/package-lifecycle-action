import * as githubModels from "./github/models";
import * as parseUtils from "./utils/parse";

export interface RawInput {
  owner: string;
  packageName: string;
  packageType: string;
  tagRegex: string;
  untagged: string;
  expirePeriodDays: string;
  retainedTaggedTop: string;
  retainUntagged: string;
  dryRun: string;
  githubToken: string;
}

export interface Input {
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
}

export function parseInput(raw: RawInput): Input {
  return {
    owner: parseUtils.parseNonEmptyString(raw.owner),
    packageName: parseUtils.parseNonEmptyString(raw.packageName),
    packageType: githubModels.parsePackageType(raw.packageType),
    tagRegex: new RegExp(parseUtils.parseNonEmptyString(raw.tagRegex)),
    untagged: parseUtils.parseBoolean(raw.untagged),
    expirePeriodDays: parseUtils.parseNonNegativeNumber(raw.expirePeriodDays),
    retainedTaggedTop: parseUtils.parseNonNegativeNumber(raw.retainedTaggedTop),
    retainUntagged: parseUtils.parseBoolean(raw.retainUntagged),
    dryRun: parseUtils.parseBoolean(raw.dryRun),
    githubToken: parseUtils.parseNonEmptyString(raw.githubToken),
  };
}
