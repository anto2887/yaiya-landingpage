import { SimpleHeader } from "@/components/sections/SimpleHeader";

/** Thank-you and privacy: a simple header, no nav links or waitlist button. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SimpleHeader />
      {children}
    </>
  );
}
