import { describe, expect, test } from "vitest";

import { parseBoolean, parseNonEmptyString, parseNonNegativeNumber, parseNumber } from "../../../src/utils/parse";

describe("Parse utils tests", () => {
  test("parseBoolean parses boolean correctly", () => {
    expect(parseBoolean("true")).toBe(true);
    expect(parseBoolean("false")).toBe(false);
  });

  test("parseBoolean throws error when invalid", () => {
    expect(() => parseBoolean("invalid")).toThrowError();
  });

  test("parseNumber string to number correctly", () => {
    expect(parseNumber("42")).toBe(42);
    expect(parseNumber("0")).toBe(0);
    expect(parseNumber("-42")).toBe(-42);
    expect(parseNumber("42.1")).toBe(42);
    expect(parseNumber("-42,8")).toBe(-42);
    expect(parseNumber("42.")).toBe(42);
  });

  test("parseNumber throws error when invalid", () => {
    expect(() => parseNumber("invalid")).toThrowError();
    expect(() => parseNumber("")).toThrowError();
    expect(() => parseNumber(undefined)).toThrowError();
  });

  test("parseNonNegativeNumber parses non-negative number correctly", () => {
    expect(parseNonNegativeNumber("42")).toBe(42);
    expect(parseNonNegativeNumber("0")).toBe(0);
  });

  test("parseNonNegativeNumber throws error when negative", () => {
    expect(() => parseNonNegativeNumber("-1")).toThrowError();
  });

  test("parseNonNegativeNumber throws error when invalid", () => {
    expect(() => parseNonNegativeNumber("invalid")).toThrowError();
    expect(() => parseNonNegativeNumber("")).toThrowError();
    expect(() => parseNonNegativeNumber(undefined)).toThrowError();
  });

  test("parseNonEmptyString parses non-empty string correctly", () => {
    expect(parseNonEmptyString("test")).toBe("test");
  });

  test("parseNonEmptyString throws error when empty", () => {
    expect(() => parseNonEmptyString("")).toThrowError();
    expect(() => parseNonEmptyString(undefined)).toThrowError();
  });
});
