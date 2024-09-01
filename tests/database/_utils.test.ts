import { describe, test, expect } from "@jest/globals";
import {
  createArrFromCSVLine,
  createCSVRow,
  createObjFromCSVLine,
} from "../../app/database/_utils";

describe("Database utils functions tests", () => {
  describe("createCSVRow", () => {
    test("should create a simple CSV row from an array of strings", () => {
      const input = ["one", "two", "three"];
      const result = createCSVRow(input);
      expect(result).toBe("one,two,three\n");
    });

    test("should quote fields containing commas", () => {
      const input = ["one", "two,with,commas", "three"];
      const result = createCSVRow(input);
      expect(result).toBe('one,"two,with,commas",three\n');
    });

    test("should quote fields containing double quotes", () => {
      const input = ["one", 'two"with"quotes', "three"];
      const result = createCSVRow(input);
      expect(result).toBe('one,"two""with""quotes",three\n');
    });

    test("should quote fields containing newlines", () => {
      const input = ["one", "two\nwith\nnewlines", "three"];
      const result = createCSVRow(input);
      expect(result).toBe('one,"two\nwith\nnewlines",three\n');
    });

    test("should handle empty strings", () => {
      const input = ["", "two", "three"];
      const result = createCSVRow(input);
      expect(result).toBe(",two,three\n");
    });
  });

  describe("createObjFromCSVLine", () => {
    test("should create an object from a CSV line", () => {
      const line = "one,two,three";
      const header = ["first", "second", "third"];
      const result = createObjFromCSVLine(line, header);
      expect(result).toEqual({ first: "one", second: "two", third: "three" });
    });

    test("should handle quoted fields", () => {
      const line = 'one,"two,with,commas",three';
      const header = ["first", "second", "third"];
      const result = createObjFromCSVLine(line, header);
      expect(result).toEqual({
        first: "one",
        second: "two,with,commas",
        third: "three",
      });
    });

    test("should handle double quotes within fields", () => {
      const line = 'one,"two""with""quotes",three';
      const header = ["first", "second", "third"];
      const result = createObjFromCSVLine(line, header);
      expect(result).toEqual({
        first: "one",
        second: 'two"with"quotes',
        third: "three",
      });
    });

    test("should handle newlines within fields", () => {
      const line = 'one,"two\nwith\nnewlines",three';
      const header = ["first", "second", "third"];
      const result = createObjFromCSVLine(line, header);
      expect(result).toEqual({
        first: "one",
        second: "two\nwith\nnewlines",
        third: "three",
      });
    });

    test("should handle empty fields", () => {
      const line = ",two,three";
      const header = ["first", "second", "third"];
      const result = createObjFromCSVLine(line, header);
      expect(result).toEqual({ first: "", second: "two", third: "three" });
    });
  });

  describe("createArrFromCSVLine", () => {
    test("should split a simple CSV line into an array of strings", () => {
      const line = "one,two,three";
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["one", "two", "three"]);
    });

    test("should handle quoted fields with commas", () => {
      const line = 'one,"two,with,commas",three';
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["one", "two,with,commas", "three"]);
    });

    test("should handle fields with double quotes", () => {
      const line = 'one,"two""with""quotes",three';
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["one", 'two"with"quotes', "three"]);
    });

    test("should handle fields with newlines", () => {
      const line = 'one,"two\nwith\nnewlines",three';
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["one", "two\nwith\nnewlines", "three"]);
    });

    test("should handle fields that are entirely quoted", () => {
      const line = '"one","two","three"';
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["one", "two", "three"]);
    });

    test("should handle empty fields", () => {
      const line = ",two,three";
      const result = createArrFromCSVLine(line);
      expect(result).toEqual(["", "two", "three"]);
    });
  });
});
