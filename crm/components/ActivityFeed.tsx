"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  FileText,
  FileStack,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  ArrowUpRight,
  UserPlus,
  Globe,
  Zap,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { Activity, Message, Task } from "@/crm/types";
import { api } from "@/crm/lib/api";
import { getCachedCurrentUser, prefetchCurrentUser } from "@/crm/lib/currentUserCache";
import TaskDetailPanel from "@/crm/components/TaskDetailPanel";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Type config — each activity type maps to an icon + a chip style.   */
/*                                                                     */
/*  EXACT ICONS (lucide-react):                                        */
/*    header  -> Activity                                              */
/*    note    -> FileText    (single note)                            */
/*    note    -> FileStack   (grouped notes, via per-event override)  */
/*    email    -> Mail / MessageSquare / MessageCircle (by channel)       */
/*    email    -> Zap badge when sent by workflow (no author)             */
/*    email    -> author initials when sent manually                      */
/*    call    -> Phone                                                 */
/*    deal    -> ArrowUpRight                                          */
/*    lead    -> UserPlus                                              */
/*    system  -> Globe        (avatar for actor-less events)           */
/*    toggle  -> ChevronDown                                           */
/* ------------------------------------------------------------------ */
type TimelineEventType = "note" | "email" | "call" | "deal" | "lead";

/** Inline colors so backgrounds always render (dynamic Tailwind classes can be purged). */
const TYPE_COLORS: Record<
  TimelineEventType,
  { primary: { bg: string; fg: string }; secondary: { bg: string; fg: string } }
> = {
  note: {
    primary: { bg: "#F5F3FF", fg: "#7C3AED" },
    secondary: { bg: "#FAF8FF", fg: "#7C3AED" },
  },
  email: {
    primary: { bg: "#EFF6FF", fg: "#2563EB" },
    secondary: { bg: "#F5F9FF", fg: "#2563EB" },
  },
  call: {
    primary: { bg: "#FFF7ED", fg: "#EA580C" },
    secondary: { bg: "#FFFBF5", fg: "#EA580C" },
  },
  deal: {
    primary: { bg: "#FFFBEB", fg: "#D97706" },
    secondary: { bg: "#FFFDF5", fg: "#D97706" },
  },
  lead: {
    primary: { bg: "#ECFDF5", fg: "#047857" },
    secondary: { bg: "#F4FDF9", fg: "#047857" },
  },
};

/** Collapsed multi-note groups — indigo, distinct from single-note violet. */
const NOTE_GROUP_COLORS = {
  primary: { bg: "#EEF2FF", fg: "#4338CA" },
  secondary: { bg: "#F5F7FF", fg: "#4338CA" },
};

function eventColors(event: Pick<TimelineEvent, "type" | "children">) {
  if (event.type === "note" && event.children?.length) return NOTE_GROUP_COLORS;
  return TYPE_COLORS[event.type];
}

const TYPE_ICONS: Record<TimelineEventType, LucideIcon> = {
  note: FileText,
  email: Mail,
  call: Phone,
  deal: ArrowUpRight,
  lead: UserPlus,
};

const FILTERS: { key: "all" | TimelineEventType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "email", label: "Emails" },
  { key: "call", label: "Calls" },
  { key: "deal", label: "Deals" },
  { key: "lead", label: "Leads" },
];

type TimelineChild = { text: string; timestamp: Date };

