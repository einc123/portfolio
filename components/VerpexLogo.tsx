type VerpexLogoProps = {
  className?: string;
};

/** Official Verpex wordmark from /public/verpex.svg */
export function VerpexLogo({
  className = "h-8 w-auto",
}: VerpexLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/verpex.svg"
      alt="Verpex"
      className={`inline-block object-contain object-left ${className}`}
      width={210}
      height={60}
    />
  );
}
