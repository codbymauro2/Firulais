interface UserAvatarProps {
  name: string;
  avatarData?: string | null;
  avatarUrl?: string | null;
  size?: number; // px, default 40
  className?: string;
}

export default function UserAvatar({ name, avatarData, avatarUrl, size = 40, className = "" }: UserAvatarProps) {
  const src = avatarData ?? avatarUrl ?? null;
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      className={`rounded-full bg-[#2b9dee]/20 flex items-center justify-center overflow-hidden shrink-0 border border-[#2b9dee]/20 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-[#2b9dee] select-none" style={{ fontSize: size * 0.35 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
