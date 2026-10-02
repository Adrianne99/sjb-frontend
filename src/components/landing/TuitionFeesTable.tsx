// "Tuition fee options" on the public website. The numbers come from the
// database (Settings → Tuition & fees), so the website always matches what
// the Accounting Office charges.
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";
import { feeService } from "@/services/fee.service";
import { formatMoney } from "@/utils/format";
import { SubHeading } from "./SectionHeading";

/** One payment note under the table: small gold label, the amount, a short explanation. */
function FeeNote({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/15 pt-5">
      <dt className="text-xs font-semibold tracking-[0.18em] text-gold-300 uppercase">{label}</dt>
      <dd className="mt-2 font-display text-xl font-light text-white">{value}</dd>
      <dd className="mt-1 text-sm leading-relaxed text-primary-200">{children}</dd>
    </div>
  );
}

const headCell = "px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.14em] text-ink-muted uppercase";

export function TuitionFeesTable() {
  const { data, loading, error } = useApi(() => feeService.listPublic(), []);
  const college = (data?.schedules ?? []).filter((row) => row.annualTuition === null);
  const seniorHigh = (data?.schedules ?? []).find((row) => row.annualTuition !== null);
  const sample = college[0];

  return (
    <div className="mt-20 sm:mt-24">
      <SubHeading
        title="Tuition fee options"
        description={`College fees are per term${sample ? ` (${formatMoney(sample.ratePerUnit)} per unit, including the ${formatMoney(sample.miscFee)} miscellaneous fee)` : ""}. Units may vary depending on the semester taken.`}
      />

      {loading ? (
        <Skeleton className="mt-8 h-56 bg-white/10" />
      ) : error || !data ? (
        <p className="mt-8 text-sm text-primary-100">Tuition information is not available right now. Please contact the Accounting Office.</p>
      ) : (
        <>
          {college.length > 0 && (
            <Reveal className="mt-8 overflow-x-auto rounded-xl bg-surface shadow-[0_24px_50px_-30px_rgba(0,0,0,0.6)]">
              <table className="w-full min-w-2xl text-sm">
                <caption className="sr-only">College tuition per term, paid in installments</caption>
                <thead className="border-b border-border">
                  <tr>
                    <th scope="col" className={`${headCell} text-left`}>Course &amp; year</th>
                    <th scope="col" className={`${headCell} text-right`}>Units</th>
                    <th scope="col" className={`${headCell} text-right`}>Down payment</th>
                    <th scope="col" className={`${headCell} text-right`}>Prelim</th>
                    <th scope="col" className={`${headCell} text-right`}>Midterm</th>
                    <th scope="col" className={`${headCell} text-right`}>Final</th>
                    <th scope="col" className={`${headCell} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {college.map((row) => (
                    <tr key={row.id}>
                      <th scope="row" className="px-4 py-4 text-left font-normal">
                        <span className="block font-medium text-primary-900">
                          {row.yearLevelLabel} {row.programCode}
                        </span>
                        <span className="block text-xs text-ink-muted">{row.programName}</span>
                      </th>
                      <td className="px-4 py-4 text-right text-ink-soft tabular-nums">{row.units}</td>
                      <td className="px-4 py-4 text-right text-ink-soft tabular-nums">{formatMoney(row.downPayment)}</td>
                      <td className="px-4 py-4 text-right text-ink-soft tabular-nums">{formatMoney(row.prelimPayment)}</td>
                      <td className="px-4 py-4 text-right text-ink-soft tabular-nums">{formatMoney(row.midtermPayment)}</td>
                      <td className="px-4 py-4 text-right text-ink-soft tabular-nums">{formatMoney(row.finalPayment)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-primary-900 tabular-nums">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}

          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {sample && (
              <>
                <FeeNote label="Early bird" value={`Less ${formatMoney(sample.earlyBirdDiscount)}`}>
                  Pay in full 1 month before the start of the term.
                </FeeNote>
                <FeeNote label="Cash payment" value={`Less ${formatMoney(sample.cashDiscount)}`}>
                  Pay in full up to the first day of classes.
                </FeeNote>
              </>
            )}
            {seniorHigh && (
              <FeeNote label="Senior High School" value="Free with voucher">
                Without a voucher: {formatMoney(seniorHigh.annualTuition)} for the whole school year (Grade 11–12).
              </FeeNote>
            )}
            <FeeNote label="Cross enrollment" value={`${formatMoney(data.crossEnrollmentFee)} per subject`}>
              For a 3-unit subject. Cash basis only.
            </FeeNote>
          </dl>
        </>
      )}
    </div>
  );
}
