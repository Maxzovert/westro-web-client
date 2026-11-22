"use client";

import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import type { HealthResponse, StoreMeta } from "@/types/store";

type CheckState<T> =
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

export function BootstrapStatus() {
  const [health, setHealth] = useState<CheckState<HealthResponse>>({ status: "loading" });
  const [meta, setMeta] = useState<CheckState<StoreMeta>>({ status: "loading" });
  const [csrf, setCsrf] = useState<CheckState<string>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const data = await api.getHealth();
        if (!cancelled) setHealth({ status: "ok", data });
      } catch (error) {
        if (!cancelled) {
          setHealth({
            status: "error",
            message: error instanceof ApiError ? error.message : "Health check failed",
          });
        }
      }

      try {
        const data = await api.getStoreMeta();
        if (!cancelled) setMeta({ status: "ok", data });
      } catch (error) {
        if (!cancelled) {
          setMeta({
            status: "error",
            message: error instanceof ApiError ? error.message : "Meta check failed",
          });
        }
      }

      try {
        const token = await api.getStoreCsrf();
        if (!cancelled) setCsrf({ status: "ok", data: token });
      } catch (error) {
        if (!cancelled) {
          setCsrf({
            status: "error",
            message: error instanceof ApiError ? error.message : "CSRF check failed",
          });
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bootstrap-panel" aria-label="API bootstrap status">
      <h2>Foundation checks</h2>
      <p className="bootstrap-note">Dev panel — confirms store API health, meta, and CSRF.</p>
      <ul className="bootstrap-list">
        <li>
          <span>Health</span>
          <StatusLine state={health} okLabel={(data) => `${data.status} · db ${data.database}`} />
        </li>
        <li>
          <span>Store meta</span>
          <StatusLine
            state={meta}
            okLabel={(data) => `${data.storeName} · ${data.currency}`}
          />
        </li>
        <li>
          <span>CSRF</span>
          <StatusLine
            state={csrf}
            okLabel={(token) => `issued · ${token.slice(0, 12)}…`}
          />
        </li>
      </ul>
    </section>
  );
}

function StatusLine<T>({
  state,
  okLabel,
}: {
  state: CheckState<T>;
  okLabel: (data: T) => string;
}) {
  if (state.status === "loading") {
    return <strong className="status-loading">Checking…</strong>;
  }
  if (state.status === "error") {
    return <strong className="status-error">{state.message}</strong>;
  }
  return <strong className="status-ok">{okLabel(state.data)}</strong>;
}
