import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatBRL, formatData, TIPOS_ATIVO } from "../utils/format";
import { useUI } from "../contexts/UIContext";

export default function Dashboard() {
  const { toast, confirm } = useUI();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    quantidade: "",
    valorUnitario: "",
    valorTotal: "",
    observacao: "",
  });

  async function carregarMeta() {
    setLoading(true);
    try {
      const res = await api.get("/metas/ativa");
      setMeta(res.data);
    } catch {
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMeta();
  }, []);

  async function registrarAporte(e) {
    e.preventDefault();
    const isCaixinha = meta.ativo.tipo === "caixinha_nubank";
    const payload = { metaId: meta.id, observacao: form.observacao };

    if (isCaixinha) {
      payload.valorTotal = form.valorTotal;
    } else {
      payload.quantidade = form.quantidade;
      payload.valorUnitario = form.valorUnitario;
    }

    try {
      const res = await api.post("/aportes", payload);
      setForm({
        quantidade: "",
        valorUnitario: "",
        valorTotal: "",
        observacao: "",
      });
      setShowForm(false);
      if (res.data.metaConcluida) {
        toast.success("🎉 Parabéns! Meta concluída!");
      } else {
        toast.success("Aporte registrado!");
      }
      carregarMeta();
    } catch (err) {
      toast.error(err.response?.data?.erro || "Erro ao registrar aporte");
    }
  }

  async function excluirAporte(id) {
    const ok = await confirm({
      title: "Excluir aporte",
      message:
        "Tem certeza que deseja excluir este aporte? O valor acumulado da meta será recalculado.",
      confirmText: "Excluir",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/aportes/${id}`);
      toast.success("Aporte excluído");
      carregarMeta();
    } catch (err) {
      toast.error(err.response?.data?.erro || "Erro ao excluir");
    }
  }

  if (loading) return <p className="text-slate-400">Carregando...</p>;

  if (!meta) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Nenhuma meta ativa</h2>
        <p className="text-slate-400 mb-6">
          Crie um ativo e inicie uma nova meta para começar a acompanhar seus
          aportes.
        </p>
        <Link
          to="/ativos"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Ir para Ativos
        </Link>
      </div>
    );
  }

  const progresso = Math.min((meta.valorAcumulado / meta.valorAlvo) * 100, 100);
  const isCaixinha = meta.ativo.tipo === "caixinha_nubank";

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-sm">Meta ativa</p>
            <h2 className="text-3xl font-bold">{meta.ativo.nome}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {TIPOS_ATIVO[meta.ativo.tipo]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Iniciada em</p>
            <p>{formatData(meta.iniciadaEm)}</p>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-300">
            {formatBRL(meta.valorAcumulado)} / {formatBRL(meta.valorAlvo)}
          </span>
          <span className="text-emerald-400 font-semibold">
            {progresso.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancelar" : "+ Novo aporte"}
        </button>

        {showForm && (
          <form
            onSubmit={registrarAporte}
            className="mt-4 space-y-3 bg-slate-900 p-4 rounded-lg"
          >
            {isCaixinha ? (
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.valorTotal}
                  onChange={(e) =>
                    setForm({ ...form, valorTotal: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    required
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm({ ...form, quantidade: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Valor unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.valorUnitario}
                    onChange={(e) =>
                      setForm({ ...form, valorUnitario: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  />
                </div>
                {form.quantidade && form.valorUnitario && (
                  <div className="col-span-2 text-sm text-slate-400">
                    Total:{" "}
                    {formatBRL(
                      Number(form.quantidade) * Number(form.valorUnitario),
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Observação (opcional)
              </label>
              <input
                type="text"
                value={form.observacao}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold transition"
            >
              Registrar
            </button>
          </form>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Aportes da meta</h3>
        {meta.aportes.length === 0 ? (
          <p className="text-slate-400">Nenhum aporte registrado ainda.</p>
        ) : (
          <div className="space-y-2">
            {meta.aportes.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center bg-slate-900 p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{formatBRL(a.valorTotal)}</p>
                  <p className="text-xs text-slate-400">
                    {formatData(a.data)}
                    {a.quantidade &&
                      ` • ${a.quantidade} × ${formatBRL(a.valorUnitario)}`}
                    {a.observacao && ` • ${a.observacao}`}
                  </p>
                </div>
                <button
                  onClick={() => excluirAporte(a.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
