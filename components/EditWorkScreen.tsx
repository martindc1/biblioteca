 "use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { RouteName, UpdateWorkInput, Work } from "@/types";

type Props = {
  work: Work | null;
  onRouteChange: (route: RouteName) => void;
  onUpdateWork: (id: string, input: UpdateWorkInput) => void;
};

export function EditWorkScreen({ work, onRouteChange, onUpdateWork }: Props) {
  const [title, setTitle] = useState(work?.title ?? "");
  const [author, setAuthor] = useState(work?.author ?? "");
  const [content, setContent] = useState(work?.content ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(work?.title ?? "");
    setAuthor(work?.author ?? "");
    setContent(work?.content ?? "");
    setMessage("");
    setError("");
  }, [work?.id, work?.title, work?.author, work?.content]);

  function save() {
    if (!work) {
      setError("No hay obra seleccionada para editar.");
      return;
    }

    if (!title.trim()) {
      setError("La obra necesita un título.");
      return;
    }

    if (!content.trim()) {
      setError("La obra necesita texto. Sé que el silencio importa, pero todavía no estamos editando el vacío.");
      return;
    }

    onUpdateWork(work.id, { title, author, content });
    setMessage("Cambios guardados.");
    setError("");
  }

  if (!work) {
    return (
      <>
        <button className="textLink" onClick={() => onRouteChange("inicio")}>‹ Volver al inicio</button>
        <section className="card addWorkPanel">
          <h2>Editar obra</h2>
          <p>No hay ninguna obra seleccionada.</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="readingTop">
        <button className="backButton" onClick={() => onRouteChange("leer")}><ChevronLeft size={30} /></button>
        <span>Editar obra</span>
      </div>

      <section className="card addWorkPanel">
        <h2>Editar obra</h2>
        <p>
          Corregí título, autor o contenido. Las notas y resaltados se conservan,
          aunque si cambiás demasiado el texto algunos resaltados pueden dejar de coincidir.
          Pequeña tragedia de la edición, nada que no sobreviva.
        </p>

        <label>
          <span>Título</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label>
          <span>Autor</span>
          <input value={author} onChange={(event) => setAuthor(event.target.value)} />
        </label>

        <label>
          <span>Texto</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </label>

        {error && <div className="formError">{error}</div>}
        {message && <div className="statusMessage">{message}</div>}

        <div className="editActions">
          <button className="secondaryButton" onClick={() => onRouteChange("leer")}>Volver sin guardar</button>
          <button className="primaryButton" onClick={save}>Guardar cambios</button>
        </div>
      </section>
    </>
  );
}
