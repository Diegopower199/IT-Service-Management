"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@mui/material";

import { getUserAvatar } from "../../services/userAvatarService";

interface UserAvatarProps {
  userId: number;
  size?: number;
  onAvatarStatusChange?: (hasAvatar: boolean) => void;
}

export default function UserAvatar({
  userId,
  size = 64,
  onAvatarStatusChange,
}: UserAvatarProps) {
  const [avatar, setAvatar] = useState<{
    userId: number;
    url: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const loadAvatar = async () => {
      try {
        const blob = await getUserAvatar(userId);

        if (!blob) {
          if (!cancelled) {
            setAvatar(null);
            onAvatarStatusChange?.(false);
          }
          return;
        }

        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setAvatar({
            userId,
            url: objectUrl,
          });

          onAvatarStatusChange?.(true);
        } else {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      } catch {
        if (!cancelled) {
          setAvatar(null);
        }
      }
    };

    void loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId, onAvatarStatusChange]);

  return (
    <Avatar
      src={avatar?.userId === userId ? avatar.url : undefined}
      sx={{
        width: size,
        height: size,
      }}
    />
  );
}
