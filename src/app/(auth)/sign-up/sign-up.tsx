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
import { signUp } from "@/lib/auth/actions";
import { useFormState } from "react-dom";
import {SIGN_IN_URL} from "@/lib/constants";

export function SignUpForm() {
  const [state, signUpAction] = useFormState(signUp, null);

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
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signUpAction}>
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
                  <Label htmlFor="userName">User Name</Label>
                  <Input
                    id="userName"
                    name="userName"
                    type="userName"
                    placeholder="Kaizoku"
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
                  Create an account
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href={SIGN_IN_URL} className="underline">
                  Sign in
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
