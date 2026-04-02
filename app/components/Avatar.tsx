"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
};

const blurDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function Avatar({ src, name, size = 32 }: AvatarProps) {
  const [error, setError] = useState(false);
  const showImage = Boolean(src) && !error;
  const imageSrc = src ?? "";

  return (
    <div
      className="rounded-full overflow-hidden bg-base-300 flex items-center justify-center relative"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={imageSrc}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
          className="object-cover"
          fill
          sizes={`${size}px`}
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      ) : (
        <span
          className="font-medium text-white/90"
          style={{ fontSize: Math.max(12, Math.round(size * 0.38)) }}
          aria-hidden="true"
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
