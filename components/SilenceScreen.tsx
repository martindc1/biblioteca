export function SilenceScreen() {
  return (
    <>
      <p className="silenceIntro">
        Aquí eliges cómo habitar tu mente.<br />
        <span className="cyan">Ampliar</span>, <span className="cyan">reducir</span> y{" "}
        <span className="gold">silenciar</span> para estar presente.
      </p>

      <section className="card modeCard">
        <h2>Modo de atención</h2>
        <div className="modes">
          <div className="mode"><b className="cyan">Ampliar</b>Abrir la mente</div>
          <div className="mode"><b className="cyan">Reducir</b>Enfocar lo importante</div>
          <div className="mode active"><b className="gold">Silenciar</b>Dejar ser</div>
        </div>
        <div className="ripple"><div className="moon" /></div>
      </section>

      <section className="card sliderCard">
        <div className="sliderRow">
          <strong>Ritmo de hoy</strong>
          <span>Intensidad 25%</span>
        </div>
        <div className="range"><div className="knob" /></div>
        <div className="sliderRow">
          <span>Más información</span>
          <span>Menos información</span>
        </div>
      </section>

      <section className="card listCard">
        <div>
          <h3>Sesión de silencio</h3>
          <p>Encuentra claridad en unos minutos de quietud.</p>
          <div className="time">10:00</div>
          <span className="cyan">Iniciar sesión ›</span>
        </div>
        <div className="symbol">○</div>
      </section>

      <section className="card listCard">
        <div>
          <h3>Pausa recomendada</h3>
          <p>Descansa tu mente. Una pausa breve mejora tu comprensión.</p>
        </div>
        <div className="symbol">⌁</div>
      </section>

      <section className="card listCard">
        <div>
          <h3>Configuración del bibliotecario</h3>
          <p>Ajusta tus preferencias para crear el entorno adecuado para ti.</p>
        </div>
        <div className="symbol">⚙</div>
      </section>
    </>
  );
}
