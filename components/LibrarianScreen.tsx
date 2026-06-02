 "use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { extractConcepts, extractFragments, makeQuestions, reduceToEssence, summarizeText } from "@/lib/local-librarian";
import type { RouteName, Work } from "@/types";

type Props = {
  work: Work | null;
  onRouteChange: (route: RouteName) => void;
};

type Mode = "resumen" | "conceptos" | "preguntas" | "reducir" | "fragmentos";

const modeLabels: Record<Mode, string> = {
  resumen: "Resumen",
  conceptos: "Conceptos",
  preguntas: "Preguntas",
  reducir: "Reducir",
  fragmentos: "Fragmentos",
};

export function LibrarianScreen({ work, onRouteChange }: Props) {
  const [mode, setMode] = useState<Mode>("resumen");
  const content = work?.content ?? "";

  const result = useMemo(() => {
    if (!content.trim()) {
      return {
        title: "Sin obra seleccionada",
        body: "Abrí una obra primero. El Bibliotecario todavía no adivina textos por ósmosis, por desgracia para la fantasía humana.",
      };
    }

    if (mode === "resumen") {
      return {
        title: "Resumen local",
        body: summarizeText(content),
      };
    }

    if (mode === "conceptos") {
      const concepts = extractConcepts(content);
      return {
        title: "Conceptos frecuentes",
        body: concepts.length
          ? concepts.map((item) => `${item.word} (${item.count})`).join(" · ")
          : "No encontré conceptos suficientes.",
      };
    }

    if (mode === "preguntas") {
      return {
        title: "Preguntas de lectura",
        body: makeQuestions(content).map((question) => `• ${question}`).join("\n"),
      };
    }

    if (mode === "reducir") {
      const essence = reduceToEssence(content);
      return {
        title: "Reducción provisional",
        body: `${essence.sentence}\n\nConceptos eje: ${essence.concepts.join(" · ") || "sin conceptos suficientes"}`,
      };
    }

    return {
      title: "Fragmentos relevantes",
      body: extractFragments(content).map((fragment) => `“${fragment}”`).join("\n\n"),
    };
  }, [content, mode]);

  return (
    <>
      <div className="readingTop">
        <button className="backButton" onClick={() => onRouteChange("leer")}><ChevronLeft size={30} /></button>
        <span>Bibliotecario</span>
      </div>

      <section className="card librarianPanel">
        <div className="librarianAvatar large" />
        <h2>Bibliotecario local</h2>
        <p>
          Esta primera versión trabaja sin IA externa. Lee la obra seleccionada y produce operaciones básicas:
          resumir, extraer conceptos, preguntar, reducir y encontrar fragmentos.
        </p>

        {work && (
          <div className="currentWorkBadge">
            <span>Obra actual</span>
            <strong>{work.title}</strong>
          </div>
        )}

        <div className="librarianModes">
          {(Object.keys(modeLabels) as Mode[]).map((item) => (
            <button
              key={item}
              className={mode === item ? "active" : ""}
              onClick={() => setMode(item)}
            >
              {modeLabels[item]}
            </button>
          ))}
        </div>
      </section>

      <section className="card answerCard">
        <h3>{result.title}</h3>
        <p className="preserveLines">{result.body}</p>
      </section>

      <section className="card localWarning">
        <h3>Estado de esta función</h3>
        <p>
          Esto no reemplaza al Bibliotecario con IA. Es una capa local útil para probar el gesto central:
          ampliar, reducir y ordenar sin mandar todavía tus textos a ningún servicio externo.
        </p>
      </section>
    </>
  );
}
