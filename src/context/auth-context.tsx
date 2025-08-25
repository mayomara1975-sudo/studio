"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  userLevel: string | null;
  updateUserLevel: (level: string) => void;
  completedExercises: string[];
  completeExercise: (exerciseId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserLevel(data.level || null);
              setCompletedExercises(data.completedExercises || []);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserLevel(null);
            setCompletedExercises([]);
        }
      } else {
        setUserLevel(null);
        setCompletedExercises([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserDocument = async (user: User, additionalData?: object) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = new Date();
      await setDoc(userDocRef, {
        uid: user.uid,
        email,
        displayName,
        photoURL,
        createdAt,
        completedExercises: [],
        ...additionalData,
      });
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    const userWithDisplayName = { ...userCredential.user, displayName };
    await createUserDocument(userWithDisplayName);
    setUser(userWithDisplayName);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserDocument(result.user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserLevel = async (level: string) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { level }, { merge: true });
      setUserLevel(level);
    }
  };

  const completeExercise = async (exerciseId: string) => {
    if (user && !completedExercises.includes(exerciseId)) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        completedExercises: arrayUnion(exerciseId)
      });
      setCompletedExercises(prev => [...prev, exerciseId]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, userLevel, updateUserLevel, completedExercises, completeExercise }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
