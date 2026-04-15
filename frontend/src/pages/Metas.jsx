import { useEffect, useState } from "react";
import api from "../services/api";
import { formatBRL, formatData, TIPOS_ATIVO } from "../utils/format";

export default function Metas() {
  const [metas, setMetas] = useState([]);

  useEffect(() => {
    api.get("/metas").then((res) => setMetas(res.data));
  }, []);

  const concluidas = metas.filter((m) => m.status === "concluida");
  const ativas = metas.filter((m) => m.status === "ativa");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Histórico de Metas</h1>

      {ativas.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3 text-emerald-400">
            Em andamento
          </h2>
          <div className="space-y-2">
            {ativas.map((m) => (
              <MetaCard key={m.id} meta={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-3 text-slate-300">Concluídas</h2>
        {concluidas.length === 0 ? (
          <p className="text-slate-400">
            Nenhuma meta concluída ainda. Vá em frente! 🚀
          </p>
        ) : (
          <div className="space-y-2">
            {concluidas.map((m) => (
              <MetaCard key={m.id} meta={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetaCard({ meta }) {
  const concluida = meta.status === "concluida";
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{meta.ativo.nome}</h3>
          <p className="text-sm text-slate-400">
            {TIPOS_ATIVO[meta.ativo.tipo]}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-emerald-400">
            {formatBRL(meta.valorAcumulado)}
          </p>
          <p className="text-xs text-slate-400">
            de {formatBRL(meta.valorAlvo)}
          </p>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        {formatData(meta.iniciadaEm)}{" "}
        {concluida && `→ ${formatData(meta.concluidaEm)}`}
        {" • "}
        {meta.aportes.length} aporte(s)
      </div>
    </div>
  );
}
