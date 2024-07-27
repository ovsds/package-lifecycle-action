import { describe, expect, test } from "vitest";

import { RawActionInput, parseActionInput } from "../../src/input";

const defaultRawInput = {
  owner: "test_owner",
  packageName: "test_package_name",
  packageType: "container",
  tagRegex: "^.*$",
  untagged: "false",
  expirePeriodDays: "30",
  retainedTaggedTop: "3",
  retainUntagged: "false",
  dryRun: "true",
  githubToken: "test_github_token",
};

function createRawInput(overrides: Partial<RawActionInput> = {}): input.RawActionInput {
  return {
    ...defaultRawInput,
    ...overrides,
  };
}

describe("Input tests", () => {
  test("parses raw input correctly", () => {
    expect(parseActionInput(createRawInput())).toEqual({
      owner: "test_owner",
      packageName: "test_package_name",
      packageType: "container",
      tagRegex: RegExp("^.*$"),
      untagged: false,
      expirePeriodDays: 30,
      retainedTaggedTop: 3,
      retainUntagged: false,
      dryRun: true,
      githubToken: "test_github_token",
    });
  });

  test("throws error when packageType is invalid", () => {
    expect(() => parseActionInput(createRawInput({ packageType: "invalid" })).packageType).toThrowError();
  });

  test("parses untagged correctly", () => {
    expect(parseActionInput(createRawInput({ untagged: "true" })).untagged).toBe(true);
    expect(parseActionInput(createRawInput({ untagged: "false" })).untagged).toBe(false);
  });

  test("throws error when untagged is invalid", () => {
    expect(() => parseActionInput(createRawInput({ untagged: "invalid" })).untagged).toThrowError();
  });

  test("throws error when expirePeriodDays is invalid", () => {
    expect(() => parseActionInput(createRawInput({ expirePeriodDays: "invalid" })).expirePeriodDays).toThrowError();
  });

  test("throws error when expirePeriodDays is negative", () => {
    expect(() => parseActionInput(createRawInput({ expirePeriodDays: "-1" })).expirePeriodDays).toThrowError();
  });

  test("throws error when retainedTaggedTop is invalid", () => {
    expect(() => parseActionInput(createRawInput({ retainedTaggedTop: "invalid" })).retainedTaggedTop).toThrowError();
  });

  test("throws error when retainedTaggedTop is negative", () => {
    expect(() => parseActionInput(createRawInput({ retainedTaggedTop: "-1" })).retainedTaggedTop).toThrowError();
  });

  test("parses retainUntagged correctly", () => {
    expect(parseActionInput(createRawInput({ retainUntagged: "true" })).retainUntagged).toBe(true);
    expect(parseActionInput(createRawInput({ retainUntagged: "false" })).retainUntagged).toBe(false);
  });

  test("throws error when retainUntagged is invalid", () => {
    expect(() => parseActionInput(createRawInput({ retainUntagged: "invalid" })).retainUntagged).toThrowError();
  });

  test("parses dryRun correctly", () => {
    expect(parseActionInput(createRawInput({ dryRun: "true" })).dryRun).toBe(true);
    expect(parseActionInput(createRawInput({ dryRun: "false" })).dryRun).toBe(false);
  });

  test("throws error when dryRun is invalid", () => {
    expect(() => parseActionInput(createRawInput({ dryRun: "invalid" })).dryRun).toThrowError();
  });
});
