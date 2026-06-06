import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadPhoto } from "../services/uploadPhoto";

export default function AddDog() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const saveDog = async (e) => {
    e.preventDefault();

    if (!name || !description || !photoFile) {
      alert("Completá todos los campos");
      return;
    }

    try {
      setLoading(true);

      // subir foto
      const imageUrl = await uploadPhoto(photoFile);

      // guardar en firestore
      await addDoc(collection(db, "dogs"), {
        name,
        age,
        description,
        image: imageUrl,
        createdAt: Date.now()
      });

      alert("🐶 Perrito agregado!");

      setName("");
      setAge("");
      setDescription("");
      setPhotoFile(null);
      setPreview(null);

    } catch (err) {
      console.error(err);
      alert("Error guardando perrito");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Agregar Perrito</h2>

      <form onSubmit={saveDog}>

        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Edad"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handlePhoto} />

        {preview && (
          <div>
            <p>Vista previa:</p>
            <img src={preview} width="200" />
          </div>
        )}

        <button disabled={loading}>
          {loading ? "Guardando..." : "Guardar Perrito"}
        </button>

      </form>
    </div>
  );
}