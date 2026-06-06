import { useState } from "react";
import { db } from "../services/firebase";
import { uploadPhoto } from "../services/uploadPhoto";
import { collection, addDoc } from "firebase/firestore";

export default function UploadDog(){

  const [name,setName] = useState("");
  const [desc,setDesc] = useState("");
  const [file,setFile] = useState(null);

  const saveDog = async (e)=>{

    e.preventDefault();

    const photo = await uploadPhoto(file);

    await addDoc(collection(db,"dogs"),{
      name,
      desc,
      photo,
      status:"adopcion"
    });

    alert("Perrito cargado");

  };

  return(

    <form onSubmit={saveDog}>

      <input
        placeholder="Nombre"
        onChange={e=>setName(e.target.value)}
      />

      <textarea
        placeholder="Descripción"
        onChange={e=>setDesc(e.target.value)}
      />

      <input
        type="file"
        onChange={e=>setFile(e.target.files[0])}
      />

      <button>Guardar</button>

    </form>

  );

}