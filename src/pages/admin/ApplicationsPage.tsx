// Online applications ("Enroll Now" on the website).
//
// When an applicant visits the Registrar's Office, open their application
// (search by reference number or name), check their documents, then:
//   - Create student record -> student + PENDING enrollment, filled in from the
//     application (nothing is typed twice). After they pay, mark the enrollment
//     Enrolled: their Student Portal account is then created and emailed.
//   - Reject -> with a reason.
import { TriangleAlert, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { Textarea } from "@/components/form/Textarea";
import { Modal } from "@/components/modal/Modal";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms, useSections, useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { applicationService } from "@/services/application.service";
import type { Application, ApplicationDetail } from "@/types";
import { formatDate, formatDateTime } from "@/utils/format";
import { APPLICANT_TYPE_LABELS, APPLICATION_STATUS_LABELS, toOptions, yearLevelOptions } from "@/utils/labels";
import { FilterBar } from "@/components/table/FilterBar";
import { clearedFilters, countActiveFilters } from "@/utils/filters";

/** Filters in the Filters panel (the search box is separate). */
const FILTER_KEYS = ["status", "programId"] as const;
/** Values that count as "no filter" (the page's own defaults). */
const FILTER_DEFAULTS = {status: "SUBMITTED"};

export default function ApplicationsPage() {
  useDocumentTitle("Applications");
  const programs = usePrograms();
  const [filters, setFilter, setFilters] = useQueryState({ search: "", status: "SUBMITTED", programId: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, loading, error, reload } = useApi(
    () => applicationService.list({ ...filters, pageSize: 20 }),
    [filters.search, filters.status, filters.programId, filters.page],
  );
  const waiting = (data?.meta as { waiting?: number } | undefined)?.waiting ?? 0;

  return (
    <>
      <PageHeader
        title="Applications"
        description={`Online pre-registrations from the website ("Enroll Now"). ${waiting} waiting for a visit to the Registrar's Office.`}
      />
      <Card>
        <FilterBar
          search={
            <SearchInput value={searchText} onChange={setSearchText} label="Search applications" placeholder="Reference no., name or email..." />
          }
          activeCount={countActiveFilters(filters, FILTER_KEYS, FILTER_DEFAULTS)}
          onClear={() => setFilters(clearedFilters(FILTER_KEYS))}
        >
          <Select label="Status" hideLabel placeholder="All statuses" value={filters.status} onChange={(event) => setFilter("status", event.target.value)} options={toOptions(APPLICATION_STATUS_LABELS)} />
          <Select
            label="Program"
            hideLabel
            placeholder="All programs"
            value={filters.programId}
            onChange={(event) => setFilter("programId", event.target.value)}
            options={(programs.data ?? []).map((program) => ({ value: String(program.id), label: program.name }))}
          />
        </FilterBar>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<Application>
              caption="Online applications"
              loading={loading}
              loadingLabel="Loading applications..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              onRowClick={(row) => setOpenId(row.id)}
              empty={{ title: "No applications match these filters.", description: "New online applications from the website appear here." }}
              columns={[
                {
                  header: "Applicant",
                  primary: true,
                  cell: (row) => (
                    <div>
                      <p className="font-medium text-primary-900">{row.fullName}</p>
                      <p className="text-xs text-ink-muted tabular-nums">{row.referenceNumber}</p>
                    </div>
                  ),
                },
                { header: "Program", cell: (row) => `${row.program.code} · ${row.yearLevelLabel}` },
                { header: "Type", cell: (row) => APPLICANT_TYPE_LABELS[row.applicantType], hideOnMobile: true },
                { header: "Submitted", cell: (row) => formatDate(row.createdAt), hideOnMobile: true },
                { header: "Status", cell: (row) => <StatusBadge kind="application" value={row.status} /> },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>

      <Modal open={openId !== null} onClose={() => setOpenId(null)} title="Application" size="lg">
        {openId !== null && <ApplicationReview id={openId} onChanged={reload} />}
      </Modal>
    </>
  );
}

function ApplicationReview({ id, onChanged }: { id: number; onChanged: () => void }) {
  const { can } = useAuth();
  const { data, loading, error, reload, setData } = useApi(() => applicationService.get(id), [id]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading application..." />;

  const changed = (updated: ApplicationDetail) => {
    setData(updated);
    onChanged();
  };
  const address = [data.addressLine, data.barangay, data.city, data.province, data.zipCode].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-primary-900">{data.fullName}</p>
          <p className="text-sm text-ink-muted tabular-nums">
            {data.referenceNumber} · submitted {formatDateTime(data.createdAt)}
          </p>
        </div>
        <StatusBadge kind="application" value={data.status} />
      </div>

      {data.possibleMatches.length > 0 && data.status === "SUBMITTED" && (
        <Alert tone="warning" title="This person may already have a student record">
          {data.possibleMatches.map((match) => (
            <span key={match.id} className="mr-3 inline-block">
              <Link to={`/admin/students/${match.id}`} className="font-medium underline">
                {match.studentNumber} {match.firstName} {match.lastName}
              </Link>{" "}
              ({match.status.toLowerCase()})
            </span>
          ))}
          <span className="block">Same name and birthdate. If it is the same person, enroll them from their existing record and reject this application.</span>
        </Alert>
      )}

      <div className="rounded-lg border border-border p-4">
        <DescriptionList
          items={[
            { label: "Program", value: `${data.program.code} — ${data.program.name}`, wide: true },
            { label: "Year level", value: data.yearLevelLabel },
            { label: "Applicant type", value: APPLICANT_TYPE_LABELS[data.applicantType] },
            { label: "Previous school", value: data.previousSchool },
            { label: "Date of birth", value: formatDate(data.dateOfBirth) },
            { label: "Sex", value: data.sex === "FEMALE" ? "Female" : "Male" },
            { label: "Email", value: data.email },
            { label: "Mobile number", value: data.contactNumber },
            { label: "Address", value: address || null, wide: true },
            { label: "Parent / guardian", value: [data.guardianName, data.guardianRelationship && `(${data.guardianRelationship})`, data.guardianContactNumber].filter(Boolean).join(" ") || null, wide: true },
          ]}
        />
      </div>

      {data.status === "CONVERTED" && data.student && (
        <Alert tone="success" title="Student record created">
          {data.reviewedBy ? `By ${data.reviewedBy}` : ""}
          {data.reviewedAt ? ` on ${formatDateTime(data.reviewedAt)}` : ""}. Mark the enrollment <strong>Enrolled</strong> after payment — the Student Portal account is then created and emailed automatically.
          <span className="mt-2 block">
            <Link to={`/admin/students/${data.student.id}`} className="font-medium underline">
              Open student {data.student.studentNumber}
            </Link>
          </span>
        </Alert>
      )}
      {data.status === "REJECTED" && (
        <Alert tone="info" title="Rejected">
          {data.remarks}
          {data.reviewedBy ? ` — ${data.reviewedBy}` : ""}
        </Alert>
      )}

      {data.status === "SUBMITTED" && can("applications:write") && (
        <>
          <ConvertForm application={data} onConverted={changed} />
          <RejectForm application={data} onRejected={changed} />
        </>
      )}
    </div>
  );
}

function ConvertForm({ application, onConverted }: { application: ApplicationDetail; onConverted: (updated: ApplicationDetail) => void }) {
  const toast = useToast();
  const { terms, currentTerm } = useTerms();
  const programs = usePrograms();
  const [semesterId, setSemesterId] = useState("");
  const [yearLevel, setYearLevel] = useState(String(application.yearLevel));
  const [sectionId, setSectionId] = useState("");
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  const termId = semesterId || String(currentTerm?.id ?? "");
  const term = terms.find((item) => String(item.id) === termId);
  const sections = useSections(term?.academicYearId);
  const program = (programs.data ?? []).find((item) => item.id === application.program.id);
  const sectionOptions = (sections.data ?? [])
    .filter((section) => section.programId === application.program.id && String(section.yearLevel) === yearLevel)
    .map((section) => ({ value: String(section.id), label: section.name }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await applicationService.convert(application.id, { semesterId: Number(termId), yearLevel: Number(yearLevel), sectionId: sectionId ? Number(sectionId) : null });
      toast.success("Student record created", `${response.data.student.studentNumber} — enrollment is Pending until payment.`);
      onConverted(response.data.application);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not create the student record", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-primary-200 bg-primary-50/40 p-4" noValidate>
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
          <UserPlus className="size-4" aria-hidden="true" /> Create student record
        </p>
        <p className="text-xs text-ink-muted">Do this when the applicant is at the Registrar&apos;s Office with their documents. Their details are copied from the application.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select label="Term" required value={termId} onChange={(event) => setSemesterId(event.target.value)} options={terms.map((item) => ({ value: String(item.id), label: item.label }))} error={errors.semesterId} />
        <Select
          label="Year level"
          required
          value={yearLevel}
          onChange={(event) => {
            setYearLevel(event.target.value);
            setSectionId("");
          }}
          options={yearLevelOptions(program?.yearLevels ?? [application.yearLevel])}
          error={errors.yearLevel}
        />
        <Select label="Section" placeholder="Assign later" value={sectionId} onChange={(event) => setSectionId(event.target.value)} options={sectionOptions} error={errors.sectionId} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={saving} leftIcon={<UserPlus className="size-4" aria-hidden="true" />}>
          Create student record
        </Button>
      </div>
    </form>
  );
}

function RejectForm({ application, onRejected }: { application: ApplicationDetail; onRejected: (updated: ApplicationDetail) => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} leftIcon={<TriangleAlert className="size-4" aria-hidden="true" />}>
          Reject application
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await applicationService.reject(application.id, remarks);
      toast.success("Application rejected");
      onRejected(response.data);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not reject", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border p-4" noValidate>
      <Textarea label="Reason" required rows={3} value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={500} error={errors.remarks} hint="Saved with the application (staff only)." />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="danger" loading={saving}>
          Reject
        </Button>
      </div>
    </form>
  );
}

