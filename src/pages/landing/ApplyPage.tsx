// "Enroll Now" — online pre-registration.
//
// The applicant fills in this form and gets a reference number (also emailed).
// Then they visit the Registrar's Office with their documents, pay at the
// Accounting Office, and receive their Student Portal account once enrolled.
// Nothing is paid online.
import { ArrowRight, CircleCheck, FileCheck2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Card, CardBody } from "@/components/card/Card";
import { Checkbox } from "@/components/form/Checkbox";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { PageBanner } from "@/components/landing/PageBanner";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { getErrorMessage } from "@/services/api";
import { applicationService } from "@/services/application.service";
import type { ApplicationFormOptions, ApplicationInput, ApplicationReceipt } from "@/types";
import { APPLICANT_TYPE_LABELS, toOptions } from "@/utils/labels";

const EMPTY: ApplicationInput = {
  firstName: "",
  middleName: null,
  lastName: "",
  suffix: null,
  dateOfBirth: "",
  sex: "",
  email: "",
  contactNumber: "",
  addressLine: null,
  barangay: null,
  city: null,
  province: null,
  zipCode: null,
  guardianName: null,
  guardianRelationship: null,
  guardianContactNumber: null,
  programId: null,
  yearLevel: null,
  applicantType: "",
  previousSchool: null,
  privacyConsent: false,
  website: "",
};

const STEPS = [
  { title: "Apply online", text: "Fill in this form. You get a reference number by email." },
  { title: "Visit the Registrar", text: "Bring your reference number and the original documents." },
  { title: "Pay at the Accounting Office", text: "Down payment or full payment. Your payment option is chosen there." },
  { title: "Get your portal account", text: "Once enrolled, we email your class schedule and Student Portal login." },
];

