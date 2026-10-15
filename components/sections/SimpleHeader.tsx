import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/content/site";

/** Header for the thank-you and privacy pages: the wordmark only, linking home. */
export function SimpleHeader() {
  return (
    <header className="border-b border-line bg-cream">
      <Container className="flex h-nav items-center lg:h-nav-lg">
        <Link href="/" className="-m-2 inline-flex min-h-11 items-center rounded-small p-2">
          <Wordmark alt={site.nav.wordmarkAlt} className="h-[37px] lg:h-[46px]" />
        </Link>
      </Container>
    </header>
  );
}
