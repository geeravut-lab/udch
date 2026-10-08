import type { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import type {
  Appointment,
  MedicalResult,
  Medication,
  AppDocument,
  AppNotification,
  Conversation,
  ChatMessage,
} from "../types/models";

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate();
  }
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

export function appointmentFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Appointment {
  const d = snap.data();
  return {
    id: snap.id,
    patientId: d.patientId,
    appointmentType: d.appointmentType ?? "other",
    title: d.title ?? "",
    scheduledAt: toDate(d.scheduledAt),
    location: d.location,
    department: d.department,
    status: d.status ?? "scheduled",
    preparation: d.preparation,
    notes: d.notes,
  };
}

export function resultFromDoc(snap: QueryDocumentSnapshot<DocumentData>): MedicalResult {
  const d = snap.data();
  return {
    id: snap.id,
    patientId: d.patientId,
    resultType: d.resultType ?? "other",
    title: d.title ?? "",
    resultDate: d.resultDate ?? "",
    summary: d.summary,
    status: d.status ?? "final",
    isAbnormal: d.isAbnormal,
    values: d.values,
    filePath: d.filePath,
  };
}

export function medicationFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Medication {
  const d = snap.data();
  return {
    id: snap.id,
    patientId: d.patientId,
    name: d.name ?? "",
    dosage: d.dosage,
    instructions: d.instructions,
    startDate: d.startDate,
    endDate: d.endDate,
    isActive: d.isActive !== false,
    reminderTimes: d.reminderTimes,
  };
}

export function documentFromDoc(snap: QueryDocumentSnapshot<DocumentData>): AppDocument {
  const d = snap.data();
  return {
    id: snap.id,
    patientId: d.patientId,
    docType: d.docType ?? "other",
    title: d.title ?? "",
    filePath: d.filePath,
    issuedAt: d.issuedAt,
    meta: d.meta,
  };
}

export function notificationFromDoc(snap: QueryDocumentSnapshot<DocumentData>): AppNotification {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.userId,
    title: d.title ?? "",
    body: d.body,
    link: d.link,
    channel: d.channel ?? "in_app",
    status: d.status ?? "queued",
    createdAt: toDate(d.createdAt),
    readAt: d.readAt ? toDate(d.readAt) : null,
  };
}

export function conversationFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Conversation {
  const d = snap.data();
  return {
    id: snap.id,
    patientId: d.patientId,
    subject: d.subject,
    status: d.status ?? "open",
    participantIds: d.participantIds,
    lastMessageAt: d.lastMessageAt ? toDate(d.lastMessageAt) : null,
  };
}

export function messageFromDoc(snap: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const d = snap.data();
  return {
    id: snap.id,
    senderId: d.senderId,
    body: d.body ?? "",
    createdAt: toDate(d.createdAt),
    readAt: d.readAt ? toDate(d.readAt) : null,
  };
}

export function formatThaiDate(date: Date, withTime = false): string {
  const d = date.getDate();
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  const m = months[date.getMonth()];
  const y = date.getFullYear() + 543;
  const weekdays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const w = weekdays[date.getDay()];
  if (!withTime) return `${w} ${d} ${m} ${y}`;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${w} ${d} ${m} · ${hh}:${mm}`;
}

export function dayMonthParts(date: Date): { day: string; month: string } {
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return { day: String(date.getDate()), month: months[date.getMonth()] };
}
