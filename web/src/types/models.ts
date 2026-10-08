export type UserRole = "patient" | "caregiver" | "nurse" | "doctor" | "admin";

export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type Appointment = {
  id: string;
  patientId: string;
  appointmentType: string;
  title: string;
  scheduledAt: Date;
  location?: string;
  department?: string;
  status: AppointmentStatus;
  preparation?: string;
  notes?: string;
};

export type MedicalResult = {
  id: string;
  patientId: string;
  resultType: "lab" | "imaging" | "pathology" | "other";
  title: string;
  resultDate: string;
  summary?: string;
  status: "preliminary" | "final";
  isAbnormal?: boolean;
  values?: Record<string, unknown>;
  filePath?: string;
};

export type Medication = {
  id: string;
  patientId: string;
  name: string;
  dosage?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  reminderTimes?: string[];
};

export type AppDocument = {
  id: string;
  patientId: string;
  docType: string;
  title: string;
  filePath?: string;
  issuedAt?: string;
  meta?: Record<string, unknown>;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  body?: string;
  link?: string;
  channel: string;
  status: string;
  createdAt: Date;
  readAt?: Date | null;
};

export type Conversation = {
  id: string;
  patientId: string;
  subject?: string;
  status: string;
  participantIds?: string[];
  lastMessageAt?: Date | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt?: Date | null;
};

export type FeatureFlags = {
  epro: boolean;
  telemedicine: boolean;
  ai_assistant: boolean;
  fast_track: boolean;
  caregiver: boolean;
  line_notify: boolean;
  promptpay: boolean;
  education: boolean;
};

export const DEFAULT_FLAGS: FeatureFlags = {
  epro: false,
  telemedicine: false,
  ai_assistant: false,
  fast_track: false,
  caregiver: true,
  line_notify: false,
  promptpay: true,
  education: true,
};

export type HospitalInfo = {
  nameTh: string;
  nameEn: string;
  phone: string;
  mobile?: string;
  lineId?: string;
  hours?: string;
};
