/** แสดงสถานะภาษาคนแทนรหัสอังกฤษ */

export function appointmentStatusLabel(status: string, lang: "th" | "en" = "th"): string {
  const th: Record<string, string> = {
    scheduled: "นัดหมายแล้ว",
    checked_in: "เช็คอินแล้ว",
    in_progress: "กำลังตรวจ",
    completed: "เสร็จแล้ว",
    cancelled: "ยกเลิก",
    no_show: "ไม่มาตามนัด",
  };
  const en: Record<string, string> = {
    scheduled: "Scheduled",
    checked_in: "Checked in",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  };
  return (lang === "th" ? th : en)[status] ?? status;
}

export function resultTypeLabel(type: string, lang: "th" | "en" = "th"): string {
  const th: Record<string, string> = {
    lab: "ผลแล็บ",
    imaging: "รังสี / ภาพถ่าย",
    pathology: "พยาธิวิทยา",
    other: "อื่น ๆ",
  };
  const en: Record<string, string> = {
    lab: "Lab",
    imaging: "Imaging",
    pathology: "Pathology",
    other: "Other",
  };
  return (lang === "th" ? th : en)[type] ?? type;
}
