import Image from "next/image";

import { outboundPath, type Product } from "@/lib/products";
import Icon, { type IconName } from "../Icon";
import styles from "./ProductCard.module.css";

export const CATEGORY_ICON: Record<Product["category"], IconName> = {
  apparel: "apparel",
  jackets: "jacket",
  socks: "socks",
  footwear: "footwear",
  backpacks: "backpack",
  tents: "tent",
  climbing: "climbing",
  accessories: "accessories",
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Shop product: image, brand, name, price and a button to the partner store (new tab). */
export default function ProductCard({ product }: { product: Product }) {
  const sample = product.status === "sample";
  return (
    <article className={styles.card}>
      <a
        href={outboundPath(product)}
        target="_blank"
        rel="sponsored noopener"
        className={styles.imageLink}
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className={`${styles.media} ${styles[product.category]}`}>
          {product.image ? (
            <Image src={product.image} alt="" fill sizes="(min-width: 1200px) 22vw, (min-width: 768px) 30vw, 50vw" className={styles.image} />
          ) : (
            <span className={styles.placeholder}>
              <Icon name={CATEGORY_ICON[product.category]} size={64} />
              <span className={styles.placeholderText}>Photo from partner feed</span>
            </span>
          )}
          {sample && <span className={styles.badge}>Sample</span>}
        </div>
      </a>
      <div className={styles.body}>
        <p className={styles.brand}>{product.brand}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>
          {usd.format(product.price)}
          {sample && <span className={styles.priceNote}> sample price</span>}
        </p>
        <a href={outboundPath(product)} target="_blank" rel="sponsored noopener" className={styles.cta}>
          Shop at {product.retailer}
          <Icon name="openInNew" size={18} />
          <span className="visually-hidden">: {product.name} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
