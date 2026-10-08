/** Local knowledge assistant — ใช้เมื่อยังไม่มี edge function / API key */

const FAQS: { keys: string[]; answerTh: string; answerEn: string }[] = [
  {
    keys: ["คลื่นไส้", "อาเจียน", "nausea", "vomiting"],
    answerTh:
      "อาการคลื่นไส้หลังเคมีพบบ่อย ควรพักผ่อน ดื่มน้ำทีละน้อย กินยาแก้คลื่นไส้ตามแพทย์สั่ง หากอาเจียนมากหรือกินอะไรไม่ได้เกิน 24 ชม. ให้ติดต่อโรงพยาบาล",
    answerEn:
      "Nausea after chemo is common. Rest, sip fluids, take anti-nausea meds as prescribed. Call the hospital if you cannot keep food down for over 24 hours.",
  },
  {
    keys: ["ไข้", "fever", "อุณหภูมิ"],
    answerTh:
      "ไข้ ≥ 38°C ระหว่างเคมีอาจเป็นสัญญาณติดเชื้อ ควรวัดไข้และติดต่อหน่วยเคมีบำบัดหรือฉุกเฉินของ รพ. โดยเร็ว อย่ารอ",
    answerEn:
      "Fever ≥ 38°C during chemo may signal infection. Contact the chemo unit or ER promptly—do not wait.",
  },
  {
    keys: ["ยา", "medicine", "กินยา", "medication"],
    answerTh:
      "กินยาตามเวลาที่แพทย์สั่ง ดูได้ที่เมนูยาของฉัน หากลืมควรถามเภสัชหรือทีมดูแล อย่าเพิ่มขนาดยาเอง",
    answerEn:
      "Take medicines on schedule (see My medicines). If you miss a dose, ask pharmacy or the care team—do not increase the dose on your own.",
  },
  {
    keys: ["นัด", "appointment", "คิว", "queue"],
    answerTh:
      "ดูนัดได้ที่เมนูนัดหมาย และคิววันนี้ที่เมนูคิว หากต้องการเลื่อนนัด โทรติดต่อโรงพยาบาลตามเบอร์ในหน้าหลัก",
    answerEn:
      "See appointments under Appointments and live queue under Queue. To reschedule, call the hospital number on the home screen.",
  },
  {
    keys: ["ผลตรวจ", "แล็บ", "lab", "result"],
    answerTh:
      "ผลตรวจที่พร้อมแล้วอยู่ในเมนูผลตรวจ หากมีค่าผิดปกติ ทีมแพทย์จะอธิบายในวันนัด อย่าหยุดยาเองจากผลแล็บ",
    answerEn:
      "Ready results are under Results. Do not stop medicines based on lab numbers alone—discuss with your doctor.",
  },
];

export function localAssist(question: string, lang: "th" | "en"): string {
  const q = question.toLowerCase();
  for (const f of FAQS) {
    if (f.keys.some((k) => q.includes(k.toLowerCase()))) {
      return lang === "en" ? f.answerEn : f.answerTh;
    }
  }
  return lang === "en"
    ? "I can help with common topics: nausea, fever, medicines, appointments, and lab results. For emergencies, call the hospital. (Full AI needs admin-configured provider + secure backend.)"
    : "ถามได้เรื่องคลื่นไส้ ไข้ ยา นัดหมาย และผลตรวจ หากฉุกเฉินโทรโรงพยาบาลทันที (AI เต็มรูปแบบต้องตั้งค่า provider ที่หน้าแอดมิน + backend ที่ปลอดภัย)";
}
