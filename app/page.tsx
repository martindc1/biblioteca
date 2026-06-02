 "use client";

import { useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { AddWorkScreen } from "@/components/AddWorkScreen";
import { EditWorkScreen } from "@/components/EditWorkScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { MapScreen } from "@/components/MapScreen";
import { ReadingScreen } from "@/components/ReadingScreen";
import { SilenceScreen } from "@/components/SilenceScreen";
import { LibrarianScreen } from "@/components/LibrarianScreen";
import { useLocalWorks } from "@/lib/use-local-works";
import type { RouteName } from "@/types";

export default function Page() {
  const [route, setRoute] = useState<RouteName>("inicio");

  const {
    works,
    selectedWork,
    setSelectedWorkId,
    addWork,
    updateWork,
    deleteWork,
    addHighlight,
    deleteHighlight,
    addNote,
    deleteNote,
  } = useLocalWorks();

  const title = useMemo(() => {
    if (route === "silencio") return "Silencio";
    return "Biblioteca";
  }, [route]);

  return (
    <AppFrame route={route} title={title} onRouteChange={setRoute}>
      {route === "inicio" && (
        <HomeScreen
          works={works}
          onRouteChange={setRoute}
          onSelectWork={setSelectedWorkId}
        />
      )}

      {route === "mapa" && <MapScreen />}

      {route === "leer" && (
        <ReadingScreen
          work={selectedWork}
          onRouteChange={setRoute}
          onDeleteWork={deleteWork}
          onAddHighlight={addHighlight}
          onDeleteHighlight={deleteHighlight}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
        />
      )}

      {route === "editar" && (
        <EditWorkScreen
          work={selectedWork}
          onRouteChange={setRoute}
          onUpdateWork={updateWork}
        />
      )}

      {route === "silencio" && <SilenceScreen />}

      {route === "bibliotecario" && <LibrarianScreen work={selectedWork} onRouteChange={setRoute} />}

      {route === "anadir" && (
        <AddWorkScreen
          onRouteChange={setRoute}
          onAddWork={addWork}
        />
      )}
    </AppFrame>
  );
}
