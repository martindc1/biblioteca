import type { MapNode, Resonance, Work } from "@/types";

export const works: Work[] = [
  {
    id: "meditaciones",
    title: "Meditaciones",
    author: "Marco Aurelio",
    progress: 58,
    coverTone: "dark",
    excerpt: "La atención permite separar lo que depende de nosotros de aquello que solo produce ruido.",
  },
  {
    id: "siddhartha",
    title: "Siddhartha",
    author: "Hermann Hesse",
    progress: 32,
    coverTone: "light",
    excerpt: "La búsqueda también necesita detenerse para que algo pueda ser comprendido.",
  },
  {
    id: "nombre-viento",
    title: "El nombre del viento",
    author: "Patrick Rothfuss",
    progress: 67,
    coverTone: "night",
    excerpt: "Todo nombre abre una relación entre memoria, belleza y pérdida.",
  },
];

export const resonances: Resonance[] = [
  { id: "impermanencia", title: "Sobre la impermanencia", author: "Thich Nhat Hanh", category: "Naturaleza", strength: 0.83 },
  { id: "delicadeza", title: "La delicadeza del mundo", author: "Yasunari Kawabata", category: "Belleza", strength: 0.77 },
  { id: "vulnerabilidad", title: "El ser y la vulnerabilidad", author: "Simone de Beauvoir", category: "Filosofía", strength: 0.71 },
];

export const nodes: MapNode[] = [
  { id: "silencio", label: "Silencio", kind: "concepto", x: 50, y: 50, active: true },
  { id: "memoria", label: "Memoria", kind: "tema", x: 52, y: 18 },
  { id: "naturaleza", label: "Naturaleza", kind: "tema", x: 13, y: 34 },
  { id: "etica", label: "Ética", kind: "tema", x: 82, y: 34 },
  { id: "tiempo", label: "Tiempo", kind: "tema", x: 18, y: 69 },
  { id: "atencion", label: "Atención", kind: "tema", x: 78, y: 69 },
  { id: "fragil", label: "Mística de lo frágil", kind: "obra", x: 50, y: 83 },
];
