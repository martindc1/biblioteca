 "use client";

import { useEffect, useMemo, useState } from "react";
import { works as defaultWorks } from "@/lib/mock-data";
import type { Highlight, NewWorkInput, ReadingNote, UpdateWorkInput, Work } from "@/types";

const STORAGE_KEY = "biblioteca_works_v06";
const OLD_STORAGE_KEYS = ["biblioteca_works_v03", "biblioteca_works_v02"];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeWorks(input: Work[]): Work[] {
  return input.map((work) => ({
    ...work,
    highlights: Array.isArray(work.highlights) ? work.highlights : [],
    notes: Array.isArray(work.notes) ? work.notes : [],
  }));
}

function safeParseWorks(raw: string | null): Work[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return normalizeWorks(parsed);
  } catch {
    return null;
  }
}

function loadSavedWorks(): Work[] | null {
  const current = safeParseWorks(localStorage.getItem(STORAGE_KEY));
  if (current?.length) return current;

  for (const key of OLD_STORAGE_KEYS) {
    const legacy = safeParseWorks(localStorage.getItem(key));
    if (legacy?.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
      return legacy;
    }
  }

  return null;
}

export function useLocalWorks() {
  const [works, setWorks] = useState<Work[]>(normalizeWorks(defaultWorks));
  const [selectedWorkId, setSelectedWorkId] = useState<string>(defaultWorks[0]?.id ?? "");

  useEffect(() => {
    const saved = loadSavedWorks();
    if (saved?.length) {
      setWorks(saved);
      setSelectedWorkId(saved[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  }, [works]);

  const selectedWork = useMemo(() => {
    return works.find((work) => work.id === selectedWorkId) ?? works[0] ?? null;
  }, [works, selectedWorkId]);

  function addWork(input: NewWorkInput) {
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim() || "Autor desconocido";
    const cleanContent = input.content.trim();

    const newWork: Work = {
      id: createId(),
      title: cleanTitle,
      author: cleanAuthor,
      content: cleanContent,
      excerpt: cleanContent.slice(0, 240),
      progress: 0,
      coverTone: "dark",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      highlights: [],
      notes: [],
    };

    setWorks((current) => [newWork, ...current]);
    setSelectedWorkId(newWork.id);
    return newWork;
  }

  function updateWork(id: string, input: UpdateWorkInput) {
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim() || "Autor desconocido";
    const cleanContent = input.content.trim();

    setWorks((current) =>
      current.map((work) =>
        work.id === id
          ? {
              ...work,
              title: cleanTitle,
              author: cleanAuthor,
              content: cleanContent,
              excerpt: cleanContent.slice(0, 240),
              updatedAt: new Date().toISOString(),
            }
          : work
      )
    );
  }

  function deleteWork(id: string) {
    setWorks((current) => {
      const next = current.filter((work) => work.id !== id);
      if (selectedWorkId === id) {
        setSelectedWorkId(next[0]?.id ?? "");
      }
      return next;
    });
  }

  function addHighlight(workId: string, text: string) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const highlight: Highlight = {
      id: createId(),
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    setWorks((current) =>
      current.map((work) =>
        work.id === workId
          ? { ...work, highlights: [highlight, ...(work.highlights ?? [])] }
          : work
      )
    );

    return highlight;
  }

  function deleteHighlight(workId: string, highlightId: string) {
    setWorks((current) =>
      current.map((work) =>
        work.id === workId
          ? { ...work, highlights: (work.highlights ?? []).filter((item) => item.id !== highlightId) }
          : work
      )
    );
  }

  function addNote(workId: string, text: string, quote?: string) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const note: ReadingNote = {
      id: createId(),
      text: cleanText,
      quote: quote?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setWorks((current) =>
      current.map((work) =>
        work.id === workId
          ? { ...work, notes: [note, ...(work.notes ?? [])] }
          : work
      )
    );

    return note;
  }

  function deleteNote(workId: string, noteId: string) {
    setWorks((current) =>
      current.map((work) =>
        work.id === workId
          ? { ...work, notes: (work.notes ?? []).filter((item) => item.id !== noteId) }
          : work
      )
    );
  }

  return {
    works,
    selectedWork,
    selectedWorkId,
    setSelectedWorkId,
    addWork,
    updateWork,
    deleteWork,
    addHighlight,
    deleteHighlight,
    addNote,
    deleteNote,
  };
}
