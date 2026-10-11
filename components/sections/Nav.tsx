import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/content/site";

const { nav } = site;

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/94 backdrop-blur-[12px]">
      <Container className="flex h-nav items-center justify-between gap-4 lg:h-nav-lg">
        <Link href="#top" className="-m-2 inline-flex min-h-11 items-center rounded-small p-2">
          <Wordmark alt={nav.wordmarkAlt} className="h-6 lg:h-7" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {nav.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-small px-1 text-[14px] font-semibold text-ink transition-colors duration-150 hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <WaitlistButton href={nav.cta.href} size="compact" className="lg:h-12 lg:px-[22px] lg:text-[15px]">
          {nav.cta.label}
        </WaitlistButton>
      </Container>
    </header>
  );
}