type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  actor: string;
  action: string;
  avatar?: string;
  /** Shown beside the timeline node (e.g. website source globe on lead.created). */
  sourceIcon?: LucideIcon;
  timestamp: Date;
  preview?: string;
  children?: TimelineChild[];
  callRecordingUrl?: string;
  callTranscript?: string;
  /** Optional override for the timeline node icon (e.g. grouped notes use FileStack). */
  icon?: LucideIcon;
  taskId?: string;
  taskClickable?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function dayLabel(date: Date) {
  const startOf = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const diff = Math.round((startOf(new Date()).getTime() - startOf(date).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getHourBucket(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function displayActor(
  author: { id: string; fullName: string } | null | undefined,
  currentUserId: string | null,
  fallback = "Someone"
) {
  if (!author) return fallback;
  if (currentUserId && author.id === currentUserId) return "You";
  return author.fullName;
}

function isTaskActivityType(type: string) {
  return type === "task.created" || type === "task.completed";
}

function getTaskIdFromActivity(activity: Activity) {
  const id = activity.metadata?.taskId;
  return typeof id === "string" && id ? id : null;
}

function canUserEditTask(task: Task, userId: string | null) {
  if (!userId) return false;
  return task.createdById === userId || task.assigneeId === userId;
}

function mapActivityType(apiType: string): TimelineEventType {
  if (apiType === "internal.comment") return "note";
  if (apiType.includes("message") || apiType.includes("email")) return "email";
  if (apiType.includes("call")) return "call";
  if (apiType.startsWith("lead.")) return "lead";
  return "deal";
}

function messageChannelIcon(channel: string): LucideIcon {
  const c = channel.toUpperCase();
  if (c === "SMS") return MessageSquare;
  if (c === "WHATSAPP") return MessageCircle;
  return Mail;
}

function messageChannelNoun(channel: string): string {
  const c = channel.toUpperCase();
  if (c === "SMS") return "SMS";
  if (c === "WHATSAPP") return "WhatsApp message";
  return "email";
}

function messageReplyAction(channel: string, subject?: string): string {
  const c = channel.toUpperCase();
  const base =
    c === "SMS" ? "replied via SMS" : c === "WHATSAPP" ? "replied on WhatsApp" : "replied via email";
  return subject ? `${base} · "${subject}"` : base;
}

/** Drop trailing "| location" segments templates append to email subjects. */
function cleanActivitySubject(subject: string): string {
  const cleaned = subject.split(/\s+\|\s+/)[0]?.trim() ?? subject.trim();
  return cleaned || subject.trim();
}

function messageSentDetail(
  activity: Activity,
  messagesById?: Map<string, Pick<Message, "subject" | "toAddress">>,
  templatesById?: Map<string, string>
): string | undefined {
  const meta = activity.metadata ?? {};

  if (typeof meta.templateName === "string" && meta.templateName.trim()) {
    return meta.templateName.trim();
  }

  const templateMatch = activity.description.match(/\(Template:\s*(.+?)\)/i);
  if (templateMatch?.[1]?.trim()) return templateMatch[1].trim();

  const templateId = typeof meta.templateId === "string" ? meta.templateId : null;
  if (templateId && templatesById?.get(templateId)) {
    return templatesById.get(templateId);
  }

  if (typeof meta.subject === "string" && meta.subject.trim()) {
    return cleanActivitySubject(meta.subject);
  }
  const messageId = typeof meta.messageId === "string" ? meta.messageId : null;
  const fromMessage = messageId ? messagesById?.get(messageId)?.subject : null;
  if (fromMessage?.trim()) return cleanActivitySubject(fromMessage);

  const fromDesc = activity.description.match(/sent ·\s*"([^"]+)"/i);
  return fromDesc?.[1] ? cleanActivitySubject(fromDesc[1]) : undefined;
}

function parseMessageReceived(activity: Activity, leadName?: string): {
  actor: string;
  action: string;
  icon: LucideIcon;
  avatar?: string;
} {
  const meta = activity.metadata ?? {};
  const channel = String(meta.channel ?? "EMAIL");
  const subject = meta.subject ? cleanActivitySubject(String(meta.subject)) : undefined;
  const actor = leadName?.trim() || "Lead";

  return {
    actor,
    action: messageReplyAction(channel, subject),
    icon: messageChannelIcon(channel),
    avatar: initials(actor),
  };
}

function parseMessageSent(
  activity: Activity,
  currentUserId: string | null,
  messagesById?: Map<string, Pick<Message, "subject" | "toAddress">>,
  templatesById?: Map<string, string>
): {
  actor: string;
  action: string;
  icon: LucideIcon;
  avatar?: string;
  sourceIcon?: LucideIcon;
  preview?: string;
} {
  const meta = activity.metadata ?? {};
  const channel = String(meta.channel ?? "EMAIL");
  const icon = messageChannelIcon(channel);
  const noun = messageChannelNoun(channel);
  const detail = messageSentDetail(activity, messagesById, templatesById);
  const authorName = activity.author?.fullName;

  if (!activity.author) {
    return {
      actor: "Workflow",
      action: detail ? `sent ${noun} · "${detail}"` : `sent ${noun}`,
      icon,
      sourceIcon: Zap,
    };
  }

  return {
    actor: displayActor(activity.author, currentUserId),
    action: detail ? `sent ${noun} · "${detail}"` : `sent an ${noun}`,
    icon,
    avatar: authorName ? initials(authorName) : undefined,
  };
}

function parseActorAction(
  activity: Activity,
  currentUserId: string | null
): { actor: string; action: string; preview?: string } {
  const desc = activity.description;
  const authorName = activity.author?.fullName;

  if (activity.type === "internal.comment" && authorName) {
    return { actor: displayActor(activity.author, currentUserId), action: "added an internal note" };
  }

  if (activity.type === "lead.created") {
    const from = desc.replace(/^Lead created from\s+/i, "").trim();
    const message =
      typeof activity.metadata?.message === "string"
        ? activity.metadata.message.trim().replace(/\s+/g, " ")
        : "";
    return {
      actor: "Lead created",
      action: `from ${from.toLowerCase()}`,
      preview: message || undefined,
    };
  }

  if (activity.type === "lead.duplicate_intake") {
    return { actor: "Duplicate intake", action: desc.replace(/^Duplicate intake\s+/i, "").trim() || desc };
  }

  if (activity.type === "lead.additional_quote") {
    const level =
      typeof activity.metadata?.surveyLevel === "string" ? activity.metadata.surveyLevel.replace(/_/g, " ") : "";
    return {
      actor: "Additional quote",
      action: level ? `requested ${level.toLowerCase()}` : desc,
    };
  }

  if (activity.type === "workflow.wait_skipped") {
    const sent =
      (typeof activity.metadata?.detail === "string" && activity.metadata.detail.trim()) ||
      (typeof activity.metadata?.stepLabel === "string" && activity.metadata.stepLabel.trim()) ||
      "";
    return {
      actor: displayActor(activity.author, currentUserId),
      action: sent ? `skipped the wait · sent ${sent}` : "skipped the wait and sent the next step now",
    };
  }

  if (activity.type === "stage.changed") {
    const stage = desc.replace(/^Stage (changed to\s+)?/i, "").trim();
    return { actor: "Stage", action: stage ? `moved to ${stage}` : "updated" };
  }

  if (activity.type === "payment.received") {
    return { actor: "Payment", action: "received" };
  }

  if (activity.type === "payment_link.clicked") {
    return { actor: "Payment link", action: "opened" };
  }

  if (activity.type === "cadence.stopped") {
    const reason =
      typeof activity.metadata?.reasonLabel === "string"
        ? activity.metadata.reasonLabel
        : typeof activity.metadata?.reason === "string"
          ? String(activity.metadata.reason).replace(/_/g, " ")
          : undefined;
    return {
      actor: "Cadence",
      action: reason ? `stopped — ${reason}` : "stopped",
    };
  }

  if (activity.type === "customer.opt_out") {
    return {
      actor: "Customer",
      action: desc.toLowerCase().includes("opted out")
        ? desc.replace(/^Customer\s+/i, "").trim() || "opted out — cadence stopped"
        : "opted out — cadence stopped",
    };
  }

  if (activity.type.includes("call")) {
    const meta = activity.metadata ?? {};
    const extras: string[] = [];
    if (typeof meta.durationSeconds === "number" && meta.durationSeconds > 0) {
      extras.push(`${meta.durationSeconds}s`);
    }
    if (typeof meta.recordingUrl === "string") extras.push("Recording available");
    if (typeof meta.transcript === "string") extras.push("Transcript available");
    return {
      actor: authorName ? displayActor(activity.author, currentUserId) : "Call",
      action: authorName ? "logged a call" : desc,
      preview: extras.length ? extras.join(" · ") : authorName ? desc : undefined,
    };
  }

  if (activity.type === "task.created") {
    const title = desc.replace(/^Task created:\s*/i, "").trim();
    return {
      actor: displayActor(activity.author, currentUserId, "Workflow"),
      action: title ? `created a task · "${title}"` : "created a task",
    };
  }

  if (activity.type === "task.completed") {
    const title = desc.replace(/^Task completed:\s*/i, "").trim();
    return {
      actor: displayActor(activity.author, currentUserId),
      action: title ? `completed a task · "${title}"` : "completed a task",
    };
  }

  if (activity.type === "lead.tag_added") {
    const tag = desc.replace(/^Tag added:\s*/i, "").trim();
    return {
      actor: displayActor(activity.author, currentUserId),
      action: tag ? `added a tag · "${tag}"` : "added a tag",
    };
  }

  if (activity.type === "lead.tag_removed") {
    const tag = desc.replace(/^Tag removed:\s*/i, "").trim();
    return {
      actor: displayActor(activity.author, currentUserId),
      action: tag ? `removed a tag · "${tag}"` : "removed a tag",
    };
  }

  if (authorName && desc.toLowerCase().startsWith(authorName.toLowerCase())) {
    const action = desc.slice(authorName.length).trim();
    return { actor: displayActor(activity.author, currentUserId), action: action || "updated activity" };
  }

  return { actor: authorName ? displayActor(activity.author, currentUserId) : "System", action: desc };
}

function canCollapseTogether(group: Activity[], activity: Activity) {
  if (activity.type !== "internal.comment") return false;
  const anchor = group[0];
  if (anchor.type !== "internal.comment") return false;
  return (
    anchor.author?.id === activity.author?.id &&
    getHourBucket(anchor.createdAt) === getHourBucket(activity.createdAt)
  );
}

function groupActivities(activities: Activity[]): Activity[][] {
  const groups: Activity[][] = [];

  for (const activity of activities) {
    const last = groups[groups.length - 1];
    if (last && canCollapseTogether(last, activity)) {
      last.push(activity);
    } else {
      groups.push([activity]);
    }
  }

  return groups;
}

function activitiesToEvents(
  activities: Activity[],
  currentUserId: string | null,
  taskById: Map<string, Task>,
  leadName?: string,
  messagesById?: Map<string, Pick<Message, "subject" | "toAddress">>,
  templatesById?: Map<string, string>
): TimelineEvent[] {
  return groupActivities(activities).map((group) => {
    const primary = group[0];
    const type = mapActivityType(primary.type);
    const timestamp = new Date(primary.createdAt);
    const authorName = primary.author?.fullName;

    if (group.length > 1 && primary.type === "internal.comment") {
      const actor = displayActor(primary.author, currentUserId);
      return {
        id: primary.id,
        type: "note",
        actor,
        action: `logged ${group.length} internal notes`,
        avatar: authorName ? initials(authorName) : undefined,
        timestamp,
        icon: FileStack,
        children: group.map((activity) => ({
          text: activity.description,
          timestamp: new Date(activity.createdAt),
        })),
      };
    }

    if (primary.type === "message.sent") {
      const msg = parseMessageSent(primary, currentUserId, messagesById, templatesById);
      return {
        id: primary.id,
        type: "email",
        actor: msg.actor,
        action: msg.action,
        icon: msg.icon,
        avatar: msg.avatar,
        sourceIcon: msg.sourceIcon,
        preview: msg.preview,
        timestamp: new Date(primary.createdAt),
      };
    }

    if (primary.type === "message.received") {
      const msg = parseMessageReceived(primary, leadName);
      return {
        id: primary.id,
        type: "email",
        actor: msg.actor,
        action: msg.action,
        icon: msg.icon,
        avatar: msg.avatar,
        timestamp: new Date(primary.createdAt),
      };
    }

    const { actor, action, preview } = parseActorAction(primary, currentUserId);
    const useGlobe = primary.type === "lead.created" && !authorName;
    const taskId = getTaskIdFromActivity(primary);
    const task = taskId ? taskById.get(taskId) : undefined;
    const taskClickable =
      isTaskActivityType(primary.type) &&
      Boolean(taskId && task && canUserEditTask(task, currentUserId));
    const callMeta = primary.type.includes("call") ? (primary.metadata ?? {}) : null;
    const callRecordingUrl =
      callMeta && typeof callMeta.recordingUrl === "string" ? callMeta.recordingUrl : undefined;
    const callTranscript =
      callMeta && typeof callMeta.transcript === "string" ? callMeta.transcript : undefined;

    return {
      id: primary.id,
      type,
      actor,
      action,
      avatar: useGlobe ? undefined : authorName ? initials(authorName) : undefined,
      sourceIcon: useGlobe ? Globe : undefined,
      timestamp,
      preview,
      callRecordingUrl,
      callTranscript,
      taskId: taskId ?? undefined,
      taskClickable,
    };
  });
}

const COLLAPSE_TRANSITION = { type: "spring", stiffness: 420, damping: 36, mass: 0.85 } as const;

function NoteCollapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="notes"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={COLLAPSE_TRANSITION}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={COLLAPSE_TRANSITION}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TimelineBadge({
  colors,
  icon: Icon,
  label,
}: {
  colors: { primary: { bg: string; fg: string }; secondary: { bg: string; fg: string } };
  icon?: LucideIcon;
  label?: string;
}) {
  const { bg, fg } = colors.secondary;
  return (
    <span
      style={{ backgroundColor: bg, color: fg }}
      className="relative z-10 flex h-6 w-6 flex-none shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
    >
      {Icon ? <Icon className="h-3 w-3" strokeWidth={2} /> : label}
    </span>
  );
}

function Node({
  type,
  icon,
  colors,
}: {
  type: TimelineEventType;
  icon?: LucideIcon;
  colors: { primary: { bg: string; fg: string }; secondary: { bg: string; fg: string } };
}) {
  const Icon = icon ?? TYPE_ICONS[type];
  const { bg, fg } = colors.primary;
  return (
    <span
      style={{ backgroundColor: bg, color: fg }}
      className="relative z-10 flex h-8 w-8 flex-none shrink-0 items-center justify-center rounded-full"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

function Event({
  event,
  expanded,
  onToggle,
  onTaskClick,
  showConnector,
}: {
  event: TimelineEvent;
  expanded: boolean;
  onToggle: () => void;
  onTaskClick?: (taskId: string) => void;
  showConnector: boolean;
}) {
  const colors = eventColors(event);

  return (
    <li
      className={cn(
        "group relative rounded-md px-2 py-2 transition-colors",
        event.taskClickable
          ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
      )}
      onClick={
        event.taskClickable && event.taskId && onTaskClick
          ? () => onTaskClick(event.taskId!)
          : undefined
      }
      onKeyDown={
        event.taskClickable && event.taskId && onTaskClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTaskClick(event.taskId!);
              }
            }
          : undefined
      }
      role={event.taskClickable ? "button" : undefined}
      tabIndex={event.taskClickable ? 0 : undefined}
    >
      <div className="relative flex items-center gap-2.5">
        {showConnector && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 z-0 w-0.5 -translate-x-1/2 bg-[#D4D1C8] dark:bg-neutral-600"
            style={{ bottom: "-1rem" }}
          />
        )}
        <div className="relative z-10 flex shrink-0 items-center gap-1.5">
          <Node type={event.type} icon={event.icon} colors={colors} />
          {event.sourceIcon && <TimelineBadge colors={colors} icon={event.sourceIcon} />}
          {!event.sourceIcon && event.avatar && (
            <TimelineBadge colors={colors} label={event.avatar} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-sm text-neutral-900 dark:text-neutral-100">
              <span className="font-medium">{event.actor}</span> {event.action}
              {event.preview && (
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                  {" "}
                  · {event.preview}
                </span>
              )}
            </p>

            {event.children && (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <motion.span
                  animate={{ rotate: expanded ? 0 : -90 }}
                  transition={COLLAPSE_TRANSITION}
                  className="inline-flex shrink-0"
                >
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                </motion.span>
                {expanded
                  ? `Hide ${event.children.length} notes`
                  : `Show ${event.children.length} notes`}
              </button>
            )}

            <span className="shrink-0 whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500">
              {timeAgo(event.timestamp)}
            </span>
          </div>

          {event.children && (
            <NoteCollapse open={expanded}>
              <ul className="mt-2 flex flex-col gap-2 border-l-2 border-neutral-200 py-1 pl-4 dark:border-neutral-800">
                {event.children.map((child, i) => (
                  <li
                    key={i}
                    className="flex justify-between gap-3 text-[13px] text-neutral-500 dark:text-neutral-400"
                  >
                    <span>{child.text}</span>
                    <span className="flex-none whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500">
                      {timeAgo(child.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            </NoteCollapse>
          )}

          {event.type === "call" && (event.callRecordingUrl || event.callTranscript) && (
            <div className="mt-2 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              {event.callRecordingUrl && (
                <a
                  href={event.callRecordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex font-medium text-(--color-primary) hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Listen to recording
                </a>
              )}
              {event.callTranscript && (
                <p className="whitespace-pre-wrap rounded-md bg-neutral-50 px-3 py-2 text-[13px] leading-relaxed dark:bg-neutral-900">
                  {event.callTranscript}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ActivityFeed({
  activities,
  leadName,
  messages = [],
}: {
  activities: Activity[];
  leadName?: string;
  /** Used to recover subject/recipient for older message.sent activities. */
  messages?: Message[];
}) {
  const [filter, setFilter] = useState<"all" | TimelineEventType>("all");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => getCachedCurrentUser()?.id ?? null
  );
  const [taskById, setTaskById] = useState<Map<string, Task>>(() => new Map());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; fullName: string }>>([]);
  const [templatesById, setTemplatesById] = useState<Map<string, string>>(() => new Map());

  const messagesById = useMemo(() => {
    const map = new Map<string, Pick<Message, "subject" | "toAddress">>();
    for (const message of messages) {
      map.set(message.id, {
        subject: message.subject,
        toAddress: message.toAddress,
      });
    }
    return map;
  }, [messages]);

  useEffect(() => {
    prefetchCurrentUser().then((user) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  useEffect(() => {
    api
      .getMentionSuggestions()
      .then((res) => setTeamMembers(res.users.map((u) => ({ id: u.id, fullName: u.fullName }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const needsLookup = activities.some((activity) => {
      if (activity.type !== "message.sent") return false;
      const meta = activity.metadata ?? {};
      if (typeof meta.templateName === "string" && meta.templateName.trim()) return false;
      return typeof meta.templateId === "string" && Boolean(meta.templateId);
    });
    if (!needsLookup) return;

    let cancelled = false;
    void api
      .listTemplates()
      .then((res) => {
        if (cancelled) return;
        const map = new Map<string, string>();
        for (const template of res.items) {
          map.set(template.id, template.name);
        }
        setTemplatesById(map);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activities]);

  const taskIds = useMemo(() => {
    const ids = new Set<string>();
    for (const activity of activities) {
      if (!isTaskActivityType(activity.type)) continue;
      const id = getTaskIdFromActivity(activity);
      if (id) ids.add(id);
    }
    return [...ids];
  }, [activities]);

  useEffect(() => {
    if (taskIds.length === 0) {
      setTaskById(new Map());
      return;
    }

    let cancelled = false;
    void Promise.all(taskIds.map((id) => api.getTask(id).catch(() => null))).then((results) => {
      if (cancelled) return;
      const map = new Map<string, Task>();
      for (const task of results) {
        if (task) map.set(task.id, task);
      }
      setTaskById(map);
    });

    return () => {
      cancelled = true;
    };
  }, [taskIds]);

  const events = useMemo(
    () => activitiesToEvents(activities, currentUserId, taskById, leadName, messagesById, templatesById),
    [activities, currentUserId, taskById, leadName, messagesById, templatesById]
  );

  function handleTaskClick(taskId: string) {
    const task = taskById.get(taskId);
    if (task && canUserEditTask(task, currentUserId)) {
      setSelectedTask(task);
    }
  }

  function handleTaskUpdated(updated: Task) {
    setSelectedTask(updated);
    setTaskById((current) => new Map(current).set(updated.id, updated));
  }

  function handleTaskDeleted(taskId: string) {
    setTaskById((current) => {
      const next = new Map(current);
      next.delete(taskId);
      return next;
    });
    if (selectedTask?.id === taskId) setSelectedTask(null);
  }

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const days = useMemo(() => {
    const filtered = events.filter((e) => filter === "all" || e.type === filter);
    const buckets: { label: string; items: TimelineEvent[] }[] = [];
    for (const e of filtered) {
      const label = dayLabel(e.timestamp);
      const last = buckets[buckets.length - 1];
      if (last && last.label === label) last.items.push(e);
      else buckets.push({ label, items: [e] });
    }
    return buckets;
  }, [events, filter]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-medium text-neutral-900 dark:text-neutral-100">
          <ActivityIcon className="h-4 w-4" /> Activity
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`rounded-full border px-3 py-1 text-[13px] transition-colors ${
                filter === f.key
                  ? "border-neutral-300 bg-neutral-100 font-medium text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {days.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">No activity of this type.</p>
      ) : (
        (() => {
          const total = days.reduce((n, d) => n + d.items.length, 0);
          let index = 0;
          return days.map((day) => (
            <section key={day.label} className="mb-3">
              <h3 className="mb-2 ml-0.5 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                {day.label}
              </h3>
              <ul>
                {day.items.map((e) => {
                  const showConnector = index < total - 1;
                  index += 1;
                  return (
                    <Event
                      key={e.id}
                      event={e}
                      showConnector={showConnector}
                      expanded={expanded.has(e.id)}
                      onToggle={() => toggle(e.id)}
                      onTaskClick={handleTaskClick}
                    />
                  );
                })}
              </ul>
            </section>
          ));
        })()
      )}

      <TaskDetailPanel
        task={selectedTask}
        teamMembers={teamMembers}
        onClose={() => setSelectedTask(null)}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
    </div>
  );
}