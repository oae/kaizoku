"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/actions";
import { useFormState } from "react-dom";
import {SIGN_UP_URL} from "@/lib/constants";

export function SignInForm() {
  const [state, signInAction] = useFormState(signIn, null);
  return (
    <>
      <div className="grid h-screen place-items-center">
        <Card className="z-10 mx-auto max-w-sm">
          <CardHeader className="items-center">
            <Image
              src="/kaizoku-logo.png"
              alt="Kaizoku logo"
              priority
              width={100}
              height={100}
            />
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your information to Sign In to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInAction}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" />
                </div>
                {state?.fieldError ? (
                  <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                    {Object.values(state.fieldError).map((err) => (
                      <li className="ml-4" key={err}>
                        {err}
                      </li>
                    ))}
                  </ul>
                ) : state?.formError ? (
                  <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                    {state?.formError}
                  </p>
                ) : null}
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href={SIGN_UP_URL} className="underline">
                  Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="fixed z-0 h-full w-full bg-auth-page bg-cover bg-center bg-no-repeat blur"></div>
      </div>
    </>
  );
}
