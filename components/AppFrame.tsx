 "use client";

import type { RouteName } from "@/types";
import { Mark, NavIcons, ProfileButton } from "@/components/Icons";

type Props = {
  route: RouteName;
  title: string;
  onRouteChange: (route: RouteName) => void;
  children: React.ReactNode;
};

const navItems: { route: RouteName; label: string }[] = [
  { route: "inicio", label: "Inicio" },
  { route: "mapa", label: "Mapa" },
  { route: "leer", label: "Leer" },
  { route: "silencio", label: "Silencio" },
];

export function AppFrame({ route, title, onRouteChange, children }: Props) {
  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brandRow">
          <Mark />
          <h1>{title}</h1>
          <ProfileButton />
        </div>
      </header>

      <main className="screen">{children}</main>

      <nav className="bottomNav" aria-label="Navegación principal">
        {navItems.map(({ route: itemRoute, label }) => {
          const Icon = NavIcons[itemRoute as keyof typeof NavIcons];
          const isActive = itemRoute === route;
          return (
            <button
              key={itemRoute}
              className={`navItem ${isActive ? "active" : ""}`}
              onClick={() => onRouteChange(itemRoute)}
              type="button"
            >
              <Icon size={25} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
