import type { ImportedChatConversation, ImportPreview, NewWorkInput } from "@/types";

export type ImportedFileResult = NewWorkInput & {
  source: "txt" | "md" | "pdf" | "chatgpt-json" | "chatgpt-zip" | "json" | "unknown";
  detail?: string;
};

export type FileImportOutcome =
  | { mode: "single"; work: ImportedFileResult }
  | { mode: "preview"; preview: ImportPreview };

const MAX_CHATGPT_PREVIEW_ITEMS = 80;

function stripExtension(name: string) {
  return name.replace(/\.[^.]+$/i, "");
}

function normalizeText(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("No pude leer el archivo."));
    reader.readAsText(file);
  });
}

function extractMessageText(message: any): string {
  const content = message?.content;
  const parts = content?.parts;

  if (Array.isArray(parts)) {
    return parts.map(normalizeText).join("\n").trim();
  }

  if (typeof content?.text === "string") {
    return content.text.trim();
  }

  return "";
}

function formatChatGPTConversation(conversation: any, index: number) {
  const title = conversation?.title || `Conversación ${index + 1}`;
  const mapping = conversation?.mapping;

  if (!mapping || typeof mapping !== "object") {
    return {
      title,
      content: `# ${title}\n\n${JSON.stringify(conversation, null, 2)}`,
      messageCount: 1,
    };
  }

  const messages = Object.values(mapping)
    .map((node: any) => node?.message)
    .filter(Boolean)
    .filter((message: any) => message?.author?.role && message?.content)
    .map((message: any) => {
      const role = message.author.role === "assistant" ? "Asistente" : message.author.role === "user" ? "Usuario" : message.author.role;
      const text = extractMessageText(message);

      if (!text) return "";
      return `## ${role}\n\n${text}`;
    })
    .filter(Boolean);

  return {
    title,
    content: `# ${title}\n\n${messages.join("\n\n---\n\n")}`,
    messageCount: messages.length,
  };
}

function buildChatGPTPreview(parsed: any[]): ImportPreview {
  const conversations: ImportedChatConversation[] = parsed
    .slice(0, MAX_CHATGPT_PREVIEW_ITEMS)
    .map((conversation, index) => {
      const formatted = formatChatGPTConversation(conversation, index);
      return {
        id: conversation?.id || `conversation-${index}`,
        title: formatted.title,
        content: formatted.content,
        size: formatted.content.length,
        messageCount: formatted.messageCount,
      };
    });

  return {
    type: "chatgpt",
    title: "Exportación ChatGPT",
    conversations,
    totalCount: parsed.length,
    omittedCount: Math.max(0, parsed.length - conversations.length),
  };
}

function parseChatGPTExportPreview(raw: string): ImportPreview | null {
  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.some((item) => item?.mapping && item?.title)) {
      return buildChatGPTPreview(parsed);
    }

    if (parsed?.mapping && parsed?.title) {
      const formatted = formatChatGPTConversation(parsed, 0);
      return {
        type: "chatgpt",
        title: "Exportación ChatGPT",
        conversations: [
          {
            id: parsed?.id || "conversation-0",
            title: formatted.title,
            content: formatted.content,
            size: formatted.content.length,
            messageCount: formatted.messageCount,
          },
        ],
        totalCount: 1,
        omittedCount: 0,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function parseChatGPTExport(raw: string, fallbackTitle: string): ImportedFileResult | null {
  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.some((item) => item?.mapping && item?.title)) {
      const conversations = parsed
        .slice(0, 30)
        .map((conversation, index) => formatChatGPTConversation(conversation, index).content);

      const omitted = parsed.length > 30 ? `\n\n# Nota\n\nSe importaron las primeras 30 conversaciones de ${parsed.length}. Más adelante conviene importar exportaciones grandes con base de datos, no con localStorage.` : "";

      return {
        title: "Exportación ChatGPT",
        author: "ChatGPT",
        content: `${conversations.join("\n\n==============================\n\n")}${omitted}`,
        source: "chatgpt-json",
        detail: `${Math.min(parsed.length, 30)} conversaciones importadas`,
      };
    }

    if (parsed?.mapping && parsed?.title) {
      return {
        title: parsed.title,
        author: "ChatGPT",
        content: formatChatGPTConversation(parsed, 0).content,
        source: "chatgpt-json",
        detail: "1 conversación importada",
      };
    }

    return {
      title: fallbackTitle,
      author: "Archivo JSON",
      content: JSON.stringify(parsed, null, 2),
      source: "json",
      detail: "JSON genérico importado",
    };
  } catch {
    return null;
  }
}

