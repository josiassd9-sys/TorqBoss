import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential
} from "firebase/auth";


import { isMobileApp } from "../utils/authEnv";
import { acquireLoginLock, releaseLoginLock } from "../utils/authGuard";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  const lock = acquireLoginLock();
  if (!lock) return;

  try {
    console.log("🔥 LOGIN START");

    // =========================
    // 📱 MOBILE / CAPACITOR
    // =========================
    if (isMobileApp()) {
      console.log("📱 Native Google Auth");

      

      

      const idToken =
        googleUser.authentication?.idToken || googleUser.idToken;

      const credential = GoogleAuthProvider.credential(idToken);

      const result = await signInWithCredential(auth, credential);

      console.log("✅ MOBILE LOGIN OK", result.user);

      return result.user;
    }

    // =========================
    // 🌐 WEB
    // =========================
    console.log("🌐 Popup Login");

    const result = await signInWithPopup(auth, provider);

    console.log("✅ WEB LOGIN OK", result.user);

    return result.user;

  } catch (err) {
    console.error("❌ LOGIN ERROR", err);
    throw err;

  } finally {
    releaseLoginLock();
  }
};
