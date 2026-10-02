// Status badges with an icon + text + color for every status in the system.
//
//   <StatusBadge kind="enrollment" value="ENROLLED" />
import {
  Archive,
  Ban,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock,
  FileText,
  GraduationCap,
  Lock,
  Send,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  ANNOUNCEMENT_STATUS_LABELS,
  APPLICATION_STATUS_LABELS,
  ENROLLMENT_STATUS_LABELS,
  GRADE_REMARK_LABELS,
  GRADE_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  REQUIREMENT_STATUS_LABELS,
  STUDENT_STATUS_LABELS,
} from "@/utils/labels";
import { Badge, type BadgeTone } from "./Badge";

type Style = { tone: BadgeTone; icon: LucideIcon; label: string };

const STYLES = {
  enrollment: {
    PENDING: { tone: "warning", icon: Clock, label: ENROLLMENT_STATUS_LABELS.PENDING },
    ENROLLED: { tone: "success", icon: CircleCheck, label: ENROLLMENT_STATUS_LABELS.ENROLLED },
    DROPPED: { tone: "danger", icon: CircleX, label: ENROLLMENT_STATUS_LABELS.DROPPED },
    WITHDRAWN: { tone: "neutral", icon: Ban, label: ENROLLMENT_STATUS_LABELS.WITHDRAWN },
    COMPLETED: { tone: "info", icon: GraduationCap, label: ENROLLMENT_STATUS_LABELS.COMPLETED },
  },
  student: {
    ACTIVE: { tone: "success", icon: CircleCheck, label: STUDENT_STATUS_LABELS.ACTIVE },
    GRADUATED: { tone: "gold", icon: GraduationCap, label: STUDENT_STATUS_LABELS.GRADUATED },
    ARCHIVED: { tone: "neutral", icon: Archive, label: STUDENT_STATUS_LABELS.ARCHIVED },
  },
  grade: {
    DRAFT: { tone: "warning", icon: FileText, label: GRADE_STATUS_LABELS.DRAFT },
    PUBLISHED: { tone: "success", icon: Send, label: GRADE_STATUS_LABELS.PUBLISHED },
  },
  remark: {
    PASSED: { tone: "success", icon: CircleCheck, label: GRADE_REMARK_LABELS.PASSED },
    FAILED: { tone: "danger", icon: CircleX, label: GRADE_REMARK_LABELS.FAILED },
    INCOMPLETE: { tone: "warning", icon: TriangleAlert, label: GRADE_REMARK_LABELS.INCOMPLETE },
    DROPPED: { tone: "neutral", icon: Ban, label: GRADE_REMARK_LABELS.DROPPED },
  },
  payment: {
    RECORDED: { tone: "success", icon: CircleCheck, label: PAYMENT_STATUS_LABELS.RECORDED },
    VOIDED: { tone: "danger", icon: Ban, label: PAYMENT_STATUS_LABELS.VOIDED },
  },
  announcement: {
    DRAFT: { tone: "neutral", icon: FileText, label: ANNOUNCEMENT_STATUS_LABELS.DRAFT },
    PUBLISHED: { tone: "success", icon: Send, label: ANNOUNCEMENT_STATUS_LABELS.PUBLISHED },
    ARCHIVED: { tone: "neutral", icon: Archive, label: ANNOUNCEMENT_STATUS_LABELS.ARCHIVED },
  },
  application: {
    SUBMITTED: { tone: "warning", icon: Clock, label: APPLICATION_STATUS_LABELS.SUBMITTED },
    CONVERTED: { tone: "success", icon: CircleCheck, label: APPLICATION_STATUS_LABELS.CONVERTED },
    REJECTED: { tone: "neutral", icon: Ban, label: APPLICATION_STATUS_LABELS.REJECTED },
  },
  requirement: {
    PENDING: { tone: "warning", icon: Clock, label: REQUIREMENT_STATUS_LABELS.PENDING },
    SUBMITTED: { tone: "info", icon: FileText, label: REQUIREMENT_STATUS_LABELS.SUBMITTED },
    VERIFIED: { tone: "success", icon: CircleCheck, label: REQUIREMENT_STATUS_LABELS.VERIFIED },
  },
  account: {
    ACTIVE: { tone: "success", icon: CircleCheck, label: "Active" },
    INACTIVE: { tone: "neutral", icon: Ban, label: "Deactivated" },
    LOCKED: { tone: "danger", icon: Lock, label: "Locked" },
    TEMPORARY: { tone: "warning", icon: Clock, label: "Temporary password" },
  },
} satisfies Record<string, Record<string, Style>>;

type Kind = keyof typeof STYLES;

export function StatusBadge<K extends Kind>({ kind, value }: { kind: K; value: keyof (typeof STYLES)[K] }) {
  const style = (STYLES[kind] as Record<string, Style>)[value as string] ?? { tone: "neutral", icon: CircleDot, label: String(value) };
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {style.label}
    </Badge>
  );
}
