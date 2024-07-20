import * as input from "../../src/input";
import { describe, test, expect } from "vitest";

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

function createRawInput(overrides: Partial<input.RawInput> = {}): input.RawInput {
  return {
    ...defaultRawInput,
    ...overrides,
  };
}

describe("Input tests", () => {
  test("parses raw input correctly", () => {
    expect(input.parseInput(createRawInput())).toEqual({
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
    expect(() => input.parseInput(createRawInput({ packageType: "invalid" })).packageType).toThrowError();
  });

  test("parses untagged correctly", () => {
    expect(input.parseInput(createRawInput({ untagged: "true" })).untagged).toBe(true);
    expect(input.parseInput(createRawInput({ untagged: "false" })).untagged).toBe(false);
  });

  test("throws error when untagged is invalid", () => {
    expect(() => input.parseInput(createRawInput({ untagged: "invalid" })).untagged).toThrowError();
  });

  test("throws error when expirePeriodDays is invalid", () => {
    expect(() => input.parseInput(createRawInput({ expirePeriodDays: "invalid" })).expirePeriodDays).toThrowError();
  });

  test("throws error when expirePeriodDays is negative", () => {
    expect(() => input.parseInput(createRawInput({ expirePeriodDays: "-1" })).expirePeriodDays).toThrowError();
  });

  test("throws error when retainedTaggedTop is invalid", () => {
    expect(() => input.parseInput(createRawInput({ retainedTaggedTop: "invalid" })).retainedTaggedTop).toThrowError();
  });

  test("throws error when retainedTaggedTop is negative", () => {
    expect(() => input.parseInput(createRawInput({ retainedTaggedTop: "-1" })).retainedTaggedTop).toThrowError();
  });

  test("parses retainUntagged correctly", () => {
    expect(input.parseInput(createRawInput({ retainUntagged: "true" })).retainUntagged).toBe(true);
    expect(input.parseInput(createRawInput({ retainUntagged: "false" })).retainUntagged).toBe(false);
  });

  test("throws error when retainUntagged is invalid", () => {
    expect(() => input.parseInput(createRawInput({ retainUntagged: "invalid" })).retainUntagged).toThrowError();
  });

  test("parses dryRun correctly", () => {
    expect(input.parseInput(createRawInput({ dryRun: "true" })).dryRun).toBe(true);
    expect(input.parseInput(createRawInput({ dryRun: "false" })).dryRun).toBe(false);
  });

  test("throws error when dryRun is invalid", () => {
    expect(() => input.parseInput(createRawInput({ dryRun: "invalid" })).dryRun).toThrowError();
  });
});
