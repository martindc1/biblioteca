 "use client";

import { useState } from "react";
import { Mark } from "@/components/Icons";

type Props = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  authError?: string;
};

export function AuthScreen({ onSignIn, onSignUp, authError }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setLocalError("");
    setMessage("");

    if (!email.trim()) {
      setLocalError("Ingresá un email.");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña necesita al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password);
        setMessage("Cuenta creada. Si Supabase pide confirmación por email, revisá tu correo antes de iniciar sesión.");
      }
    } catch {
      // El error visible viene desde Supabase.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="authShell">
      <section className="card authCard">
        <div className="authBrand">
          <Mark />
          <h1>Biblioteca</h1>
        </div>

        <h2>{mode === "login" ? "Entrar" : "Crear cuenta"}</h2>
        <p>
          Tu Biblioteca necesita usuario para que obras, notas y resaltados sean tuyos.
          Sí, al fin una puerta. Qué concepto revolucionario.
        </p>

        <label>
          <span>Email</span>
          <input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
          />
        </label>

        <label>
          <span>Contraseña</span>
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {(localError || authError) && <div className="formError">{localError || authError}</div>}
        {message && <div className="statusMessage">{message}</div>}

        <button className="primaryButton" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>

        <button
          className="secondaryButton authSwitch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setLocalError("");
            setMessage("");
          }}
        >
          {mode === "login" ? "Crear una cuenta nueva" : "Ya tengo cuenta"}
        </button>
      </section>
    </main>
  );
}
