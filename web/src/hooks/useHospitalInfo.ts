import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { HospitalInfo } from "../types/models";

const FALLBACK: HospitalInfo = {
  nameTh: "โรงพยาบาลศูนย์มะเร็ง จ.อุดรธานี",
  nameEn: "Udonthani Cancer Hospital",
  phone: "042-110345",
  mobile: "0610197171",
  lineId: "@udch",
  hours: "จันทร์–ศุกร์ 07:30–14:00",
};

export function useHospitalInfo() {
  const [info, setInfo] = useState<HospitalInfo>(FALLBACK);

  useEffect(() => {
    return onSnapshot(
      doc(db, "settings", "hospital"),
      (snap) => {
        if (snap.exists()) setInfo({ ...FALLBACK, ...(snap.data() as HospitalInfo) });
      },
      () => setInfo(FALLBACK),
    );
  }, []);

  return info;
}
