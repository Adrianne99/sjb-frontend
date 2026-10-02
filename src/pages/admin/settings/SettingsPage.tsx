// System settings (ADMIN only): academic setup, tuition fees, grading and portal permissions.
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryState } from "@/hooks/useQueryState";
import { AcademicTermsPanel } from "./AcademicTermsPanel";
import { FeesPanel } from "./FeesPanel";
import { InstructorsPanel, ProgramsPanel, RequirementTypesPanel, RoomsPanel, SectionsPanel, SubjectsPanel } from "./ReferencePanels";
import { GradingPanel, ProfileFieldsPanel } from "./SystemSettingsPanels";

const TABS = [
  { id: "terms", label: "Academic years & terms" },
  { id: "programs", label: "Programs" },
  { id: "sections", label: "Sections" },
  { id: "subjects", label: "Subjects" },
  { id: "instructors", label: "Instructors" },
  { id: "rooms", label: "Rooms" },
  { id: "requirements", label: "Requirements" },
  { id: "fees", label: "Tuition & fees" },
  { id: "grading", label: "Grading scale" },
  { id: "portal", label: "Student portal" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  useDocumentTitle("Settings");
  const [query, setQuery] = useQueryState({ tab: "terms" });
  const tab = query.tab as TabId;

  return (
    <>
      <PageHeader title="Settings" description="Academic setup and system configuration. Every change is recorded in the audit log." />
      <Tabs<TabId> label="Settings sections" value={tab} onChange={(id) => setQuery("tab", id === "terms" ? "" : id)} tabs={[...TABS]} />
      <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "terms" && <AcademicTermsPanel />}
        {tab === "programs" && <ProgramsPanel />}
        {tab === "sections" && <SectionsPanel />}
        {tab === "subjects" && <SubjectsPanel />}
        {tab === "instructors" && <InstructorsPanel />}
        {tab === "rooms" && <RoomsPanel />}
        {tab === "requirements" && <RequirementTypesPanel />}
        {tab === "fees" && <FeesPanel />}
        {tab === "grading" && <GradingPanel />}
        {tab === "portal" && <ProfileFieldsPanel />}
      </div>
    </>
  );
}
