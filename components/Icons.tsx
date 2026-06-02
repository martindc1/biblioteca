import { BookOpen, Circle, Home, Network, Search, UserRound } from "lucide-react";

export function Mark() {
  return (
    <div className="mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <i />
      <b />
    </div>
  );
}

export function ProfileButton() {
  return (
    <button className="iconButton" aria-label="Perfil">
      <UserRound size={22} />
    </button>
  );
}

export const NavIcons = {
  inicio: Home,
  mapa: Network,
  leer: BookOpen,
  silencio: Circle,
};

export { Search };
