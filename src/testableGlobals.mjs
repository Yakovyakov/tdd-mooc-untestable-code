import argon2 from "@node-rs/argon2";
import pg from "pg";

// PostgresUserDoa was a singleton, it manage the database connection.
// In tests, we need to recreate the application many times.
// If we pass the connection object as a parameter in the constructor,
// the test has control over the database, we can also inject dependencies into the object.

export class PostgresUserDao {
  
  constructor (db) {
    this.db = db;
  }

  #rowToUser(row) {
    return { userId: row.user_id, passwordHash: row.password_hash };
  }

  async getById(userId) {
    const { rows } = await this.db.query(
      `select user_id, password_hash
       from users
       where user_id = $1`,
      [userId]
    );
    return rows.map(this.#rowToUser)[0] || null;
  }

  async save(user) {
    await this.db.query(
      `insert into users (user_id, password_hash)
       values ($1, $2)
       on conflict (user_id) do update
           set password_hash = excluded.password_hash`,
      [user.userId, user.passwordHash]
    );
  }
}

// The Password Service is coupled with the database.
// We could also pass the object that controls the database users as parameters to the constructor,
// so we can replace it with test doubles.

export class PasswordService {
  
  constructor(users) {
    this.users = users;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.users.getById(userId);
    if (!argon2.verifySync(user.passwordHash, oldPassword)) {
      throw new Error("wrong old password");
    }
    user.passwordHash = argon2.hashSync(newPassword);
    await this.users.save(user);
  }
}
