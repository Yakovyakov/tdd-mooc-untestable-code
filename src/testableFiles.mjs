import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";

// decouple the busniess logic from the file system.
// So, we make two functions that can be run in isolation: one which does the file reading,
// and another which does the data processing(CVS parsing).
// The contents of the file are passed as a parameter(csvData) to the function that processes it.

export async function readCsvFile(filePath) {
  return await readFile(filePath, { encoding: "utf8" });
}

// parsePeopleCsv function is no longer asynchronous, as it does not perform I/O operations.

export function parsePeopleCsv(csvData) {
  const records = parse(csvData, {
    skip_empty_lines: true,
    trim: true,
  });
  return records.map(([firstName, lastName, age, gender]) => {
    const person = {
      firstName,
      lastName,
      gender: gender.charAt(0).toLowerCase(),
    };
    if (age !== "") {
      person.age = parseInt(age);
    }
    return person;
  });
}
