'use server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { sql } from '@/app/lib/server/db';
import config from '@/app/lib/server/config';

const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

export type State = {
  errors?: {
    username?: string[];
    password?: string[];
    confirmPassword?: string[];
  },
  message?: string | null;
}

export async function signup(prevState: State, formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const result = signupSchema.safeParse({ username, password, confirmPassword, });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Invalid username or password" };
  }

  if (password !== confirmPassword) {
    return { errors: { confirmPassword: ["Passwords do not match"] }, message: "Passwords do not match" };
  }

  const userRes = await sql("select * from users where username = $1", [username,]);
  if (userRes.rowCount && userRes.rowCount > 0) {
    return { errors: { username: ["Username already taken"], }, message: "Username already taken" };
  }

  const hash = await bcrypt.hash(password?.toString()!, 10);
  const insertRes = await sql("insert into users (username, password) values ($1, $2) returning *", [username, hash]);

  if (insertRes.rowCount && insertRes.rowCount === 1) {
    const user = insertRes.rows[0];
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('2w')
      .sign(new TextEncoder().encode(config.JWT_SECRET));

    cookies().set("jwt-token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: Date.now() + (1000 * 60 * 60 * 24 * 14),
    });
    redirect("/dashboard");
  }

  return { errors: { username: ["Error creating user"] }, message: "Error creating user" };
}