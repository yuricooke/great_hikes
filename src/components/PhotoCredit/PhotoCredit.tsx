import type { Photo } from "@/lib/schema";
import styles from "./PhotoCredit.module.css";

type Props = {
  photo: Photo;
  className?: string;
};

/** "Photo: <author>" linking to the source — every displayed photo gets one (constitution III). */
export default function PhotoCredit({ photo, className }: Props) {
  const classes = [styles.credit, className].filter(Boolean).join(" ");
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
    </p>
  );
}
