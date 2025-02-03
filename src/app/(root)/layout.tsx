import KzkHeader from "@/components/kzk/layout/header";
import KzkSidebar from "@/components/kzk/layout/sidebar";
import { SessionProvider } from "@/lib/auth/session-context";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";
import {SIGN_IN_URL} from "@/lib/constants";

export const metadata = {
  title: "Kaizoku",
  description: "Manga Downloader",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect(SIGN_IN_URL);

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <KzkSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <KzkHeader />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
