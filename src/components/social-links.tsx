import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";

export const SOCIAL_LINKS = [
  { label: "TikTok", href: "https://www.tiktok.com/@intechcomputer", icon: TikTokIcon },
  { label: "Facebook", href: "https://www.facebook.com/laptopnairobi/", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/intechcomputer/", icon: Instagram },
  { label: "WhatsApp", href: "https://wa.me/c/254728394362", icon: MessageCircle },
  { label: "X (Twitter)", href: "https://x.com/intechshop", icon: XIcon },
  { label: "YouTube", href: "https://www.youtube.com/@nairobielectronicstore", icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com/feed/", icon: Linkedin },
];

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.79a8.16 8.16 0 0 0 4.77 1.52V6.86a4.85 4.85 0 0 1-1.84-.17z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2H21l-6.564 7.5L22 22h-6.844l-4.78-6.244L4.8 22H2.046l7.03-8.03L2 2h7.02l4.327 5.72L18.244 2zm-1.197 18h1.83L7.04 4H5.08l11.967 16z" />
    </svg>
  );
}

export function SocialLinks({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div className={className ?? "flex flex-wrap items-center gap-3"}>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"
        >
          <s.icon className={iconClassName ?? "h-4 w-4"} />
        </a>
      ))}
    </div>
  );
}
