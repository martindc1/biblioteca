import { SlidersHorizontal } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";

export function MapScreen() {
  return (
    <>
      <h2 className="subhead serif">Mapa</h2>

      <div className="segment">
        <button className="active">Personal</button>
        <button>Comunitario</button>
      </div>

      <div className="searchRow">
        <SearchBox placeholder="Buscar vínculos" />
        <button className="filterButton" aria-label="Filtros"><SlidersHorizontal size={22} /></button>
      </div>

      <section className="card mapFull">
        <div className="mapLines" />
        <div className="orbit" />
        <div className="orbit two" />
        <div className="node center">📖<br />Silencio</div>
        <div className="node">Naturaleza</div>
        <div className="node">Ética</div>
        <div className="node">Memoria</div>
        <div className="node">Atención</div>
        <div className="node">Tiempo</div>
        <div className="sideTools">
          <button>+</button>
          <button>−</button>
          <button>⌖</button>
        </div>
      </section>

      <section className="card infoCard">
        <h3>Silencio</h3>
        <p>
          <span className="cyan">Nodo central.</span><br />
          El silencio no es ausencia, sino un espacio fértil donde la atención se vuelve nítida
          y la comprensión encuentra profundidad.
        </p>
        <p className="cyan">✦ 8 vínculos principales</p>
      </section>
    </>
  );
}
