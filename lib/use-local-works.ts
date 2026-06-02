 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { works as defaultWorks } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Highlight, NewWorkInput, ReadingNote, UpdateWorkInput, Work } from "@/types";

const STORAGE_KEY = "biblioteca_works_v08_fallback";
const OLD_STORAGE_KEYS = ["biblioteca_works_v06", "biblioteca_works_v03", "biblioteca_works_v02"];

type WorkRow = {
  id: string;
  title: string;
  author: string | null;
  content: string;
  excerpt: string | null;
  progress: number | null;
  cover_tone: "dark" | "light" | "night" | null;
  created_at: string | null;
  updated_at: string | null;
};

type HighlightRow = {
  id: string;
  work_id: string;
  text: string;
  created_at: string | null;
};

type NoteRow = {
  id: string;
  work_id: string;
  text: string;
  quote: string | null;
  created_at: string | null;
};

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

function rowToWork(row: WorkRow, highlights: Highlight[], notes: ReadingNote[]): Work {
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? "Autor desconocido",
    content: row.content,
    excerpt: row.excerpt ?? row.content.slice(0, 240),
    progress: row.progress ?? 0,
    coverTone: row.cover_tone ?? "dark",
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    highlights,
    notes,
  };
}

function workToInsert(input: NewWorkInput) {
  const content = input.content.trim();

  return {
    title: input.title.trim(),
    author: input.author.trim() || "Autor desconocido",
    content,
    excerpt: content.slice(0, 240),
    progress: 0,
    cover_tone: "dark",
  };
}

function workToUpdate(input: UpdateWorkInput) {
  const content = input.content.trim();

  return {
    title: input.title.trim(),
    author: input.author.trim() || "Autor desconocido",
    content,
    excerpt: content.slice(0, 240),
    updated_at: new Date().toISOString(),
  };
}

