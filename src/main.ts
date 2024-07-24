import * as actionsCore from "@actions/core";

import * as action from "./action";
import * as input from "./input";

function getActionInput(): input.Input {
  return input.parseInput({
    owner: actionsCore.getInput("owner"),
    packageName: actionsCore.getInput("package-name"),
    packageType: actionsCore.getInput("package-type"),
    tagRegex: actionsCore.getInput("tag-regex"),
    untagged: actionsCore.getInput("untagged"),
    expirePeriodDays: actionsCore.getInput("expire-period-days"),
    retainedTaggedTop: actionsCore.getInput("retained-tagged-top"),
    retainUntagged: actionsCore.getInput("retain-untagged"),
    dryRun: actionsCore.getInput("dry-run"),
    githubToken: actionsCore.getInput("github-token"),
  });
}

async function _main(): Promise<void> {
  const actionInput = getActionInput();
  const actionInstance = action.Action.fromInput(actionInput);
  await actionInstance.run();
}

async function main(): Promise<void> {
  try {
    _main();
  } catch (error) {
    if (error instanceof Error) {
      actionsCore.setFailed(error.message);
    } else {
      actionsCore.setFailed("An unexpected error occurred");
    }
  }
}

main();
