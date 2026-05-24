import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { SocialLinks } from "@/components/social-links";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Intech Computer Shop" },
      { name: "description", content: "Get in touch with Intech Computer Shop. Visit us in Nairobi or reach us by phone, email, or social media." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you. Reach us through any channel below.</p>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <InfoRow icon={<MapPin className="h-5 w-5" />} title="Address" body="World Business Centre, 3rd Floor" />
            <InfoRow icon={<Phone className="h-5 w-5" />} title="Phone" body={<a href="tel:+254728394362" className="hover:text-primary">+254 728 394 362</a>} />
            <InfoRow icon={<Mail className="h-5 w-5" />} title="Email" body={<a href="mailto:sales@intechcomputershop.co.ke" className="hover:text-primary break-all">sales@intechcomputershop.co.ke</a>} />
            <InfoRow icon={<Clock className="h-5 w-5" />} title="Hours" body={<>Mon–Sat 8:30am – 6:30pm<br />Sun 10am – 4pm</>} />

            <div className="pt-4">
              <h3 className="font-semibold mb-3">Follow us</h3>
              <SocialLinks className="flex flex-wrap items-center gap-2 text-foreground" />
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); toast.success("Message sent! We'll be in touch shortly."); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="bg-card border border-border rounded-xl p-5 space-y-3"
          >
            <h2 className="font-bold text-lg">Send us a message</h2>
            <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-background" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-background" />
            <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full h-11 px-3 rounded-md border border-border bg-background" />
            <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-background" />
            <button className="w-full h-11 bg-primary hover:bg-brand text-primary-foreground rounded-md font-bold">Send Message</button>
          </form>
        </div>
      </div>
    </SiteLayout>
  );
}

function InfoRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-accent text-primary grid place-items-center shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
