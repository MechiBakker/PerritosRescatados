import React, { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

/**
 * ImageUpload — sube una imagen al bucket "imagenes" de Supabase Storage
 * y devuelve la URL pública via onUpload(url).
 */
export default function ImageUpload({ currentUrl, onUpload, folder = "misc" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local inmediato
    setPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);

    const ext = file.name.split(".").pop();
    const filename = `${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(filename, file, { upsert: true });

    if (uploadError) {
      setError("Error al subir la imagen. Intentá de nuevo.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("imagenes")
      .getPublicUrl(filename);

    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-[#eff4fb] cursor-pointer hover:border-[#38629F]/50 transition"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1">
            <span className="text-3xl">📷</span>
            <span className="text-sm">Clic para subir imagen</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm text-[#38629F] font-medium animate-pulse">
              Subiendo…
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {error && <p className="text-xs text-[#EA4E4E]">{error}</p>}
    </div>
  );
}
