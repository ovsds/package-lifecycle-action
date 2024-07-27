import { getInput, info, setFailed } from "@actions/core";

import { Action } from "./action";
import { ActionInput, parseActionInput } from "./input";

function getActionInput(): ActionInput {
  return parseActionInput({
    owner: getInput("owner"),
    packageName: getInput("package-name"),
    packageType: getInput("package-type"),
    tagRegex: getInput("tag-regex"),
    untagged: getInput("untagged"),
    expirePeriodDays: getInput("expire-period-days"),
    retainedTaggedTop: getInput("retained-tagged-top"),
    retainUntagged: getInput("retain-untagged"),
    dryRun: getInput("dry-run"),
    githubToken: getInput("github-token"),
  });
}

async function _main(): Promise<void> {
  const actionInput = getActionInput();
  const actionInstance = Action.fromOptions({
    ...actionInput,
    retainUntaggedDriftSeconds: 10 * 60, // 10 minutes
    logger: info,
  });
  await actionInstance.run();
}

async function main(): Promise<void> {
  try {
    _main();
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed("An unexpected error occurred");
    }
  }
}

main();
