type SpaceshipLogoProps = {
  className?: string;
};

/** Wordmark from /public/spaceship.svg — tinted via currentColor. */
export function SpaceshipLogo({
  className = "h-7 w-[10.875rem]",
}: SpaceshipLogoProps) {
  return (
    <span
      role="img"
      aria-label="Spaceship"
      className={`inline-block bg-current ${className}`}
      style={{
        aspectRatio: "199 / 32",
        mask: "url(/spaceship.svg) left center / contain no-repeat",
        WebkitMask: "url(/spaceship.svg) left center / contain no-repeat",
      }}
    />
  );
}
