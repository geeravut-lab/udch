import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { EducationArticle } from "../types/models";

export function useEducation() {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "educationArticles"),
      where("isPublished", "==", true),
      limit(40),
    );
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            slug: x.slug ?? d.id,
            titleTh: x.titleTh ?? "",
            titleEn: x.titleEn,
            bodyTh: x.bodyTh,
            bodyEn: x.bodyEn,
            category: x.category,
            cancerTypes: x.cancerTypes,
            isPublished: x.isPublished !== false,
            sortOrder: x.sortOrder ?? 0,
          } as EducationArticle;
        });
        list.sort((a, b) => a.sortOrder - b.sortOrder);
        setArticles(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  return { articles, loading };
}
