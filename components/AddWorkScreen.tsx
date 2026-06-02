 "use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, FileText, Loader2, UploadCloud } from "lucide-react";
import { buildCombinedChatWork, buildWorkFromChatConversation, importFile } from "@/lib/import-file";
import type { ImportPreview, NewWorkInput, RouteName } from "@/types";

type Props = {
  onRouteChange: (route: RouteName) => void;
  onAddWork: (input: NewWorkInput) => void;
};

function formatSize(size: number) {
  if (size < 1000) return `${size} caracteres`;
  if (size < 1000000) return `${Math.round(size / 1000)} mil caracteres`;
  return `${(size / 1000000).toFixed(1)} M caracteres`;
}

export function AddWorkScreen({ onRouteChange, onAddWork }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [error, setError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);

  const selectedConversations = useMemo(() => {
    if (!preview) return [];
    return preview.conversations.filter((conversation) => selectedConversationIds.includes(conversation.id));
  }, [preview, selectedConversationIds]);

  const selectedSize = useMemo(() => {
    return selectedConversations.reduce((total, conversation) => total + conversation.size, 0);
  }, [selectedConversations]);

  async function handleFile(file: File) {
    setError("");
    setSourceDetail("");
    setPreview(null);
    setSelectedConversationIds([]);
    setIsImporting(true);

    try {
      const outcome = await importFile(file);

      if (outcome.mode === "preview") {
        setPreview(outcome.preview);
        setSourceDetail(`${outcome.preview.totalCount} conversaciones encontradas. Seleccioná cuáles importar.`);
        return;
      }

      const imported = outcome.work;

      if (!imported.content.trim()) {
        setError("El archivo fue leído, pero no encontré texto útil. Si es PDF escaneado, falta OCR.");
        return;
      }

      setTitle(imported.title);
      setAuthor(imported.author);
      setContent(imported.content);
      setSourceDetail(imported.detail || `Archivo cargado: ${file.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude importar el archivo.");
    } finally {
      setIsImporting(false);
    }
  }

  function toggleConversation(id: string) {
    setSelectedConversationIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function importSelectedAsOne() {
    if (!selectedConversations.length) {
      setError("Seleccioná al menos una conversación. La nada insiste, pero todavía no es una obra.");
      return;
    }

    const work = buildCombinedChatWork(selectedConversations);
    setTitle(work.title);
    setAuthor(work.author);
    setContent(work.content);
    setSourceDetail(`${selectedConversations.length} conversaciones preparadas como una obra.`);
    setPreview(null);
    setSelectedConversationIds([]);
  }

  function importSelectedAsSeparate() {
    if (!selectedConversations.length) {
      setError("Seleccioná al menos una conversación.");
      return;
    }

    selectedConversations.forEach((conversation) => {
      onAddWork(buildWorkFromChatConversation(conversation));
    });

    setPreview(null);
    setSelectedConversationIds([]);
    onRouteChange("inicio");
  }

  function save() {
    if (!title.trim()) {
      setError("La obra necesita un título.");
      return;
    }

    if (!content.trim()) {
      setError("Pegá o cargá algún texto para que la Biblioteca tenga algo que leer. Sí, el vacío es profundo, pero todavía no indexa.");
      return;
    }

    onAddWork({ title, author, content });
    onRouteChange("leer");
  }

  return (
    <>
      <div className="readingTop">
        <button className="backButton" onClick={() => onRouteChange("inicio")}><ChevronLeft size={30} /></button>
        <span>Añadir obra</span>
      </div>

      <section className="card addWorkPanel">
        <h2>Añadir obra</h2>
        <p>
          Pegá un texto o cargá archivos <strong>.md</strong>, <strong>.txt</strong>, <strong>.pdf</strong>, <strong>.json</strong> o exportaciones ZIP de ChatGPT.
          Ahora las exportaciones de ChatGPT se pueden revisar antes de importarlas, pequeño triunfo contra el caos.
        </p>

        <div className="importBox">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf,.json,.zip,text/plain,text/markdown,application/pdf,application/json,application/zip"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.currentTarget.value = "";
            }}
          />

          <button className="importButton" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            {isImporting ? <Loader2 className="spin" size={22} /> : <UploadCloud size={24} />}
            <span>{isImporting ? "Importando..." : "Cargar archivo"}</span>
          </button>

          <div className="importTypes">
            <span><FileText size={15} /> .md</span>
            <span><FileText size={15} /> .txt</span>
            <span><FileText size={15} /> .pdf</span>
            <span><FileText size={15} /> ChatGPT .json/.zip</span>
          </div>

          {sourceDetail && <div className="statusMessage">{sourceDetail}</div>}
        </div>

        {preview && (
          <section className="chatPreview">
            <div className="chatPreviewHeader">
              <div>
                <h3>Vista previa de ChatGPT</h3>
                <p>
                  {preview.totalCount} conversaciones encontradas.
                  {preview.omittedCount > 0 ? ` Se muestran ${preview.conversations.length}; ${preview.omittedCount} quedan fuera por seguridad local.` : ""}
                </p>
              </div>
              <button
                className="textLink"
                onClick={() => {
                  if (selectedConversationIds.length === preview.conversations.length) {
                    setSelectedConversationIds([]);
                  } else {
                    setSelectedConversationIds(preview.conversations.map((conversation) => conversation.id));
                  }
                }}
              >
                {selectedConversationIds.length === preview.conversations.length ? "Limpiar" : "Seleccionar todo"}
              </button>
            </div>

            <div className="selectedSummary">
              <span>{selectedConversationIds.length} seleccionadas</span>
              <span>{formatSize(selectedSize)}</span>
            </div>

            <div className="conversationList">
              {preview.conversations.map((conversation) => (
                <label className="conversationItem" key={conversation.id}>
                  <input
                    type="checkbox"
                    checked={selectedConversationIds.includes(conversation.id)}
                    onChange={() => toggleConversation(conversation.id)}
                  />
                  <div>
                    <strong>{conversation.title}</strong>
                    <span>{conversation.messageCount} mensajes · {formatSize(conversation.size)}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="previewActions">
              <button className="secondaryButton" onClick={importSelectedAsOne}>Preparar como una obra</button>
              <button className="primaryButton" onClick={importSelectedAsSeparate}>Importar separadas</button>
            </div>
          </section>
        )}

        <label>
          <span>Título</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ejemplo: Mística de lo frágil" />
        </label>

        <label>
          <span>Autor</span>
          <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Opcional" />
        </label>

        <label>
          <span>Texto</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Pegá acá el texto de la obra, nota o fragmento..."
          />
        </label>

        {error && <div className="formError">{error}</div>}

        <button className="primaryButton" onClick={save}>Guardar obra</button>
      </section>
    </>
  );
}
