"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, GripVertical, ImageIcon } from "lucide-react";
import { MediaPicker } from "./MediaPicker";

interface ImageGridProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageGrid({ images, onChange }: ImageGridProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    dragNode.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    });
  }

  function handleDragEnd() {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const next = [...images];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      onChange(next);
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNode.current = null;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleMediaSelect(urls: string[]) {
    onChange([...images, ...urls]);
  }

  return (
    <>
      <div className="rounded-xl border bg-white p-6">
        <h3 className="mb-4 font-semibold">Фотографії</h3>
        <div className="mb-4 grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, i)}
              className={`group relative aspect-video overflow-hidden rounded-lg border transition-all ${
                overIndex === i && dragIndex !== null && dragIndex !== i
                  ? "border-brand-500 ring-2 ring-brand-500/30"
                  : ""
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1">
                <div className="cursor-grab rounded bg-black/40 p-0.5 text-white opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">
                  Обкладинка
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMediaPickerOpen(true)}
            className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <ImageIcon className="h-6 w-6" />
            <span className="text-[10px]">Обрати</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Перше фото буде обкладинкою. Перетягніть для зміни порядку.
        </p>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
}
