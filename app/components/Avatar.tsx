"use client";

import { useState } from "react";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
};

export default function Avatar({ src, name, size = 32 }: AvatarProps) {
  const [error, setError] = useState(false);

  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=1f2937&color=fff&size=${size * 2}`;

  return (
    <div
      className="rounded-full overflow-hidden bg-base-300 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={!src || error ? fallback : src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
