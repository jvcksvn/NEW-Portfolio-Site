/*
  Ported from App.tsx `LucidWordmark` (509), unchanged.

  01-build-spec.md section 5 overrides the design direction's ban on employer
  logos for this component specifically: the logo appears only inside the resume
  experience where it identifies an employer, never as page decoration or in site
  chrome, and the site never implies endorsement or current affiliation.
*/

export default function LucidWordmark({
  className = '',
  title,
}: {
  className?: string;
  title: string;
}) {
  return (
    <svg className={`lucid-wordmark ${className}`} viewBox="0 0 382 64" role="img" aria-label={title}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        <path d="M26 17v20c0 5 4 8 10 8h52" />
        <path d="M115 17v19c0 6 4 9 11 9h48c7 0 11-3 11-9V17" />
        <path d="M254 17h-24c-10 0-17 6-17 14s7 14 17 14h24" />
        <path d="M282 17v28" />
        <path d="M316 17h32c14 0 23 6 23 14s-9 14-23 14h-32z" />
      </g>
    </svg>
  );
}
