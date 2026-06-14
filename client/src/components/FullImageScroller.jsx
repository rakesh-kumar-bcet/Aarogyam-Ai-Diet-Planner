import React from "react";

export default function FullImageScroller({ src, alt = "Full image", className = "" }) {
  return (
    <div
      className={`w-full min-h-screen overflow-y-auto bg-transparent ${className}`}
      style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto block"
        style={{ display: "block", maxWidth: "100%" }}
      />
    </div>
  );
}
