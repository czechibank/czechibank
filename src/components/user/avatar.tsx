import { loreleiNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { User } from "@prisma/client";
import { useMemo } from "react";

export function UserAvatar({ image, size }: { image: User["image"]; size: number }) {
  const avatar = useMemo(() => {
    return createAvatar(loreleiNeutral, JSON.parse(image ?? "{}")).toDataUri();
  }, [image]); // Add image as dependency so it updates when image changes

  return <img className={`w-${size} h-${size} rounded-full`} src={avatar} alt="User avatar" />;
}
