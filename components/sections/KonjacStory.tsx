import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HandNote } from "@/components/ui/HandNote";
import { site } from "@/content/site";
import { WaveTop } from "@/components/ui/WaveTop";

const { story } = site;

export function KonjacStory() {
  return (
    <section id="story" aria-labelledby="story-heading" className="relative bg-highlight py-section">
      <WaveTop fill="fill-cream" />
      <Container>
        {/* One mint panel, same container width as every other section. */}
        <div data-reveal className="relative mt-14 grid grid-cols-1 gap-6 rounded-card bg-mint-soft p-4 sm:p-6 lg:mt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-10">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[18px]">
            <Image src={story.image.src} alt={story.image.alt} fill sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" />
          </div>

          <div className="relative lg:pt-10">
            <Eyebrow>{story.eyebrow}</Eyebrow>
            <h2 id="story-heading" className="mt-3 type-h2 text-ink">
              {story.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-4 type-body text-ink">{story.body}</p>
            <HandNote rotate={-5} mark="arrow" className="mt-4">
              {story.note}
            </HandNote>
          </div>

          {/* Wobbie peeks over the panel's top edge and waves. */}
          <Image
            src={story.wobbie.src}
            alt={story.wobbie.alt}
            width={912}
            height={1194}
            sizes="(min-width: 1024px) 150px, 96px"
            className="absolute -top-16 right-4 w-[96px] origin-bottom motion-safe:animate-wave lg:-top-24 lg:right-10 lg:w-[150px]"
          />
        </div>
      </Container>
    </section>
  );
}
