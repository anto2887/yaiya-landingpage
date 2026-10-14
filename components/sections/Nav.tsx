import Link from "next/link";
import { NavScrollState } from "@/components/NavScrollState";
import { WaitlistButton } from "@/components/ui/WaitlistButton";
import { Wordmark } from "@/components/ui/Wordmark";
import { site } from "@/content/site";

const { nav } = site;

export function Nav() {
  return (
    // Transparent over the hero at the top of the page; frosted once scrolled.
    <header
      id="site-header"
      className="group/header sticky top-0 z-40 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300 data-scrolled:border-line data-scrolled:bg-paper/90 data-scrolled:backdrop-blur-[12px]"
    >
      <NavScrollState />
      {/* Same edges as the hero copy (Hero.tsx), so the logo lines up with it on every width.
          Desktop: at the top of the page the items sit 28px lower over the hero; once
          scrolled they slide back into the frosted bar. */}
      <div className="flex h-nav w-full items-center justify-between gap-4 px-4 transition-transform duration-300 ease-out motion-reduce:transition-none sm:px-6 lg:h-nav-lg lg:translate-y-[28px] lg:px-[clamp(24px,6vw,96px)] lg:group-data-scrolled/header:translate-y-0">
        <Link href="#top" className="-m-2 inline-flex min-h-11 items-center rounded-small p-2">
          <Wordmark alt={nav.wordmarkAlt} className="h-[37px] lg:h-[46px]" />
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
      </div>
    </header>
  );
}
