import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

const { footer } = site;

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream pt-6 pb-[72px] sm:pb-6">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <p className="max-w-[640px] type-footnote text-muted">{footer.disclaimer}</p>
        <div className="flex shrink-0 items-center gap-4 type-footnote text-muted">
          <span>{footer.copyright}</span>
          {footer.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
