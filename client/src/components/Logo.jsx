import React from "react";

export default function Logo({ className = "flex items-center gap-2", iconClassName = "h-14 w-14 object-contain", title = "Aarogyam", showText = true, textClassName = "font-bold text-lg text-gray-900" }) {
  return (
    <div className={className}>
      <img
        src="/assets/aarogyam-logo.png"
        alt={`${title} logo`}
        className={`${iconClassName} filter brightness-110 contrast-125 saturate-150`}
        style={{ mixBlendMode: "multiply" }}
      />
      {showText && <span className={textClassName}>{title}</span>}
    </div>
  );
}
