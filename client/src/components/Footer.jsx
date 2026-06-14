import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 text-slate-200 px-4 py-4 border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-sm">
        <p>© {year} Aarogyam. All rights reserved.</p>
        <p className="text-slate-400">
          This website and its content are protected by copyright and may not be reused without permission.
        </p>
      </div>
    </footer>
  );
}
