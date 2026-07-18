"use client";

import { FormEvent, useState } from "react";
import { readJsonResponse } from "@/lib/http";

type Props = {
  nextPath?: string;
};

export default function AdminLoginForm({ nextPath = "/admin" }: Props) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setMessage(String(data.message || "Não foi possível entrar no painel."));
        return;
      }

      window.location.href = nextPath || "/admin";
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <div>
        <p className="eyebrow">Acesso administrativo</p>
        <h1>Entrar no painel</h1>
        <p>Use o token do ambiente para gerenciar catálogo, banners e mídia com segurança.</p>
      </div>

      <label>
        Token do admin
        <input
          autoComplete="current-password"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="ADMIN_TOKEN"
          required
        />
      </label>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={!token.trim() || busy}>
        {busy ? "Entrando..." : "Entrar no admin"}
      </button>
    </form>
  );
}
