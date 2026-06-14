import React, { useEffect, useRef, useState } from "react";

const IMAGES = [
  "/assets/landing-hero.jpeg",
  "/assets/landing-hero1.jpeg",
  "/assets/landing-hero2.jpeg",
  "/assets/landing-hero3.jpeg",
  "/assets/landing-hero4.jpeg",
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
      className="w-full h-screen overflow-hidden bg-black relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {IMAGES.map((src, i) => (
        <section
          key={src}
          className={`${i === index ? "block" : "hidden"} w-full h-screen`}
        >
          <div className="h-full overflow-y-auto flex items-start justify-center">
            <img
              src={src}
              alt={`slide-${i}`}
              className="w-full h-auto object-contain carousel-image"
              draggable={false}
            />
          </div>
        </section>
      ))}

      <button
        aria-label="Previous"
        onClick={goPrev}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 md:p-4 text-lg sm:text-2xl md:text-3xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center"
      >
        ‹
      </button>

      <button
        aria-label="Next"
        onClick={goNext}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 md:p-4 text-lg sm:text-2xl md:text-3xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center"
      >
        ›
      </button>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 sm:h-3 sm:w-3 rounded-full transition-colors duration-200 ${
              i === index ? "bg-white shadow-lg" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
