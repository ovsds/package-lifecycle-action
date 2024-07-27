import { PackageTypeLiteral, parsePackageType } from "./github/models";
import { parseBoolean, parseNonEmptyString, parseNonNegativeNumber } from "./utils/parse";

export interface RawActionInput {
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

export interface ActionInput {
  owner: string;
  packageName: string;
  packageType: PackageTypeLiteral;
  tagRegex: RegExp;
  untagged: boolean;
  expirePeriodDays: number;
  retainedTaggedTop: number;
  retainUntagged: boolean;
  dryRun: boolean;
  githubToken: string;
}

export function parseActionInput(raw: RawActionInput): ActionInput {
  return {
    owner: parseNonEmptyString(raw.owner),
    packageName: parseNonEmptyString(raw.packageName),
    packageType: parsePackageType(raw.packageType),
    tagRegex: new RegExp(parseNonEmptyString(raw.tagRegex)),
    untagged: parseBoolean(raw.untagged),
    expirePeriodDays: parseNonNegativeNumber(raw.expirePeriodDays),
    retainedTaggedTop: parseNonNegativeNumber(raw.retainedTaggedTop),
    retainUntagged: parseBoolean(raw.retainUntagged),
    dryRun: parseBoolean(raw.dryRun),
    githubToken: parseNonEmptyString(raw.githubToken),
  };
}
