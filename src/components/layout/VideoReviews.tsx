"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { Play, X } from "lucide-react";

interface Review {
  id: string;
  title_ua: string;
  title_ru: string;
  title_en?: string;
  youtube_id: string;
  video_url: string;
  instagram_url: string;
  thumbnail_url: string;
  sort_order: number;
  is_active: boolean;
}

/**
 * Cropped Instagram embed — hides the top profile bar and bottom caption/footer,
 * leaving only the video. IG renders at min-width 326px, so we scale it to `width`.
 */
function InstagramEmbed({ url, width }: { url: string; width: number }) {
  // IG renders at 326px wide and always wraps the reel in a profile header,
  // a caption/"View more" footer, and black side pillars. We zoom in and
  // center on the video so all of that chrome is cropped away.
  const F = 0.76; // fraction of IG media width the video occupies
  const HEADER = 54; // IG header height (px @326)
  const OVERSCAN = 1.2; // extra zoom to crop the footer + any measurement slack
  const usableW = 326 * F; // video width in IG coords
  const videoH = (usableW * 16) / 9; // video height (assume 9:16 reel)
  const cx = 163; // horizontal center of the IG media (326 / 2)
  const cy = HEADER + videoH / 2; // vertical center of the video
  const boxH = (width * 16) / 9; // visible 9:16 window
  const scale = (width / usableW) * OVERSCAN;
  const mLeft = width / (2 * scale) - cx; // center video horizontally
  const mTop = boxH / (2 * scale) - cy; // center video vertically
  return (
    <div className="overflow-hidden bg-black" style={{ width, height: boxH }}>
      <div style={{ width: 326, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <iframe
          src={`${url}embed`}
          scrolling="no"
          allowFullScreen
          loading="lazy"
          style={{
            border: 0,
            width: 326,
            height: 720,
            marginTop: mTop,
            marginLeft: mLeft,
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export function VideoReviews() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [active, setActive] = useState<Review | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (active) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [active]);

  if (reviews.length === 0) return null;

  return (
    <section className="cv-section bg-section py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <div className="flex items-stretch gap-4">
            {/* Green accent bar */}
            <div className="w-1 shrink-0 rounded-full bg-brand-500" />
            <div>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                {locale === "ua" ? "Відгуки клієнтів" : locale === "en" ? "Customer Reviews" : "Отзывы клиентов"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                {locale === "ua"
                  ? "Більше 5125+ задоволених власників авто"
                  : locale === "en" ? "Over 5125+ satisfied car owners"
                  : "Более 5125+ довольных владельцев авто"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 sm:gap-5"
          style={{ scrollbarWidth: "none" }}
        >
          {reviews.map((review) => {
            const title = locale === "ua" ? review.title_ua : locale === "en" ? (review.title_en || review.title_ru || review.title_ua) : review.title_ru;
            const isYoutube = !!review.youtube_id;
            const isInstagram = !!review.instagram_url;
            const thumb =
              review.thumbnail_url ||
              (isYoutube
                ? `https://img.youtube.com/vi/${review.youtube_id}/mqdefault.jpg`
                : "");
            const igPoster = isInstagram && !review.thumbnail_url;
            const sourceLabel = isYoutube ? "YouTube" : isInstagram ? "Instagram" : "Відео";

            return (
              <div
                key={review.id}
                className="group relative shrink-0 w-52 cursor-pointer overflow-hidden rounded-2xl bg-zinc-900 shadow-md ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-500/40 sm:w-56"
                style={{ aspectRatio: "9/16" }}
                onClick={() => setActive(review)}
              >
                {/* Poster */}
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                  {thumb ? (
                    <img src={thumb} alt={title} className="h-full w-full object-cover" />
                  ) : igPoster ? (
                    <div className="pointer-events-none h-full w-full">
                      <InstagramEmbed url={review.instagram_url} width={224} />
                    </div>
                  ) : review.video_url ? (
                    <video
                      src={review.video_url}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
                  )}
                </div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 transition-opacity duration-300 group-hover:from-black/70" />

                {/* Source badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white">
                    {sourceLabel}
                  </span>
                </div>

                {/* Play button — scales up on hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-zinc-900 text-zinc-900 ml-0.5" />
                  </div>
                </div>

                {/* Title */}
                {title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-sm font-semibold leading-tight text-white drop-shadow-md">
                      {title}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {active.youtube_id ? (
              <iframe
                src={`https://www.youtube.com/embed/${active.youtube_id}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="border-0"
                style={{ width: "min(360px, 90vw)", aspectRatio: "9/16" }}
              />
            ) : active.instagram_url ? (
              // Native (unscaled) embed in the modal — no CSS transform, so playback is smooth
              <iframe
                src={`${active.instagram_url}embed`}
                scrolling="no"
                allowFullScreen
                className="block bg-white"
                style={{ border: 0, width: "min(400px, 92vw)", height: "min(88vh, 720px)" }}
              />
            ) : (
              <video
                src={active.video_url}
                autoPlay
                controls
                className="block"
                style={{ width: "min(360px, 90vw)", maxHeight: "90vh" }}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
