 "use client";

import { useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { AddWorkScreen } from "@/components/AddWorkScreen";
import { AuthScreen } from "@/components/AuthScreen";
import { EditWorkScreen } from "@/components/EditWorkScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { MapScreen } from "@/components/MapScreen";
import { ReadingScreen } from "@/components/ReadingScreen";
import { SilenceScreen } from "@/components/SilenceScreen";
import { LibrarianScreen } from "@/components/LibrarianScreen";
import { useAuth } from "@/lib/use-auth";
import { useLocalWorks } from "@/lib/use-local-works";
import type { RouteName } from "@/types";

export default function Page() {
  const auth = useAuth();

  if (auth.isAuthLoading) {
    return (
      <main className="authShell">
        <section className="card authCard">
          <h1>Biblioteca</h1>
          <p>Abriendo tu Biblioteca...</p>
        </section>
      </main>
    );
  }

  if (auth.isAuthEnabled && !auth.user) {
    return (
      <AuthScreen
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        authError={auth.authError}
      />
    );
  }

  return (
    <AuthenticatedBiblioteca
      userEmail={auth.user?.email}
      onSignOut={auth.signOut}
    />
  );
}

function AuthenticatedBiblioteca({
  userEmail,
  onSignOut,
}: {
  userEmail?: string;
  onSignOut: () => void;
}) {
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
    isLoading,
    storageMode,
    storageError,
  } = useLocalWorks();

  const title = useMemo(() => {
    if (route === "silencio") return "Silencio";
    return "Biblioteca";
  }, [route]);

  return (
    <AppFrame
      route={route}
      title={title}
      onRouteChange={setRoute}
      userEmail={userEmail}
      onSignOut={onSignOut}
    >
      <div className="storageBanner">
        <span>{isLoading ? "Sincronizando..." : storageMode === "supabase" ? "Nube Supabase activa" : "Modo local"}</span>
        {storageError && <small>{storageError}</small>}
      </div>

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
