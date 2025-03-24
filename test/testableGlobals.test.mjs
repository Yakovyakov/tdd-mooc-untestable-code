import { afterEach, beforeEach, describe, test } from "vitest";
import { expect } from "chai";
import { InMemoryUserDao, PasswordService, PostgresUserDao } from "../src/testableGlobals.mjs";

import argon2 from "@node-rs/argon2";



describe("testableGlobals: enterprise application, test Password Service", () => {
  const userId = 1;
  let users;
  let service;
  beforeEach(() => {
    users = new InMemoryUserDao();
    service = new PasswordService(users);
  });
  
  test("Password Service can change password", async () => {
    const userAtStart = {
      userId,
      passwordHash: argon2.hashSync("oldPassword"),
    };
    await users.save(userAtStart);
  
    await service.changePassword(userId, "oldPassword", "newPassword");
  
    const userAtEnd = await users.getById(userId);
    expect(userAtEnd.passwordHash).to.not.equal(userAtStart.passwordHash);
    expect(argon2.verifySync(userAtEnd.passwordHash, "newPassword")).to.be.true;
  });

  test("Password Service If the previous password does not match, the password is not changed.", async () => {
    const userAtStart = {
      userId,
      passwordHash: argon2.hashSync("oldPassword"),
    };
    await users.save(userAtStart);
  
    let error;
    try {
      await service.changePassword(userId, "wrongPassword", "newPassword");
    } catch (e) {
      error = e;
    }
    expect(error).to.deep.equal(new Error("wrong old password"));
  
    // It's important to test that there were no unwanted side effects. It would be bad
    // if somebody could change the password without knowing the old password.
    const userAtEnd = await users.getById(userId);
    expect(userAtEnd.passwordHash).to.equal(userAtStart.passwordHash);
    expect(argon2.verifySync(userAtEnd.passwordHash, "oldPassword")).to.be.true;
  });

});

