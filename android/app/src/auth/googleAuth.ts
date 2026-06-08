import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";

const CLIENT_ID =
  "456343787433-bl4ee0bb3b5snacsgu47i3ok94gbgg2s.apps.googleusercontent.com";

export function initGoogleAuth() {
  if (!window.google) {
    console.error("GIS não carregado");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: async (response: any) => {
      const idToken = response.credential;

      const credential = GoogleAuthProvider.credential(idToken);

      const result = await signInWithCredential(auth, credential);

      console.log("LOGADO:", result.user);

      return result.user;
    },
  });
}

/**
 * dispara o popup/login quando clicar no botão
 */
export function loginWithGoogle() {
  if (!window.google) {
    console.error("GIS não carregado");
    return;
  }

  window.google.accounts.id.prompt(); 
}