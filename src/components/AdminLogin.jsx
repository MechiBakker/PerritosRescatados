import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

export default function AdminLogin({ onSuccess }) {

  const [email,setEmail] = useState("");
  const [pwd,setPwd] = useState("");
  const [error,setError] = useState("");

  const login = async (e) => {

    e.preventDefault();
    setError("");

    try{

      const res = await signInWithEmailAndPassword(auth,email,pwd);

      const token = await res.user.getIdTokenResult(true);

    console.log("CLAIMS:", token.claims);
    
      if(token.claims.admin){
        onSuccess();
      } else {
        setError("No tenés permisos de administrador.");
      }

    }catch(err){
      setError("Usuario o contraseña incorrectos");
    }

  };

  return (

    <div style={styles.container}>

      <form onSubmit={login} style={styles.card}>

        <h2 style={styles.title}>Panel Administrador</h2>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={pwd}
          onChange={e=>setPwd(e.target.value)}
        />

        <button style={styles.button}>
          Ingresar
        </button>

        {error && <p style={styles.error}>{error}</p>}

      </form>

    </div>

  );

}

const styles = {

  container:{
    height:"40vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"#f5f7fb"
  },

  card:{
    background:"white",
    padding:"40px",
    borderRadius:"12px",
    boxShadow:"0 10px 30px rgba(0,0,0,0.1)",
    width:"320px",
    display:"flex",
    flexDirection:"column",
    gap:"15px"
  },

  title:{
    textAlign:"center",
    color:"#38629F"
  },

  input:{
    padding:"10px",
    borderRadius:"6px",
    border:"1px solid #ddd"
  },

  button:{
    background:"#38629F",
    color:"white",
    padding:"10px",
    border:"none",
    borderRadius:"6px",
    cursor:"pointer",
    fontWeight:"bold"
  },

  error:{
    color:"red",
    textAlign:"center"
  }

};