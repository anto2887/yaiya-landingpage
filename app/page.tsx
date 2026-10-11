import { site } from "@/content/site";

// M0 placeholder. Sections arrive in M1 to M3.
export default function Home() {
  return <main className="p-6">{site.meta.title}</main>;
}
