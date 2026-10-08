import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";

export type UserRole = "patient" | "caregiver" | "nurse" | "doctor" | "admin";

export type UserProfile = {
  uid: string;
  role: UserRole;
  hn?: string;
  fullName: string;
  email?: string;
  preferredLang: "th" | "en";
  isActive: boolean;
};

type AuthCtx = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

async function ensureProfile(user: User, fullName?: string): Promise<UserProfile> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const profile: UserProfile = {
    uid: user.uid,
    role: "patient",
    fullName: fullName || user.displayName || user.email || "",
    email: user.email || undefined,
    preferredLang: "th",
    isActive: true,
  };
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const p = await ensureProfile(u);
          setProfile(p);
        } catch (err) {
          console.error("[auth] profile load failed", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      profile,
      loading,
      async signInEmail(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
      },
      async signUpEmail(email, password, fullName) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(cred.user, { displayName: fullName });
        }
        await ensureProfile(cred.user, fullName);
      },
      async signInGoogle() {
        const cred = await signInWithPopup(auth, googleProvider);
        await ensureProfile(cred.user);
      },
      async signOut() {
        await fbSignOut(auth);
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
