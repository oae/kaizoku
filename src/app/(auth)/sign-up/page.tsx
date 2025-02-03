import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { SignUpForm } from "@/app/(auth)/sign-up/sign-up";

export const metadata = {
  title: "Sign Up | Kaizoku",
  description: "Sign up for Kaizoku",
};

export default async function SignUpPage() {
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <SignUpForm />;
}
