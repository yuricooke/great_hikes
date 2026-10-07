import type { Photo } from "@/lib/schema";
import styles from "./PhotoCredit.module.css";

type Props = {
  photo: Photo;
  className?: string;
};

/** Stock services credited as their guidelines ask: "Photo by <author> on <service>", both linked. */
const SERVICES: Record<string, string> = {
  "Unsplash License": "https://unsplash.com/?utm_source=great_hikes&utm_medium=referral",
  "Pexels License": "https://www.pexels.com",
};

/** "CC BY-SA 4.0" → its deed URL (attribution must name and link the license). */
function ccLicenseUrl(license: string): string | null {
  const m = /^CC (BY(?:-SA|-ND|-NC|-NC-SA|-NC-ND)?) (\d\.\d)$/.exec(license.trim());
  return m ? `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/` : null;
}

/** "Photo: <author>" linking to the source — every displayed photo gets one (constitution III). */
export default function PhotoCredit({ photo, className }: Props) {
  const classes = [styles.credit, className].filter(Boolean).join(" ");
  const service = SERVICES[photo.license];
  if (service) {
    const name = photo.license.replace(" License", "");
    return (
      <p className={classes}>
        Photo by{" "}
        <a href={photo.authorUrl ?? photo.sourceUrl ?? service} target="_blank" rel="noopener noreferrer">
          {photo.author}
        </a>{" "}
        on{" "}
        <a href={photo.sourceUrl ?? service} target="_blank" rel="noopener noreferrer">
          {name}
        </a>
      </p>
    );
  }
  const cc = ccLicenseUrl(photo.license);
  return (
    <p className={classes}>
      Photo:{" "}
      {photo.sourceUrl ? (
        <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
          {photo.author}
        </a>
      ) : (
        photo.author
      )}
      {cc && (
        <>
          {" · "}
          <a href={cc} target="_blank" rel="noopener noreferrer license">
            {photo.license}
          </a>
        </>
      )}
      {photo.license === "Public domain" && " · Public domain"}
    </p>
  );
}
