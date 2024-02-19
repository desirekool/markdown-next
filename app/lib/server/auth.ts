import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sql } from './db';
import config from './config';

export async function getJWTPayload() {
  const cookieStore = cookies();
  const token = cookieStore.get("jwt-token");

  const secret = new TextEncoder().encode(config.JWT_SECRET);
  const { payload, protectedHeader } = await jwtVerify(token?.value!, secret, { algorithms: ['HS256'] });
  return payload;
}

export async function getCurrentUser() {
  const payload = await getJWTPayload();
  const userRes = await sql(
    "select * from users where id = $1",
    [payload.sub]
  );
  return userRes.rows[0];
}