import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { school } from "@/config/school";
import { SectionHeading } from "./SectionHeading";

export function ContactSection() {
  const { contact } = school;
  const items = [
    { label: "Address", value: contact.address, note: contact.addressNote },
    { label: "Phone", value: contact.phone },
    { label: "Email", value: contact.email },
    { label: "Office hours", value: contact.officeHours },
  ];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-background py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:px-8">
        <div>
          <SectionHeading
            id="contact-heading"
            title="Contact the school"
            align="left"
            description="For admissions, enrollment and account concerns, reach the school through the official channels."
          />
          <a
            href={school.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-primary-900 uppercase"
          >
            <FacebookIcon className="size-4" />
            <span className="border-b border-primary-900/30 pb-1 transition-colors group-hover:border-gold-500">Follow us on Facebook</span>
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        {/* A clean list with thin dividers instead of icon cards. */}
        <dl className="divide-y divide-border border-y border-border">
          {items.map((item, index) => (
            <Reveal key={item.label} delay={index * 90} className="grid gap-1 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="text-xs font-semibold tracking-[0.2em] text-gold-700 uppercase sm:pt-1.5">{item.label}</dt>
              <dd>
                <p className="font-display text-lg font-light wrap-break-word text-primary-900 sm:text-xl">{item.value}</p>
                {item.note && <p className="mt-1 text-xs text-ink-muted">{item.note}</p>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
