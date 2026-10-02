// Grading scale and student-editable profile fields.
import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { Checkbox } from "@/components/form/Checkbox";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { settingsService } from "@/services/admin.service";
import { getErrorMessage } from "@/services/api";
import type { GradingConfig, StudentProfileField } from "@/types";
import { PROFILE_FIELD_LABELS } from "@/utils/labels";

const PRESETS: Array<{ label: string; config: GradingConfig }> = [
  { label: "College (1.00–5.00)", config: { scaleLabel: "1.00 – 5.00 (1.00 highest, 3.00 passing)", minGrade: 1, maxGrade: 5, passingGrade: 3, higherIsBetter: false, decimalPlaces: 2 } },
  { label: "Percentage (60–100)", config: { scaleLabel: "60 – 100 (75 passing)", minGrade: 60, maxGrade: 100, passingGrade: 75, higherIsBetter: true, decimalPlaces: 0 } },
];

/**
 * Grading scales: one DEFAULT scale, plus an optional scale per program level
 * (e.g. Senior High School uses 60–100 while College uses 1.00–5.00).
 */
export function GradingPanel() {
  const { data, loading, error, reload } = useApi(() => settingsService.get(), []);
  const programs = usePrograms();
  const [level, setLevel] = useState("");
  const [version, setVersion] = useState(0);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading settings..." />;

  const levels = [...new Set([...(programs.data ?? []).map((program) => program.level), ...Object.keys(data.gradingByLevel)])].sort();
  const overrideKey = Object.keys(data.gradingByLevel).find((name) => name.toLowerCase() === level.toLowerCase());
  const initial = level && overrideKey ? data.gradingByLevel[overrideKey] : data.grading;
  const refresh = () => {
    reload();
    setVersion((value) => value + 1);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-[minmax(0,22rem)_1fr] sm:items-end">
          <Select
            label="Which scale?"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            options={[
              { value: "", label: "Default scale (College and any level without its own)" },
              ...levels.map((name) => ({ value: name, label: `${name}${Object.keys(data.gradingByLevel).some((key) => key.toLowerCase() === name.toLowerCase()) ? " — own scale" : " — uses default"}` })),
            ]}
          />
          <p className="text-sm text-ink-muted">Grades always use the scale of the student's program level for that term.</p>
        </CardBody>
      </Card>
      {level && !overrideKey && <Alert tone="info">{level} currently uses the default scale. Save below to give it its own scale.</Alert>}
      <GradingForm key={`${level}-${version}`} initial={initial} level={level || undefined} hasOwnScale={Boolean(overrideKey)} onSaved={refresh} />
    </div>
  );
}

function GradingForm({ initial, level, hasOwnScale, onSaved }: { initial: GradingConfig; level?: string; hasOwnScale: boolean; onSaved: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({ ...initial, minGrade: String(initial.minGrade), maxGrade: String(initial.maxGrade), passingGrade: String(initial.passingGrade), decimalPlaces: String(initial.decimalPlaces) });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateGrading({
        scaleLabel: values.scaleLabel,
        minGrade: Number(values.minGrade),
        maxGrade: Number(values.maxGrade),
        passingGrade: Number(values.passingGrade),
        higherIsBetter: values.higherIsBetter,
        decimalPlaces: Number(values.decimalPlaces),
      }, level);
      toast.success(level ? `${level} grading scale saved` : "Default grading scale saved");
      onSaved();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={level ? `${level} grading scale` : "Default grading scale"}
        description="Used to validate grades, compute Passed/Failed and averages. Nothing about grading is hard-coded."
        actions={
          level && hasOwnScale ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await settingsService.removeGradingLevel(level);
                  toast.success(`${level} now uses the default scale`);
                  onSaved();
                } catch (error) {
                  toast.error("Could not change", getErrorMessage(error));
                }
              }}
            >
              Use the default scale instead
            </Button>
          ) : undefined
        }
      />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-sm text-ink-muted">Presets:</span>
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="secondary"
                size="sm"
                onClick={() =>
                  setValues({ ...preset.config, minGrade: String(preset.config.minGrade), maxGrade: String(preset.config.maxGrade), passingGrade: String(preset.config.passingGrade), decimalPlaces: String(preset.config.decimalPlaces) })
                }
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <TextInput label="Scale description" required value={values.scaleLabel} onChange={(event) => setValues({ ...values, scaleLabel: event.target.value })} error={errors.scaleLabel} hint="Shown on report cards." />
          <div className="grid gap-4 sm:grid-cols-4">
            <TextInput label="Lowest grade" type="number" step="any" value={values.minGrade} onChange={(event) => setValues({ ...values, minGrade: event.target.value })} error={errors.minGrade} />
            <TextInput label="Highest grade" type="number" step="any" value={values.maxGrade} onChange={(event) => setValues({ ...values, maxGrade: event.target.value })} error={errors.maxGrade} />
            <TextInput label="Passing grade" type="number" step="any" value={values.passingGrade} onChange={(event) => setValues({ ...values, passingGrade: event.target.value })} error={errors.passingGrade} />
            <Select
              label="Decimal places"
              value={values.decimalPlaces}
              onChange={(event) => setValues({ ...values, decimalPlaces: event.target.value })}
              options={[
                { value: "0", label: "0 (e.g. 85)" },
                { value: "1", label: "1 (e.g. 85.5)" },
                { value: "2", label: "2 (e.g. 1.75)" },
              ]}
            />
          </div>
          <Checkbox
            label="Higher numbers are better"
            description={values.higherIsBetter ? "Passing means the grade is at or ABOVE the passing grade (e.g. 0–100 scales)." : "Passing means the grade is at or BELOW the passing grade (e.g. 1.00 is the best on a 1.00–5.00 scale)."}
            checked={values.higherIsBetter}
            onChange={(event) => setValues({ ...values, higherIsBetter: event.target.checked })}
          />
          <Alert tone="warning">Changing the scale affects new grades only. Grades already saved keep their remarks.</Alert>
          <Button type="submit" loading={saving} leftIcon={<Save className="size-4" aria-hidden="true" />}>
            Save grading scale
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function ProfileFieldsPanel() {
  const { data, loading, error, reload } = useApi(() => settingsService.get(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading settings..." />;
  return <ProfileFieldsForm initial={data.studentEditableFields} />;
}

function ProfileFieldsForm({ initial }: { initial: StudentProfileField[] }) {
  const toast = useToast();
  const [selected, setSelected] = useState<StudentProfileField[]>(initial);
  const [saving, setSaving] = useState(false);
  const fields = Object.keys(PROFILE_FIELD_LABELS) as StudentProfileField[];

  async function save() {
    setSaving(true);
    try {
      await settingsService.updateStudentEditableFields(selected);
      toast.success("Student-editable fields saved");
    } catch (error) {
      toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Student-editable profile fields" description="Choose which contact details students may update themselves in the portal. Names, birthdate and academic information are always read-only." />
      <CardBody className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <Checkbox
              key={field}
              label={PROFILE_FIELD_LABELS[field]}
              checked={selected.includes(field)}
              onChange={(event) => setSelected((current) => (event.target.checked ? [...current, field] : current.filter((item) => item !== field)))}
            />
          ))}
        </div>
        <Button onClick={save} loading={saving} leftIcon={<Save className="size-4" aria-hidden="true" />}>
          Save
        </Button>
      </CardBody>
    </Card>
  );
}
