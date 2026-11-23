
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
};

export default function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  size = "md",
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const initials = `${firstName?.trim().charAt(0) ?? ""}${
    lastName?.trim().charAt(0) ?? ""
  }` || "؟";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elf/10 font-semibold text-elf ring-1 ring-elf/15 ${sizeClasses[size]}`}
      aria-label={`تصویر ${firstName ?? ""} ${lastName ?? ""}`}
    >
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={`${firstName ?? ""} ${lastName ?? ""}`.trim() || "کاربر"}
          fill
          sizes="56px"
          unoptimized
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
