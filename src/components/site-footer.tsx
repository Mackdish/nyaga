import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { SocialLinks } from "@/components/social-links";

export function SiteFooter() {
  return (
    <footer className="bg-brand-dark text-white/85 mt-12">
      <div className="container mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-black text-lg">i</div>
            <div className="font-extrabold text-white">Intech Computer Shop</div>
          </div>
          <p className="text-sm leading-relaxed">
            Kenya's trusted electronics retailer. Genuine products, warranty-backed and delivered nationwide.
          </p>
          <div className="mt-4">
            <SocialLinks />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Shop</h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary-glow">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Customer Care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-primary-glow">Help Center</Link></li>
            <li><Link to="/track-order" className="hover:text-primary-glow">Track Your Order</Link></li>
            <li><Link to="/returns" className="hover:text-primary-glow">Returns & Refunds</Link></li>
            <li><Link to="/warranty" className="hover:text-primary-glow">Warranty</Link></li>
            <li><Link to="/privacy" className="hover:text-primary-glow">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary-glow">Terms of Service</Link></li>
            <li><Link to="/contact" className="hover:text-primary-glow">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary-glow" />
              <span>World Business Centre, 3rd Floor</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary-glow" />
              <a href="tel:+254728394362" className="hover:text-primary-glow">+254 728 394 362</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-glow" />
              <a href="mailto:sales@intechcomputershop.co.ke" className="hover:text-primary-glow break-all">
                sales@intechcomputershop.co.ke
              </a>
            </li>
          </ul>
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-white/60 mb-2">We Accept</div>
            <div className="flex flex-wrap gap-2">
              {["M-PESA", "Visa", "Mastercard", "Airtel"].map((m) => (
                <span key={m} className="px-2.5 py-1 rounded bg-white text-brand-dark text-[11px] font-bold">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs text-white/60 flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Intech Computer Shop. All rights reserved.</div>
          <div>Designed by <a href="tel:+254705186502" className="text-primary-glow hover:text-white">Mackdish Solutions (0705186502)</a></div>
        </div>
      </div>
    </footer>
  );
}
