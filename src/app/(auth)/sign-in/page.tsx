import { SignInForm } from "@/app/(auth)/sign-in/sign-in";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Sign In | Kaizoku",
  description: "Sign in for Kaizoku",
};

export default async function SignUpPage() {
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <SignInForm />;
}