async function extractPdf(file: File): Promise<ImportedFileResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract-pdf", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? "No pude leer el PDF.");
  }

  return {
    title: data.title || stripExtension(file.name),
    author: "PDF importado",
    content: data.text || "",
    source: "pdf",
    detail: `${data.pages ?? "?"} páginas`,
  };
}

async function extractZip(file: File): Promise<FileImportOutcome> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);

  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const conversations = entries.find((entry) => entry.name.toLowerCase().endsWith("conversations.json"));

  if (conversations) {
    const raw = await conversations.async("string");
    const preview = parseChatGPTExportPreview(raw);

    if (preview) {
      return {
        mode: "preview",
        preview: {
          ...preview,
          title: `Exportación ChatGPT · ${file.name}`,
        },
      };
    }

    const parsed = parseChatGPTExport(raw, "Exportación ChatGPT");

    if (parsed) {
      return {
        mode: "single",
        work: {
          ...parsed,
          source: "chatgpt-zip",
          detail: parsed.detail ? `${parsed.detail} desde ZIP` : "Exportación ChatGPT desde ZIP",
        },
      };
    }
  }

  const readable = entries.find((entry) => /\.(txt|md|json)$/i.test(entry.name));

  if (!readable) {
    throw new Error("No encontré conversations.json ni archivos .txt, .md o .json dentro del ZIP.");
  }

  const raw = await readable.async("string");
  const lower = readable.name.toLowerCase();

  if (lower.endsWith(".json")) {
    const preview = parseChatGPTExportPreview(raw);
    if (preview) return { mode: "preview", preview };

    const parsed = parseChatGPTExport(raw, stripExtension(readable.name));
    if (parsed) return { mode: "single", work: parsed };
  }

  return {
    mode: "single",
    work: {
      title: stripExtension(readable.name.split("/").pop() ?? readable.name),
      author: file.name,
      content: raw,
      source: lower.endsWith(".md") ? "md" : "txt",
      detail: `Extraído desde ${file.name}`,
    },
  };
}

export async function importFile(file: File): Promise<FileImportOutcome> {
  const name = file.name;
  const lower = name.toLowerCase();

  if (lower.endsWith(".pdf")) {
    return { mode: "single", work: await extractPdf(file) };
  }

  if (lower.endsWith(".zip")) {
    return extractZip(file);
  }

  const raw = await readFileAsText(file);

  if (lower.endsWith(".json")) {
    const preview = parseChatGPTExportPreview(raw);
    if (preview) return { mode: "preview", preview };

    const parsed = parseChatGPTExport(raw, stripExtension(name));
    if (parsed) return { mode: "single", work: parsed };
  }

  if (lower.endsWith(".md")) {
    return {
      mode: "single",
      work: {
        title: stripExtension(name),
        author: "Markdown importado",
        content: raw,
        source: "md",
      },
    };
  }

  if (lower.endsWith(".txt")) {
    return {
      mode: "single",
      work: {
        title: stripExtension(name),
        author: "Texto importado",
        content: raw,
        source: "txt",
      },
    };
  }

  return {
    mode: "single",
    work: {
      title: stripExtension(name),
      author: "Archivo importado",
      content: raw,
      source: "unknown",
    },
  };
}

export function buildWorkFromChatConversation(conversation: ImportedChatConversation): NewWorkInput {
  return {
    title: conversation.title,
    author: "ChatGPT",
    content: conversation.content,
  };
}

export function buildCombinedChatWork(conversations: ImportedChatConversation[]): NewWorkInput {
  const title = conversations.length === 1
    ? conversations[0].title
    : `Selección ChatGPT (${conversations.length} conversaciones)`;

  return {
    title,
    author: "ChatGPT",
    content: conversations.map((conversation) => conversation.content).join("\n\n==============================\n\n"),
  };
}
