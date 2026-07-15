import React, { useEffect, useRef, useState } from "react";

const IMAGES = [
  "/assets/landing-heroo.jpeg",
  "/assets/x.jpg",
  "/assets/y.jpg",
  "/assets/landing-hero33.jpg",
  "/assets/landing-hero44.jpg",
];

export default function Carousel({ interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, interval);
    return () => clearTimeout(timeoutRef.current);
  }, [index, interval]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setIndex((i) => (i + 1) % IMAGES.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goPrev = () => setIndex((i) => (i - 1 + IMAGES.length) % IMAGES.length);
  const goNext = () => setIndex((i) => (i + 1) % IMAGES.length);

  const handleTouchStart = (e) => {
    isDragging.current = true;
    touchEndX.current = 0;
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    isDragging.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      className="w-full overflow-hidden bg-black relative rounded-[24px] aspect-[3/2] sm:aspect-[5/3] md:aspect-[5/4] lg:aspect-video"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {IMAGES.map((src, i) => (
        <section
          key={src}
          className={`${i === index ? "block" : "hidden"} absolute inset-0 w-full h-full`}
        >
          <div className="h-full w-full flex items-center justify-center">
            <img
              src={src}
              alt={`slide-${i}`}
              className="w-full h-full object-cover carousel-image"
              draggable={false}
            />
          </div>
        </section>
      ))}

      <button
        aria-label="Previous"
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 md:p-4 text-lg sm:text-2xl md:text-3xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center"
      >
        ‹
      </button>

      <button
        aria-label="Next"
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 md:p-4 text-lg sm:text-2xl md:text-3xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center"
      >
        ›
      </button>
    </div>
  );
}
