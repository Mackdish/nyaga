import { ImgHTMLAttributes, ReactNode, useState } from "react";

export type FallbackImageProps = {
  src?: string;
  fallback?: ReactNode;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

export function FallbackImage({ src, fallback, alt, ...props }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <>{fallback ?? <div className="grid place-items-center h-full w-full text-3xl">🖼️</div>}</>;
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}
