import * as parseUtils from "../../../src/utils/parse";
import { describe, test, expect } from "vitest";

describe("Parse utils tests", () => {
  test("parseBoolean parses boolean correctly", () => {
    expect(parseUtils.parseBoolean("true")).toBe(true);
    expect(parseUtils.parseBoolean("false")).toBe(false);
  });

  test("parseBoolean throws error when invalid", () => {
    expect(() => parseUtils.parseBoolean("invalid")).toThrowError();
  });

  test("parseNumber string to number correctly", () => {
    expect(parseUtils.parseNumber("42")).toBe(42);
    expect(parseUtils.parseNumber("0")).toBe(0);
    expect(parseUtils.parseNumber("-42")).toBe(-42);
    expect(parseUtils.parseNumber("42.1")).toBe(42);
    expect(parseUtils.parseNumber("-42,8")).toBe(-42);
    expect(parseUtils.parseNumber("42.")).toBe(42);
  });

  test("parseNumber throws error when invalid", () => {
    expect(() => parseUtils.parseNumber("invalid")).toThrowError();
    expect(() => parseUtils.parseNumber("")).toThrowError();
    expect(() => parseUtils.parseNumber(undefined)).toThrowError();
  });

  test("parseNonNegativeNumber parses non-negative number correctly", () => {
    expect(parseUtils.parseNonNegativeNumber("42")).toBe(42);
    expect(parseUtils.parseNonNegativeNumber("0")).toBe(0);
  });

  test("parseNonNegativeNumber throws error when negative", () => {
    expect(() => parseUtils.parseNonNegativeNumber("-1")).toThrowError();
  });

  test("parseNonNegativeNumber throws error when invalid", () => {
    expect(() => parseUtils.parseNonNegativeNumber("invalid")).toThrowError();
    expect(() => parseUtils.parseNonNegativeNumber("")).toThrowError();
    expect(() => parseUtils.parseNonNegativeNumber(undefined)).toThrowError();
  });

  test("parseNonEmptyString parses non-empty string correctly", () => {
    expect(parseUtils.parseNonEmptyString("test")).toBe("test");
  });

  test("parseNonEmptyString throws error when empty", () => {
    expect(() => parseUtils.parseNonEmptyString("")).toThrowError();
    expect(() => parseUtils.parseNonEmptyString(undefined)).toThrowError();
  });
});
