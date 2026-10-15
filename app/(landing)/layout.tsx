import { Nav } from "@/components/sections/Nav";

/** The landing page: full nav with links and the waitlist button. */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
