import { describe, test, expect } from "@jest/globals";
import {
  createArrFromCSVLine,
  createCSVRow,
  createCSVRowFromObject,
  createObjFromCSVLine,
} from "../../app/core/database/utils.js";

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

  describe("createCSVRowFromObject", () => {
    test("should create a valid CSV row from an object", () => {
      const obj = {
        id: "1",
        name: "John",
        email: "john@example.com",
      };

      const header = ["id", "name", "email"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe("1,John,john@example.com");
    });

    test("should trim fields and create a valid CSV row", () => {
      const obj = {
        id: "  2  ",
        name: " Alice  ",
        email: "   alice@example.com   ",
      };

      const header = ["id", "name", "email"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe("2,Alice,alice@example.com");
    });

    test("should handle empty fields in the object", () => {
      const obj = {
        id: "3",
        name: "",
        email: "no-email@example.com",
      };

      const header = ["id", "name", "email"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe("3,,no-email@example.com");
    });

    test("should handle special characters like commas and quotes", () => {
      const obj = {
        id: "4",
        name: 'Jane, "Doe"',
        email: "jane@example.com",
      };

      const header = ["id", "name", "email"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe('4,"Jane, ""Doe""",jane@example.com');
    });

    test("should handle objects with different header order", () => {
      const obj = {
        id: "5",
        email: "jack@example.com",
        name: "Jack",
      };

      const header = ["name", "email", "id"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe("Jack,jack@example.com,5");
    });

    test("should create an empty CSV row when object fields are empty", () => {
      const obj = {
        id: "",
        name: "",
        email: "",
      };

      const header = ["id", "name", "email"];
      const csvRow = createCSVRowFromObject(obj, header);

      expect(csvRow).toBe(",,");
    });
  });
});
