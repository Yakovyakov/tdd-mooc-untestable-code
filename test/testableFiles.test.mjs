import { describe, test } from "vitest";
import { expect } from "chai";
import { parsePeopleCsv, readCsvFile } from "../src/testableFiles.mjs";

// example input:
// Loid,Forger,,Male
// Anya,Forger,6,Female
// Yor,Forger,27,Female

describe("CSV parsing", () => {
  test("parses name", () => {
    const recordPersons = parsePeopleCsv("Anya,Forger,6,Female");
    expect(recordPersons.length).to.equal(1);
    const person = recordPersons[0];
    expect(person.firstName).to.equal("Anya");
    expect(person.lastName).to.equal("Forger");
  });

  test("parses age", () => {
    expect(parsePeopleCsv("Anya,Forger,6,Female")[0].age).to.equal(6);
    expect(parsePeopleCsv("Loid,Forger,,Male")[0].age).to.equal(undefined);
  });

  test("parses gender", () => {
    expect(parsePeopleCsv("Loid,Forger,,male")[0].gender).to.equal("m");
    expect(parsePeopleCsv("Loid,Forger,,Male")[0].gender).to.equal("m");
    expect(parsePeopleCsv("Anya,Forger,6,female")[0].gender).to.equal("f");
    expect(parsePeopleCsv("Anya,Forger,6,Female")[0].gender).to.equal("f");
  });

  test("parser can skips empty lines", () => {
    const csvData = `
		name1,lastname1,1,Male

		name2,lastname2,1,Male



		name3,lastname3,1,Male
		`;
    expect(parsePeopleCsv(csvData)).to.deep.equal([
      { firstName: "name1", lastName: "lastname1", age: 1, gender: "m" },
      { firstName: "name2", lastName: "lastname2", age: 1, gender: "m" },
      { firstName: "name3", lastName: "lastname3", age: 1, gender: "m" },
    ]);
  });

  test("parser can trims whitespace", () => {
    const csvData = "  name1  ,  lastname1  ,  1  ,  Male  ";
    expect(parsePeopleCsv(csvData)).to.deep.equal([{ firstName: "name1", lastName: "lastname1", age: 1, gender: "m" }]);
  });

  test("parse CSV", () => {
    const csvData = `
      Loid,Forger,,Male
      Anya,Forger,6,Female
      Yor,Forger,27,Female`;
    expect(parsePeopleCsv(csvData)).to.deep.equal([
      { firstName: "Loid", lastName: "Forger", gender: "m" },
      { firstName: "Anya", lastName: "Forger", age: 6, gender: "f" },
      { firstName: "Yor", lastName: "Forger", age: 27, gender: "f" },
    ]);
  });
});

describe("Test readCsvFile function", () => {
  test("can read a file", async () => {
    const data = await readCsvFile("./test/dummy.txt");

    expect(data).to.equal("dummy file\n");
  });
});
