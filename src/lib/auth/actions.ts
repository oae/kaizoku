"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { generateId, Scrypt } from "lucia";
import { lucia } from "@/lib/auth";
import { db } from "@/server/db";
import {
  signInSchema,
  signupSchema,
  type SignInInput,
  type SignupInput,
} from "@/lib/validators/auth";
import { users } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function signIn(
  _: unknown,
  formData: FormData,
): Promise<ActionResponse<SignInInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signInSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
  });

  if (!existingUser) {
    return {
      formError: "Incorrect email or password",
    };
  }

  if (!existingUser?.hashedPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const validPassword = await new Scrypt().verify(
    existingUser.hashedPassword,
    password,
  );
  if (!validPassword) {
    return {
      formError: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function signUp(
  _: unknown,
  formData: FormData,
): Promise<ActionResponse<SignupInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        userName: err.fieldErrors.userName?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, userName, password } = parsed.data;

  const existingUser = await db.query.users.findFirst({
    where: (table, { eq, or, sql }) =>
      or(
        eq(table.email, email),
        eq(sql`LOWER(${table.userName})`, userName.toLowerCase()),
      ),
    columns: { email: true, userName: true },
  });

  if (existingUser?.email === email) {
    return {
      formError: "Cannot create account with that email",
    };
  }

  if (existingUser?.userName === userName) {
    return {
      formError: "Cannot create account with that username",
    };
  }

  const userId = generateId(21);
  const hashedPassword = await new Scrypt().hash(password);
  await db.insert(users).values({
    id: userId,
    userName,
    avatar: generateAvatarUrl(email),
    email,
    hashedPassword,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

const generateAvatarUrl = (emailAddress: string) => {
  const emailHash = crypto.createHash("md5").update(emailAddress).digest("hex");
  return `https://www.gravatar.com/avatar/${emailHash}?d=robohash`;
};

export async function signOut(): Promise<{ error: string } | void> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "No session found",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}
