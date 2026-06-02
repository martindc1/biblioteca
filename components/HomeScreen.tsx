import { SearchBox } from "@/components/SearchBox";
import type { RouteName, Work } from "@/types";

type Props = {
  works: Work[];
  onRouteChange: (route: RouteName) => void;
  onSelectWork: (id: string) => void;
};

export function HomeScreen({ works, onRouteChange, onSelectWork }: Props) {
  return (
    <>
      <SearchBox />

      <section className="card hero">
        <p>
          <strong>Del ruido a lo esencial.</strong>
          La Biblioteca te ayuda a <span className="cyan">expandir</span>,{" "}
          <span className="gold">reducir</span> y silenciar la información.
        </p>
        <div className="funnel"><div className="dots" /></div>
      </section>

      <div className="sectionTitle">
        <h2>Biblioteca personal</h2>
        <button className="textLink" onClick={() => onRouteChange("anadir")}>＋ Añadir obra</button>
      </div>

      <div className="books">
        {works.map((work) => (
          <button
            className="bookButton"
            key={work.id}
            onClick={() => {
              onSelectWork(work.id);
              onRouteChange("leer");
            }}
          >
            <div className={`cover ${work.coverTone}`}>
              <h3>{work.title}</h3>
              <small>{work.author}</small>
            </div>
            <div className="progress"><i style={{ width: `${work.progress}%` }} /></div>
            <div className="bookMeta"><span /> <span>{work.progress}%</span></div>
          </button>
        ))}

        <button className="addBook" onClick={() => onRouteChange("anadir")}>
          <b>＋</b>
          <span>Añadir<br />obra</span>
        </button>
      </div>

      <div className="sectionTitle">
        <h2>Mapa de resonancias</h2>
        <button className="textLink" onClick={() => onRouteChange("mapa")}>Explorar ›</button>
      </div>

      <button className="card mapPreviewCard" onClick={() => onRouteChange("mapa")}>
        <div className="mapPreview">
          <div className="mapLines" />
          <div className="orbit" />
          <div className="orbit two" />
          <div className="node center">📖<br />Silencio</div>
          <div className="node">Tiempo</div>
          <div className="node">Naturaleza</div>
          <div className="node">Memoria</div>
          <div className="node">Belleza</div>
          <div className="node">Identidad</div>
        </div>
        <div className="quote">“Todo lo que somos es el resultado de lo que hemos pensado.” <b>— Buda</b></div>
      </button>

      <div className="gridTwo">
        <button className="card miniCard" onClick={() => onRouteChange("silencio")}>
          <h3>Sesión de silencio</h3>
          <p>Encuentra claridad en unos minutos de quietud.</p>
          <div className="time">10:00</div>
          <span className="cyan">Iniciar ›</span>
        </button>

        <section className="card miniCard">
          <h3>Hilos recientes</h3>
          {["Sobre la calma y la acción", "El valor de la contemplación", "Notas sobre el silencio"].map((item, idx) => (
            <div className="thread" key={item}>
              <i>{idx === 0 ? "✦" : idx === 1 ? "⌁" : "☉"}</i>
              <div>{item}<span>{idx === 0 ? "Hoy, 08:21" : idx === 1 ? "Ayer, 22:47" : "Ayer, 19:02"}</span></div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
