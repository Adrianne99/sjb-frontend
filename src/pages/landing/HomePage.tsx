import { AboutSection } from "@/components/landing/AboutSection";
import { AdmissionsSection } from "@/components/landing/AdmissionsSection";
import { AnnouncementsSection } from "@/components/landing/AnnouncementsSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("");
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <AdmissionsSection />
      <AnnouncementsSection />
      <ContactSection />
    </>
  );
}
