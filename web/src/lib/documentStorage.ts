import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPatientDocument(
  patientId: string,
  file: File,
): Promise<string> {
  const safe = file.name.replace(/[^\w.\-ก-๙]+/g, "_");
  const path = `patients/${patientId}/documents/${Date.now()}_${safe}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type || "application/octet-stream" });
  return path;
}

export async function getDocumentDownloadUrl(filePath: string): Promise<string> {
  return getDownloadURL(ref(storage, filePath));
}
