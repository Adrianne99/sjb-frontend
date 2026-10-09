// "Contact the school": a navy panel on the left (curved right edge on large
// screens) with the heading and Facebook button, and the contact details with
// gold round icons on the right. Details come from src/config/school.ts (contact).
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { school } from "@/config/school";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
  const { contact } = school;
  const items: Array<{ label: string; value: string; note?: string; icon: LucideIcon }> = [
    { label: "Address", value: contact.address, note: contact.addressNote, icon: MapPin },
    { label: "Phone", value: contact.phone, icon: Phone },
    { label: "Email", value: contact.email, icon: Mail },
    { label: "Office hours", value: contact.officeHours, icon: Clock },
  ];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative overflow-hidden bg-surface">
      {/* Navy half with a curved edge, reaching the left side of the screen (large screens). */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-1/2 rounded-r-[4rem] bg-primary-900 lg:block" />

      <div className="relative mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24">
        <div className="rounded-2xl bg-primary-900 p-8 sm:p-10 lg:rounded-none lg:bg-transparent lg:p-0 lg:pr-12">
          <SectionHeading
            id="contact-heading"
            title="Contact the school"
            inverted
            description="For admissions, enrollment and account concerns, reach the school through the official channels."
          />
          <a
            href={school.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full border border-white/60 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            <FacebookIcon className="size-4" />
            Follow us on Facebook
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <dl className="space-y-7 self-center">
          {items.map((item) => (
            <div key={item.label} className="grid grid-cols-[2.75rem_1fr] items-start gap-x-4 sm:grid-cols-[2.75rem_8rem_1fr]">
              <span className="flex size-11 items-center justify-center rounded-full bg-gold-400 text-primary-950" aria-hidden="true">
                <item.icon className="size-5" strokeWidth={1.75} />
              </span>
              <dt className="self-center text-sm font-semibold text-primary-900">{item.label}</dt>
              <dd className="col-start-2 self-center sm:col-start-3">
                <p className="text-base wrap-break-word text-ink-soft">{item.value}</p>
                {item.note && <p className="mt-1 text-xs text-ink-muted">{item.note}</p>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
