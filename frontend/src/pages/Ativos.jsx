import { useEffect, useState } from "react";
import api from "../services/api";
import { formatBRL, TIPOS_ATIVO } from "../utils/format";
import { useUI } from "../contexts/UIContext";

export default function Ativos() {
  const { toast, confirm, prompt } = useUI();
  const [ativos, setAtivos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "caixinha_nubank",
    saldoInicial: "",
  });

  async function carregar() {
    const res = await api.get("/ativos");
    setAtivos(res.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarAtivo(e) {
    e.preventDefault();
    try {
      await api.post("/ativos", form);
      setForm({ nome: "", tipo: "caixinha_nubank", saldoInicial: "" });
      setShowForm(false);
      toast.success("Ativo criado!");
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || "Erro ao criar ativo");
    }
  }

  async function iniciarMeta(ativoId) {
    const valorAlvo = await prompt({
      title: "Nova meta",
      message: "Defina o valor alvo desta meta:",
      defaultValue: "1000",
      inputType: "number",
      confirmText: "Criar meta",
    });
    if (valorAlvo === null) return;
    try {
      await api.post("/metas", { ativoId, valorAlvo });
      toast.success("Meta criada! Vá ao Dashboard para acompanhar.");
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || "Erro ao criar meta");
    }
  }

  async function excluirAtivo(id, nome) {
    const ok = await confirm({
      title: "Excluir ativo",
      message: `Tem certeza que deseja excluir "${nome}"? Todas as metas e aportes relacionados serão perdidos.`,
      confirmText: "Excluir",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/ativos/${id}`);
      toast.success("Ativo excluído");
      carregar();
    } catch (err) {
      toast.error(err.response?.data?.erro || "Erro ao excluir");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ativos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          {showForm ? "Cancelar" : "+ Novo ativo"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={criarAtivo}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4"
        >
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: ITSA4, Caixinha Viagem, Tesouro Selic 2029"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            >
              {Object.entries(TIPOS_ATIVO).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Saldo inicial em R$ (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.saldoInicial}
              onChange={(e) =>
                setForm({ ...form, saldoInicial: e.target.value })
              }
              placeholder="0,00"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {ativos.length === 0 ? (
          <p className="text-slate-400">Nenhum ativo cadastrado ainda.</p>
        ) : (
          ativos.map((a) => {
            const temMetaAtiva = a.metas && a.metas.length > 0;
            return (
              <div
                key={a.id}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">{a.nome}</h3>
                  <p className="text-sm text-slate-400">
                    {TIPOS_ATIVO[a.tipo]} • Saldo inicial:{" "}
                    {formatBRL(a.saldoInicial)}
                  </p>
                  {temMetaAtiva && (
                    <span className="inline-block mt-1 text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded">
                      Meta ativa
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!temMetaAtiva && (
                    <button
                      onClick={() => iniciarMeta(a.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm font-semibold"
                    >
                      Iniciar meta
                    </button>
                  )}
                  <button
                    onClick={() => excluirAtivo(a.id, a.nome)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
