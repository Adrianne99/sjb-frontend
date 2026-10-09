import { AboutSection } from "@/components/landing/AboutSection";
import { AdmissionsSection } from "@/components/landing/AdmissionsSection";
import { AnnouncementsSection } from "@/components/landing/AnnouncementsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { ValuesStrip } from "@/components/landing/ValuesStrip";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/** The landing page, top to bottom. Text lives in src/config/school.ts. */
export default function HomePage() {
  useDocumentTitle("");
  return (
    <>
      <HeroSection />
      <ValuesStrip />
      <ProgramsSection />
      <AboutSection />
      <AdmissionsSection />
      <AnnouncementsSection />
      <ContactSection />
    </>
  );
}
