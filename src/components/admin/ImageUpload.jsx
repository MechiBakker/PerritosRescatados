import React, { useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function MultiImageUpload({ currentUrls = [], onUpload, folder = "misc", maxImages = 5 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(currentUrls.filter(Boolean));
  const [error, setError] = useState("");

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = maxImages - previews.length;
    if (available <= 0) {
      setError("Ya alcanzaste el máximo de " + maxImages + " fotos.");
      return;
    }

    const toUpload = files.slice(0, available);
    setError("");
    setUploading(true);

    const newUrls = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop();
      const filename = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2) + "." + ext;

      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(filename, file, { upsert: true });

      if (uploadError) {
        setError("Error al subir " + file.name + ". Intentá de nuevo.");
        continue;
      }

      const { data } = supabase.storage.from("imagenes").getPublicUrl(filename);
      newUrls.push(data.publicUrl);
    }

    const updated = [...previews, ...newUrls];
    setPreviews(updated);
    onUpload(updated);
    setUploading(false);
  };

  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUpload(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Grid de previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden">
              <img
                src={url}
                alt={"Foto " + (i + 1)}
                className="w-full h-24 object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#38629F] text-white text-xs px-1.5 py-0.5 rounded-full">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-[#EA4E4E] text-white w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar fotos */}
      {previews.length < maxImages && (
        <div
          className="w-full h-20 rounded-xl border-2 border-dashed border-slate-200 bg-[#eff4fb] cursor-pointer hover:border-[#38629F]/50 transition flex items-center justify-center gap-2 text-slate-400"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <span className="text-sm text-[#38629F] animate-pulse">Subiendo…</span>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="text-sm">
                Agregar fotos ({previews.length}/{maxImages})
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {error && <p className="text-xs text-[#EA4E4E]">{error}</p>}
      <p className="text-xs text-slate-400">
        La primera foto es la principal. Podés subir hasta {maxImages} fotos.
      </p>
    </div>
  );
}