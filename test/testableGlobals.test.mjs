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
  
    const userAtEnd = await users.getById(userId);
    expect(userAtEnd.passwordHash).to.equal(userAtStart.passwordHash);
    expect(argon2.verifySync(userAtEnd.passwordHash, "oldPassword")).to.be.true;
  });

});

describe("InMemoryUserDao", () => {
  let dao;
  let userIdSeq = 1;
  beforeEach(() => {
    dao = new InMemoryUserDao();
  });

  test("can get user by ID", async () => {
    const users = [
      {
        userId: ++userIdSeq,
        passwordHash: "passwordHashUser1",
      },
      {
        userId: ++userIdSeq,
        passwordHash: "passwordHashUser2",
      },
    ]
    users.forEach(async (user) => {
      await dao.save(user);
    })

    const user1InDb = await dao.getById(users[0].userId);
    const user2InBd = await dao.getById(users[1].userId);
    expect(user1InDb).to.deep.equal(users[0]);
    expect(user2InBd).to.deep.equal(users[1]);
    expect(await dao.getById(5)).to.equal(null);
  });

  test("can create and update user", async () => {
    const user = {
      userId: ++userIdSeq,
      passwordHash: "passwordHash",
    };
    await dao.save(user);
    expect(await dao.getById(user.userId)).to.deep.equal(user);

    user.passwordHash = "changedPasswordHash";

    expect(await dao.getById(user.userId)).to.not.deep.equal(user);
    await dao.save(user);
    expect(await dao.getById(user.userId)).to.deep.equal(user);
  });

});

