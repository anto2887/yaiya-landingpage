import Image from "next/image";

type WordmarkProps = {
  alt: string;
  className?: string;
};

// logo.svg is 1712 x 606. Height is set by className; width follows.
export function Wordmark({ alt, className = "" }: WordmarkProps) {
  return (
    <Image src="/images/logo.svg" alt={alt} width={1712} height={606} unoptimized priority className={`w-auto ${className}`} />
  );
}
