import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HandNote } from "@/components/ui/HandNote";
import { site } from "@/content/site";

const { story } = site;

export function KonjacStory() {
  return (
    <section id="story" aria-labelledby="story-heading" className="relative overflow-x-clip border-y border-line bg-paper">
      <Container className="grid items-center gap-6 pb-10 lg:grid-cols-[30fr_40fr_30fr] lg:gap-8 lg:py-10">
        {/* Full bleed on mobile; bleeds off the left edge on desktop. */}
        <div className="relative -mx-4 aspect-[16/10] sm:-mx-6 lg:mr-0 lg:ml-[calc(-34px-max(0px,(100vw-1180px)/2))] lg:aspect-[4/3] lg:overflow-hidden lg:rounded-r-card">
          <Image src={story.image.src} alt={story.image.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>

        <div className="relative">
          <Eyebrow>{story.eyebrow}</Eyebrow>
          <h2 id="story-heading" className="mt-3 type-h2 text-ink lg:text-[34px]">
            {story.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-4 type-body text-ink">{story.body}</p>
        </div>

        <div className="relative -mt-2 flex flex-col items-end lg:mt-0 lg:items-center">
          <HandNote rotate={-6} mark="arrow" className="mb-1 self-end lg:mr-4">
            {story.note}
          </HandNote>
          <Image
            src={story.wobbie.src}
            alt={story.wobbie.alt}
            width={912}
            height={1194}
            sizes="(min-width: 1024px) 220px, 140px"
            className="-mb-14 w-[140px] lg:mb-0 lg:w-full lg:max-w-[220px] relative z-10 motion-safe:animate-float"
          />
        </div>
      </Container>
    </section>
  );
}
