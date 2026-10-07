import Image from "next/image";

import styles from "./Background.module.css";

type Props = {
  src: string;
  /** Backgrounds are decorative; the same photo is described elsewhere on the page. */
  alt?: string;
  priority?: boolean;
};

/** Full-bleed fixed photo behind the page, with the identity's dark vignette. */
export default function BackgroundImage({ src, alt = "", priority = false }: Props) {
  return (
    <div className={styles.layer} aria-hidden={alt ? undefined : true}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        quality={70}
        className={styles.media}
      />
      <div className={styles.scrim} />
    </div>
  );
}
