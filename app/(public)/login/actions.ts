'use server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

import { sql } from '@/app/lib/server/db';
import config from '@/app/lib/server/config';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type State = {
  errors?: {
    username?: string[];
    password?: string[];
  },
  message?: string | null;
}

export const login = async (prevState: State, formData: FormData) => {
  const username = formData.get('username');
  const password = formData.get('password');

  const result = loginSchema.safeParse({ username, password });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Invalid username or password",
    };
  }

  const userRes = await sql(
    "select * from users where username = $1",
    [username,]
  );

  if (userRes.rowCount === 0) {
    return { errors: { username: ["Invalid username"], }, message: "User not found" };
  }

  const user = userRes.rows[0];
  const isMatch = await bcrypt.compare(password?.toString()!, user.password);
  if (isMatch) {
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id.toString())
      .setIssuedAt()
      .setExpirationTime('2w')
      .sign(new TextEncoder().encode(config.JWT_SECRET));
    const twoWeeks = 1000 * 60 * 60 * 24 * 14;
    cookies().set("jwt-token", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: Date.now() + twoWeeks,
    });

    redirect("/dashboard");
  }

  return { errors: { password: ["Invalid password"] }, message: "Invalid username or password" };
}

