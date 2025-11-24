import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signInWithEmailAndPassword(auth, email, pwd);

      // Actualizamos token para obtener custom claims
      const token = await res.user.getIdTokenResult(true);

      if (token.claims.admin === true) {
        onSuccess();
      } else {
        setError("No tenés permisos de administrador.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />

      <button type="submit">Ingresar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
