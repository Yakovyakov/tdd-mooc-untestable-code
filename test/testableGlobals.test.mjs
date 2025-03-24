import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from "vitest";
import { expect } from "chai";
import { InMemoryUserDao, PasswordService, PostgresUserDao } from "../src/testableGlobals.mjs";


import argon2 from "@node-rs/argon2";
import { exec } from 'child_process';

import pg from "pg";
import { promisify } from "util";


const execAsync = promisify(exec);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const user2InDb = await dao.getById(users[1].userId);
    expect(user1InDb).to.deep.equal(users[0]);
    expect(user2InDb).to.deep.equal(users[1]);
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

async function isPostgresReady(host, port, user, password, database, maxAttempts = 10) {
  const pool = new pg.Pool({
    host,
    port,
    user,
    password,
    database,
    max: 1,
    idleTimeoutMillis: 5000,
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await sleep(2000);
    }
  }
}

async function connectTestDb() {
  const service = "db";
  const privatePort = "5432";

  const resultPort = await execAsync(`docker compose port ${service} ${privatePort}`);
  const [host, port] = resultPort.stdout.trim().split(":");
  
  const psResult =  await execAsync(`docker compose ps --quiet ${service}`);
  const containerId = psResult.stdout.trim();

  const inspectResult = await execAsync(`docker inspect ${containerId}`);
  const envJson = JSON.parse(inspectResult.stdout)[0].Config.Env;
  const env = envJson
    .map((s) => s.split("="))
    .reduce((m, [k, v]) => {
      m[k] = v;
      return m;
    }, {});
  await isPostgresReady(
    host,
    port,
    env.POSTGRES_USER,
    env.POSTGRES_PASSWORD,
    env.POSTGRES_USER,
  );

  return new pg.Pool({
    host,
    port,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_USER,
  });
}

describe("PostgresUserDao", () => {
  let dao;
  let db;
  let userIdSeq = 100;

  // We have to 
  beforeAll(async () => {
    
    db = await connectTestDb();

    // drop-tables.sql
    await db.query("drop table if exists users;");

    // create-tables.sql
    await db.query("create table users(user_id integer primary key,password_hash varchar(100) not null);");

    dao = new PostgresUserDao(db);
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
    ];
    await Promise.all(users.map(async (user) => {
      await dao.save(user);
      const manualCheck = await dao.db.query('SELECT * FROM users WHERE user_id = $1', [user.userId]);
    }));

    const user1InDb = await dao.getById(users[0].userId);
    const user2InDb = await dao.getById(users[1].userId);
    expect(user1InDb).to.deep.equal(users[0]);
    expect(user2InDb).to.deep.equal(users[1]);
    expect(await dao.getById(5)).to.equal(null);
  });

  afterAll(async () => {
    await db.end()
  });
});
