import { useEffect, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../i18n/context";
import { useHospitalInfo } from "../hooks/useHospitalInfo";

type PayRow = {
  id: string;
  amountSatang: number;
  description?: string;
  status: string;
};

export function PaymentsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const hospital = useHospitalInfo();
  const [rows, setRows] = useState<PayRow[]>([]);
  const [baht, setBaht] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const promptpayId = hospital.promptpayId || "";

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "payments"), where("patientId", "==", user.uid), limit(20));
    return onSnapshot(q, (snap) => {
      setRows(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            amountSatang: x.amountSatang ?? 0,
            description: x.description,
            status: x.status ?? "pending",
          };
        }),
      );
    });
  }, [user]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const amount = Math.round(parseFloat(baht) * 100);
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "payments"), {
        patientId: user.uid,
        amountSatang: amount,
        description: desc || "ชำระส่วนเกินสิทธิ",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setBaht("");
      setDesc("");
    } finally {
      setBusy(false);
    }
  }

  function qrUrl(amountSatang: number) {
    if (!promptpayId) return null;
    const amount = (amountSatang / 100).toFixed(2);
    return `https://promptpay.io/${promptpayId}/${amount}`;
  }

  return (
    <div className="page">
      <div className="page-header"><h2>💳 {t.payTitle}</h2></div>
      <p className="muted" style={{ marginBottom: 12, fontSize: "0.9rem" }}>{t.payDesc}</p>

      <form className="card" onSubmit={onCreate}>
        <div className="field">
          <label>{t.payAmount}</label>
          <input type="number" min="1" step="0.01" value={baht} onChange={(e) => setBaht(e.target.value)} required placeholder="500" />
        </div>
        <div className="field">
          <label>{t.payNote}</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.payNotePh} />
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? t.loading : t.payCreate}</button>
        {!promptpayId && (
          <p className="muted" style={{ marginTop: 10, fontSize: "0.85rem" }}>{t.payNoId}</p>
        )}
      </form>

      {rows.map((r) => {
        const url = qrUrl(r.amountSatang);
        return (
          <div key={r.id} className="list-card">
            <b>{(r.amountSatang / 100).toLocaleString("th-TH", { style: "currency", currency: "THB" })}</b>
            <div className="muted" style={{ fontSize: "0.9rem" }}>{r.description}</div>
            <span className="chip" style={{ marginTop: 8 }}>{r.status}</span>
            {url && r.status === "pending" && (
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <img src={url} alt="PromptPay QR" width={200} height={200} style={{ borderRadius: 12, background: "#fff" }} />
                <p className="muted" style={{ fontSize: "0.85rem", marginTop: 6 }}>{t.payScan}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
