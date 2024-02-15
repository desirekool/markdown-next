import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import { getClient } from "@/app/lib/server/db";

async function seed() {
  const client = getClient();
  await client.connect();

  await client.query("begin");

  try {
    const hash = bcrypt.hashSync("123123", 10);

    console.log("creating demo user");
    await client.query(
      "insert into users (username, password) values ($1, $2) on conflict do nothing",
      ["demo", hash]
    );

    const demoUserRes = await client.query(
      "select id from users where username = 'demo'"
    );
    const demoUser = demoUserRes.rows[0];

    // insert notes for demo user
    const notes = Array.from({ length: 10 }, () => ({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      user_id: demoUser.id,
    }));

    notes.map(async (n) => {
      await client.query(
        "INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3 )",
        [n.title, n.content, n.user_id]
      )
    });

    const users = Array.from({ length: 10 }, () => ({
      username: faker.internet.userName(),
      password: hash,
    }));


    users.map(async (u) => {
      await client.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [u.username, u.password]
      )
    });

    const usersRes = await client.query(
      "select id from users order by created_at desc limit 10"
    );

    for (const user of usersRes.rows) {
      const notes = Array.from({ length: 10 }, () => ({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        user_id: user.id,
      }));

      notes.map(async (n) => {
        await client.query(
          "INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3 )",
          [n.title, n.content, n.user_id]
        )
      });
    }

    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    console.log(e);
  } finally {
    await client.end();
  }
}

seed();