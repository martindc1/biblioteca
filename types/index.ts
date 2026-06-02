export type RouteName = "inicio" | "mapa" | "leer" | "silencio" | "bibliotecario" | "anadir" | "editar";

export type Highlight = {
  id: string;
  text: string;
  createdAt: string;
};

export type ReadingNote = {
  id: string;
  text: string;
  quote?: string;
  createdAt: string;
};

export type Work = {
  id: string;
  title: string;
  author: string;
  progress: number;
  coverTone: "dark" | "light" | "night";
  excerpt?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  highlights?: Highlight[];
  notes?: ReadingNote[];
};

export type NewWorkInput = {
  title: string;
  author: string;
  content: string;
};

export type UpdateWorkInput = {
  title: string;
  author: string;
  content: string;
};

export type ImportedChatConversation = {
  id: string;
  title: string;
  content: string;
  size: number;
  messageCount: number;
};

export type ImportPreview = {
  type: "chatgpt";
  title: string;
  conversations: ImportedChatConversation[];
  totalCount: number;
  omittedCount: number;
};

export type Resonance = {
  id: string;
  title: string;
  author?: string;
  category: string;
  strength: number;
};

export type MapNode = {
  id: string;
  label: string;
  kind: "obra" | "tema" | "nota" | "concepto";
  x: number;
  y: number;
  active?: boolean;
};