export function useLocalWorks() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const isCloudEnabled = Boolean(supabase);

  const [works, setWorks] = useState<Work[]>(normalizeWorks(defaultWorks));
  const [selectedWorkId, setSelectedWorkId] = useState<string>(defaultWorks[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<"supabase" | "local">("local");
  const [storageError, setStorageError] = useState("");

  const saveLocal = useCallback((nextWorks: Work[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextWorks));
  }, []);

  const loadFromSupabase = useCallback(async () => {
    if (!supabase) {
      const saved = loadSavedWorks();
      if (saved?.length) {
        setWorks(saved);
        setSelectedWorkId(saved[0].id);
      }
      setStorageMode("local");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setStorageError("");

    try {
      const { data: workRows, error: worksError } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: false });

      if (worksError) throw worksError;

      const workIds = (workRows ?? []).map((row) => row.id);

      let highlightRows: HighlightRow[] = [];
      let noteRows: NoteRow[] = [];

      if (workIds.length > 0) {
        const { data: highlightsData, error: highlightsError } = await supabase
          .from("highlights")
          .select("*")
          .in("work_id", workIds)
          .order("created_at", { ascending: false });

        if (highlightsError) throw highlightsError;

        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("*")
          .in("work_id", workIds)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;

        highlightRows = highlightsData ?? [];
        noteRows = notesData ?? [];
      }

      const assembled = (workRows ?? []).map((row: WorkRow) => {
        const highlights: Highlight[] = highlightRows
          .filter((item) => item.work_id === row.id)
          .map((item) => ({
            id: item.id,
            text: item.text,
            createdAt: item.created_at ?? new Date().toISOString(),
          }));

        const notes: ReadingNote[] = noteRows
          .filter((item) => item.work_id === row.id)
          .map((item) => ({
            id: item.id,
            text: item.text,
            quote: item.quote ?? undefined,
            createdAt: item.created_at ?? new Date().toISOString(),
          }));

        return rowToWork(row, highlights, notes);
      });

      setWorks(assembled);
      setSelectedWorkId((current) => {
        if (current && assembled.some((work) => work.id === current)) return current;
        return assembled[0]?.id ?? "";
      });
      setStorageMode("supabase");
    } catch (error) {
      console.error(error);
      setStorageMode("local");
      setStorageError(error instanceof Error ? error.message : "No pude conectar con Supabase.");
      const saved = loadSavedWorks();
      if (saved?.length) {
        setWorks(saved);
        setSelectedWorkId(saved[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  useEffect(() => {
    if (!isCloudEnabled) {
      saveLocal(works);
    }
  }, [isCloudEnabled, saveLocal, works]);

  const selectedWork = useMemo(() => {
    return works.find((work) => work.id === selectedWorkId) ?? works[0] ?? null;
  }, [works, selectedWorkId]);

  async function addWork(input: NewWorkInput) {
    const cleanTitle = input.title.trim();
    const cleanAuthor = input.author.trim() || "Autor desconocido";
    const cleanContent = input.content.trim();

    if (supabase) {
      const { data, error } = await supabase
        .from("works")
        .insert(workToInsert(input))
        .select("*")
        .single();

      if (error) {
        setStorageError(error.message);
        throw error;
      }

      const newWork = rowToWork(data as WorkRow, [], []);
      setWorks((current) => [newWork, ...current]);
      setSelectedWorkId(newWork.id);
      return newWork;
    }

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

    setWorks((current) => {
      const next = [newWork, ...current];
      saveLocal(next);
      return next;
    });
    setSelectedWorkId(newWork.id);
    return newWork;
  }

  async function updateWork(id: string, input: UpdateWorkInput) {
    if (supabase) {
      const { error } = await supabase
        .from("works")
        .update(workToUpdate(input))
        .eq("id", id);

      if (error) {
        setStorageError(error.message);
        throw error;
      }
    }

    setWorks((current) => {
      const next = current.map((work) =>
        work.id === id
          ? {
              ...work,
              title: input.title.trim(),
              author: input.author.trim() || "Autor desconocido",
              content: input.content.trim(),
              excerpt: input.content.trim().slice(0, 240),
              updatedAt: new Date().toISOString(),
            }
          : work
      );
      if (!supabase) saveLocal(next);
      return next;
    });
  }

  async function deleteWork(id: string) {
    if (supabase) {
      const { error } = await supabase.from("works").delete().eq("id", id);

      if (error) {
        setStorageError(error.message);
        throw error;
      }
    }

    setWorks((current) => {
      const next = current.filter((work) => work.id !== id);
      if (selectedWorkId === id) {
        setSelectedWorkId(next[0]?.id ?? "");
      }
      if (!supabase) saveLocal(next);
      return next;
    });
  }

  async function addHighlight(workId: string, text: string) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    if (supabase) {
      const { data, error } = await supabase
        .from("highlights")
        .insert({ work_id: workId, text: cleanText })
        .select("*")
        .single();

      if (error) {
        setStorageError(error.message);
        throw error;
      }

      const highlight: Highlight = {
        id: data.id,
        text: data.text,
        createdAt: data.created_at ?? new Date().toISOString(),
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

    const highlight: Highlight = {
      id: createId(),
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    setWorks((current) => {
      const next = current.map((work) =>
        work.id === workId
          ? { ...work, highlights: [highlight, ...(work.highlights ?? [])] }
          : work
      );
      saveLocal(next);
      return next;
    });

    return highlight;
  }

  async function deleteHighlight(workId: string, highlightId: string) {
    if (supabase) {
      const { error } = await supabase.from("highlights").delete().eq("id", highlightId);
      if (error) {
        setStorageError(error.message);
        throw error;
      }
    }

    setWorks((current) => {
      const next = current.map((work) =>
        work.id === workId
          ? { ...work, highlights: (work.highlights ?? []).filter((item) => item.id !== highlightId) }
          : work
      );
      if (!supabase) saveLocal(next);
      return next;
    });
  }

  async function addNote(workId: string, text: string, quote?: string) {
    const cleanText = text.trim();
    if (!cleanText) return null;

    if (supabase) {
      const { data, error } = await supabase
        .from("notes")
        .insert({ work_id: workId, text: cleanText, quote: quote?.trim() || null })
        .select("*")
        .single();

      if (error) {
        setStorageError(error.message);
        throw error;
      }

      const note: ReadingNote = {
        id: data.id,
        text: data.text,
        quote: data.quote ?? undefined,
        createdAt: data.created_at ?? new Date().toISOString(),
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

    const note: ReadingNote = {
      id: createId(),
      text: cleanText,
      quote: quote?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setWorks((current) => {
      const next = current.map((work) =>
        work.id === workId
          ? { ...work, notes: [note, ...(work.notes ?? [])] }
          : work
      );
      saveLocal(next);
      return next;
    });

    return note;
  }

  async function deleteNote(workId: string, noteId: string) {
    if (supabase) {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) {
        setStorageError(error.message);
        throw error;
      }
    }

    setWorks((current) => {
      const next = current.map((work) =>
        work.id === workId
          ? { ...work, notes: (work.notes ?? []).filter((item) => item.id !== noteId) }
          : work
      );
      if (!supabase) saveLocal(next);
      return next;
    });
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
    isLoading,
    storageMode,
    storageError,
    reloadWorks: loadFromSupabase,
  };
}
