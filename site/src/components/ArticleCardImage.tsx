"use client";
import { useState } from "react";

export function ArticleCardImage({
  src,
  alt,
  className,
  children,
}: {
  src: string | null;
  alt: string;
  className: string;
  children: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{children}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
