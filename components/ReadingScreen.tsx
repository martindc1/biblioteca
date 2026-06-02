 "use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Pencil, Trash2, X } from "lucide-react";
import { resonances } from "@/lib/mock-data";
import type { Highlight, ReadingNote, RouteName, Work } from "@/types";

type Props = {
  work: Work | null;
  onRouteChange: (route: RouteName) => void;
  onDeleteWork: (id: string) => void;
  onAddHighlight: (workId: string, text: string) => void;
  onDeleteHighlight: (workId: string, highlightId: string) => void;
  onAddNote: (workId: string, text: string, quote?: string) => void;
  onDeleteNote: (workId: string, noteId: string) => void;
};

const defaultText = `Hay una belleza que no se impone, que apenas se deja ver. Es la belleza de lo que tiembla.

Lo frágil no pide protección: pide atención.

Mirar lo frágil es un acto de humildad. Porque sabemos que también podemos quebrarnos, y sin embargo, seguimos aquí, intentando amar lo que puede desvanecerse.`;

function getSelectedText() {
  if (typeof window === "undefined") return "";
  return window.getSelection()?.toString().trim() ?? "";
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function ReadingScreen({
  work,
  onRouteChange,
  onDeleteWork,
  onAddHighlight,
  onDeleteHighlight,
  onAddNote,
  onDeleteNote,
}: Props) {
  const [message, setMessage] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");

  const paragraphs = useMemo(() => {
    return (work?.content || defaultText)
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [work?.content]);

  const highlights = work?.highlights ?? [];
  const notes = work?.notes ?? [];

  function handleHighlight() {
    if (!work) return;

    const selected = getSelectedText();
    if (!selected) {
      setMessage("Seleccioná un fragmento del texto antes de tocar Resaltar.");
      return;
    }

    onAddHighlight(work.id, selected);
    setMessage("Fragmento resaltado y guardado.");
    window.getSelection()?.removeAllRanges();
  }

  function handleOpenNote() {
    const selected = getSelectedText();
    setSelectedQuote(selected);
    setNoteOpen(true);
    setMessage(selected ? "La nota quedará vinculada al fragmento seleccionado." : "La nota quedará vinculada a esta obra.");
  }

  function handleSaveNote() {
    if (!work) return;

    if (!noteText.trim()) {
      setMessage("La nota necesita texto. Terrible exigencia, lo sé.");
      return;
    }

    onAddNote(work.id, noteText, selectedQuote);
    setNoteText("");
    setSelectedQuote("");
    setNoteOpen(false);
    setMessage("Nota guardada.");
    window.getSelection()?.removeAllRanges();
  }

  function handleSaveReading() {
    setMessage("Lectura guardada en este navegador.");
  }

  return (
    <>
      <div className="readingTop">
        <button className="backButton" onClick={() => onRouteChange("inicio")}><ChevronLeft size={30} /></button>
        <span>Leer</span>
        <button className="smallPill">Aa</button>
      </div>

      <section className="card readCard">
        <div className="readHeader">
          <div>
            <h2>{work?.title ?? "Mística de lo frágil"}</h2>
            <div className="author">{work?.author ?? "Clarice Lispector"}</div>
          </div>

          <div className="readHeaderActions">
            {work && (
              <button
                className="editIconButton"
                onClick={() => onRouteChange("editar")}
                aria-label="Editar obra"
              >
                <Pencil size={18} />
              </button>
            )}

            {work?.createdAt && (
              <button
                className="dangerButton"
                onClick={() => {
                  onDeleteWork(work.id);
                  onRouteChange("inicio");
                }}
                aria-label="Eliminar obra"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="chapter">Lectura personal · Biblioteca local</div>

        <div className="excerpt readingText">
          {paragraphs.map((paragraph, index) => {
            const savedHighlight = highlights.find((item) => paragraph.includes(item.text));
            return savedHighlight ? (
              <p className="highlightParagraph" key={`${paragraph}-${index}`}>{paragraph}</p>
            ) : (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            );
          })}
        </div>

        <div className="actions">
          <button onClick={handleHighlight}>✎ Resaltar</button>
          <button onClick={handleOpenNote}>▤ Nota</button>
          <button onClick={handleSaveReading}>♡ Guardar</button>
        </div>

        {message && <div className="statusMessage">{message}</div>}
      </section>

      {noteOpen && (
        <section className="card noteComposer">
          <div className="noteComposerHeader">
            <h3>Nueva nota</h3>
            <button onClick={() => setNoteOpen(false)} aria-label="Cerrar"><X size={18} /></button>
          </div>

          {selectedQuote && (
            <blockquote>{selectedQuote}</blockquote>
          )}

          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Escribí tu nota de lectura..."
          />

          <button className="primaryButton" onClick={handleSaveNote}>Guardar nota</button>
        </section>
      )}

      <ReadingMemory
        workId={work?.id}
        highlights={highlights}
        notes={notes}
        onDeleteHighlight={onDeleteHighlight}
        onDeleteNote={onDeleteNote}
      />

      <div className="sectionTitle">
        <h2>Resonancias relacionadas</h2>
        <button className="textLink">Ver todo ›</button>
      </div>

      <div className="resonances">
        {resonances.map((item) => (
          <article className="resCard" key={item.id}>
            <h3>{item.title}</h3>
            <small>{item.author}</small>
            <p>☆ {item.category}</p>
          </article>
        ))}
      </div>

      <button className="card librarian" onClick={() => onRouteChange("bibliotecario")}>
        <div className="librarianAvatar" />
        <div>
          <h3>Preguntar al bibliotecario</h3>
          <p>Hazle una pregunta sobre este texto o su relación con otras obras.</p>
        </div>
        <span>→</span>
      </button>
    </>
  );
}

function ReadingMemory({
  workId,
  highlights,
  notes,
  onDeleteHighlight,
  onDeleteNote,
}: {
  workId?: string;
  highlights: Highlight[];
  notes: ReadingNote[];
  onDeleteHighlight: (workId: string, highlightId: string) => void;
  onDeleteNote: (workId: string, noteId: string) => void;
}) {
  if (!workId || (!highlights.length && !notes.length)) return null;

  return (
    <section className="card readingMemory">
      <h2>Memoria de lectura</h2>

      {highlights.length > 0 && (
        <div className="memoryBlock">
          <h3>Resaltados</h3>
          {highlights.map((item) => (
            <article className="memoryItem" key={item.id}>
              <p>“{item.text}”</p>
              <div>
                <span>{formatDate(item.createdAt)}</span>
                <button onClick={() => onDeleteHighlight(workId, item.id)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="memoryBlock">
          <h3>Notas</h3>
          {notes.map((item) => (
            <article className="memoryItem" key={item.id}>
              {item.quote && <blockquote>{item.quote}</blockquote>}
              <p>{item.text}</p>
              <div>
                <span>{formatDate(item.createdAt)}</span>
                <button onClick={() => onDeleteNote(workId, item.id)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