export default function ApplyPage() {
  useDocumentTitle("Apply online");
  const options = useApi(() => applicationService.formOptions(), []);
  const [receipt, setReceipt] = useState<ApplicationReceipt | null>(null);

  return (
    <>
      <PageBanner title="Apply online" description="Pre-register for Senior High School or college, then complete your enrollment at the school." />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-16">
        <div>
          {receipt ? (
            <ApplicationReceived receipt={receipt} documents={options.data?.requirements ?? []} />
          ) : options.error ? (
            <ErrorState message={options.error} onRetry={options.reload} />
          ) : options.loading || !options.data ? (
            <LoadingState label="Loading the form..." />
          ) : (
            <ApplicationForm options={options.data} onSubmitted={(result) => {
              setReceipt(result);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} />
          )}
        </div>
        <aside className="space-y-6">
          <HowItWorks />
          {options.data && <DocumentsToBring documents={options.data.requirements} />}
        </aside>
      </div>
    </>
  );
}

function HowItWorks() {
  return (
    <Card>
      <CardBody>
        <h2 className="text-base font-semibold text-primary-900">How it works</h2>
        <ol className="mt-4 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-300 text-xs font-semibold text-gold-700" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{step.title}</p>
                <p className="text-xs leading-relaxed text-ink-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  );
}

function DocumentsToBring({ documents }: { documents: ApplicationFormOptions["requirements"] }) {
  if (documents.length === 0) return null;
  return (
    <Card>
      <CardBody>
        <h2 className="text-base font-semibold text-primary-900">Documents to bring</h2>
        <ul className="mt-3 space-y-2">
          {documents.map((document) => (
            <li key={document.name} className="flex gap-2 text-sm text-ink-soft">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
              {document.name}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">Bring the originals to the Registrar&apos;s Office. Nothing is uploaded online.</p>
      </CardBody>
    </Card>
  );
}

/** A titled group of fields. */
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <legend className="text-xs font-semibold tracking-[0.2em] text-gold-700 uppercase">{title}</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function ApplicationForm({ options, onSubmitted }: { options: ApplicationFormOptions; onSubmitted: (receipt: ApplicationReceipt) => void }) {
  const [values, setValues] = useState<ApplicationInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError } = useFormErrors();

  const program = options.programs.find((item) => item.id === values.programId);
  const text = (field: keyof ApplicationInput) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const optional = (field: keyof ApplicationInput) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value.trim() === "" ? null : event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await applicationService.submit(values);
      onSubmitted(response.data);
    } catch (submitError) {
      if (!setFromError(submitError)) setError(getErrorMessage(submitError));
      else setError("Please check the highlighted fields.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <CardBody className="space-y-8 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Pre-registration form</h2>
            <p className="mt-1 text-sm text-ink-muted">Fields marked * are required. This takes about 5 minutes.</p>
          </div>
          {error && <Alert tone="danger">{error}</Alert>}

          <FormSection title="Program">
            <Select
              label="I am a"
              required
              placeholder="Select..."
              value={values.applicantType}
              onChange={(event) => setValues({ ...values, applicantType: event.target.value as ApplicationInput["applicantType"] })}
              options={toOptions(APPLICANT_TYPE_LABELS)}
              error={errors.applicantType}
            />
            <Select
              label="Program"
              required
              placeholder="Select a program"
              value={values.programId ? String(values.programId) : ""}
              onChange={(event) => setValues({ ...values, programId: event.target.value ? Number(event.target.value) : null, yearLevel: null })}
              options={options.programs.map((item) => ({ value: String(item.id), label: `${item.name} (${item.level})` }))}
              error={errors.programId}
            />
            <Select
              label="Year level"
              required
              placeholder={program ? "Select a year level" : "Select a program first"}
              disabled={!program}
              value={values.yearLevel ? String(values.yearLevel) : ""}
              onChange={(event) => setValues({ ...values, yearLevel: event.target.value ? Number(event.target.value) : null })}
              options={(program?.yearLevels ?? []).map((level) => ({ value: String(level.value), label: level.label }))}
              error={errors.yearLevel}
            />
            <TextInput label="Previous school" value={values.previousSchool ?? ""} onChange={optional("previousSchool")} maxLength={200} error={errors.previousSchool} hint="Your last school attended." />
          </FormSection>

          <FormSection title="Personal information">
            <TextInput label="First name" required autoComplete="given-name" value={values.firstName} onChange={text("firstName")} maxLength={100} error={errors.firstName} />
            <TextInput label="Middle name" autoComplete="additional-name" value={values.middleName ?? ""} onChange={optional("middleName")} maxLength={100} error={errors.middleName} />
            <TextInput label="Last name" required autoComplete="family-name" value={values.lastName} onChange={text("lastName")} maxLength={100} error={errors.lastName} />
            <TextInput label="Suffix" value={values.suffix ?? ""} onChange={optional("suffix")} maxLength={20} placeholder="e.g. Jr." error={errors.suffix} />
            <TextInput label="Date of birth" type="date" required autoComplete="bday" value={values.dateOfBirth} onChange={text("dateOfBirth")} error={errors.dateOfBirth} />
            <Select
              label="Sex"
              required
              placeholder="Select..."
              value={values.sex}
              onChange={(event) => setValues({ ...values, sex: event.target.value as ApplicationInput["sex"] })}
              options={[
                { value: "FEMALE", label: "Female" },
                { value: "MALE", label: "Male" },
              ]}
              error={errors.sex}
            />
          </FormSection>

          <FormSection title="Contact details">
            <TextInput label="Email" type="email" required autoComplete="email" value={values.email} onChange={text("email")} error={errors.email} hint="We send your reference number and updates here." />
            <TextInput label="Mobile number" type="tel" required autoComplete="tel" inputMode="tel" value={values.contactNumber} onChange={text("contactNumber")} placeholder="0917 123 4567" error={errors.contactNumber} />
            <TextInput label="House no. / street" autoComplete="address-line1" value={values.addressLine ?? ""} onChange={optional("addressLine")} maxLength={255} className="sm:col-span-2" error={errors.addressLine} />
            <TextInput label="Barangay" value={values.barangay ?? ""} onChange={optional("barangay")} maxLength={100} error={errors.barangay} />
            <TextInput label="City / municipality" autoComplete="address-level2" value={values.city ?? ""} onChange={optional("city")} maxLength={100} error={errors.city} />
            <TextInput label="Province" autoComplete="address-level1" value={values.province ?? ""} onChange={optional("province")} maxLength={100} error={errors.province} />
            <TextInput label="ZIP code" inputMode="numeric" autoComplete="postal-code" value={values.zipCode ?? ""} onChange={optional("zipCode")} maxLength={10} error={errors.zipCode} />
          </FormSection>

          <FormSection title="Parent / guardian">
            <TextInput label="Full name" value={values.guardianName ?? ""} onChange={optional("guardianName")} maxLength={150} error={errors.guardianName} />
            <TextInput label="Relationship" value={values.guardianRelationship ?? ""} onChange={optional("guardianRelationship")} maxLength={50} placeholder="e.g. Mother" error={errors.guardianRelationship} />
            <TextInput label="Mobile number" type="tel" inputMode="tel" value={values.guardianContactNumber ?? ""} onChange={optional("guardianContactNumber")} error={errors.guardianContactNumber} />
          </FormSection>

          {/* Anti-spam "honeypot": hidden from people, bots fill it in. Must stay empty. */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={values.website} onChange={text("website")} />
            </label>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <Checkbox
              label="I agree to the data privacy notice"
              description={
                <>
                  Saint John Bosco will use this information only to process my application and enrollment, as explained in the{" "}
                  <Link to="/privacy" className="font-medium text-primary-700 underline">
                    Privacy Policy
                  </Link>{" "}
                  (Data Privacy Act of 2012).
                </>
              }
              checked={values.privacyConsent}
              onChange={(event) => setValues({ ...values, privacyConsent: event.target.checked })}
            />
            {errors.privacyConsent && <p className="text-sm text-danger-700">{errors.privacyConsent}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-ink-muted">No payment is made online. You pay at the school after your documents are checked.</p>
              <Button type="submit" loading={saving} className="rounded-full! px-6!" leftIcon={<Send className="size-4" aria-hidden="true" />}>
                Submit application
              </Button>
            </div>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}

function ApplicationReceived({ receipt, documents }: { receipt: ApplicationReceipt; documents: ApplicationFormOptions["requirements"] }) {
  return (
    <Card>
      <CardBody className="sm:p-10">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-700" aria-hidden="true">
          <CircleCheck className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-primary-900">Thank you, {receipt.firstName}! We received your application.</h2>
        <p className="mt-2 text-sm text-ink-muted">
          {receipt.program} · {receipt.yearLevel}. A copy was emailed to <span className="font-medium text-ink">{receipt.email}</span>.
        </p>

        <div className="mt-6 rounded-xl border border-gold-200 bg-gold-50 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-700 uppercase">Your reference number</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-wide text-primary-900 tabular-nums">{receipt.referenceNumber}</p>
          <p className="mt-1 text-xs text-ink-muted">Write it down or keep the email — the Registrar will ask for it.</p>
        </div>

        <h3 className="mt-8 text-base font-semibold text-primary-900">What to do next</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>Visit the Registrar&apos;s Office with your reference number{documents.length > 0 ? ` and these original documents: ${documents.map((item) => item.name).join(", ")}` : ""}.</li>
          <li>Pay at the Accounting Office (down payment or full payment).{receipt.feeNote ? ` ${receipt.feeNote}` : ""}</li>
          <li>Once you are officially enrolled, we will email your class schedule and your Student Portal login.</li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/#admissions" variant="secondary" rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
            Tuition fees &amp; requirements
          </ButtonLink>
          <ButtonLink to="/" variant="ghost">
            Back to home
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
