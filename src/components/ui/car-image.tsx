"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

interface CarImageProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
}

export function CarImage({ fallbackText = "Немає фото", className, ...props }: CarImageProps) {
  const [error, setError] = useState(false);

  if (error || !props.src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground">
        <ImageOff className="h-6 w-6" />
        <span className="text-xs">{fallbackText}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      className={className}
      onError={() => setError(true)}
    />
  );
}
