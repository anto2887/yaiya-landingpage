import { Nav } from "@/components/sections/Nav";
import { WobbieCursor } from "@/components/WobbieCursor";
import { site } from "@/content/site";

/** The landing page: full nav with links and the waitlist button. */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <WobbieCursor lines={site.wobbie.cursor} />
    </>
  );
}
