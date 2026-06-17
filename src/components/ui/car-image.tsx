"use client";

import { useRef, useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useNearViewport } from "@/hooks/use-near-viewport";

interface CarImageProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
  /** Грузить за ~1 экран до появления (default: true). false — обычный lazy. */
  preloadAhead?: boolean;
}

export function CarImage({
  fallbackText = "Немає фото",
  className,
  preloadAhead = true,
  loading: loadingProp,
  ...props
}: CarImageProps) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const near = useNearViewport(imgRef);

  if (error || !props.src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground">
        <ImageOff className="h-6 w-6" />
        <span className="text-xs">{fallbackText}</span>
      </div>
    );
  }

  // next/image бросает при одновременных priority и loading="lazy". Поэтому при
  // priority не навязываем lazy/eager — пусть Next решает сам.
  const loading =
    preloadAhead && !props.priority ? (near ? "eager" : "lazy") : loadingProp;

  return (
    <Image
      {...props}
      ref={imgRef}
      loading={loading}
      className={className}
      onError={() => setError(true)}
    />
  );
}
