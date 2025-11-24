import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function Protected({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setAllowed(false);
        return;
      }

      const token = await user.getIdTokenResult(true);

      if (token.claims.admin === true) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    });

    return () => unsub();
  }, []);

  if (allowed === null) return <p>Cargando...</p>;
  if (allowed === false) return <p>Acceso denegado</p>;

  return children;
}
