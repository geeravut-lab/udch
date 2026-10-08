# Netlify Function: AI Chat

## ไฟล์

- `web/netlify/functions/ai-chat.mjs`
- เรียกจากแอป: `POST /.netlify/functions/ai-chat`

## ตั้งค่าบน Netlify

1. Site settings → **Environment variables**
2. เพิ่มอย่างน้อยหนึ่งค่า:

| ตัวแปร | ผู้ให้บริการ |
|--------|----------------|
| `OPENAI_API_KEY` | OpenAI (แนะนำเริ่มต้น) |
| `ANTHROPIC_API_KEY` | Anthropic |
| `GOOGLE_AI_API_KEY` หรือ `GEMINI_API_KEY` | Google Gemini |

3. Deploy ใหม่ (Preview หรือ Production ตามนโยบายโปรเจกต์)

## ทดสอบ local

```bash
# ติดตั้ง Netlify CLI
npm install -g netlify-cli

cd /path/to/udch
# ใส่ key ใน .env ที่ root หรือ export
export OPENAI_API_KEY=sk-...

netlify dev
# เปิด URL ที่ CLI บอก (มักเป็น :8888) — จะรัน Vite + Functions พร้อมกัน
```

อย่าใช้แค่ `npm run dev` ถ้าต้องการทดสอบ Function จริง — Vite อย่างเดียวไม่มี function runtime

## Body ตัวอย่าง

```json
{
  "message": "มีอาการคลื่นไส้หลังเคมี ทำไงดี",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "lang": "th",
  "history": []
}
```

## Response

```json
{ "reply": "...", "provider": "openai", "model": "gpt-4o-mini" }
```

## หน้า Admin

- `/admin/ai` เลือก provider + model
- ช่อง Edge URL **ว่างไว้** = ใช้ Netlify Function ของโปรเจกต์นี้
- ถ้าใส่ URL อื่น = เรียก endpoint นั้นแทน
