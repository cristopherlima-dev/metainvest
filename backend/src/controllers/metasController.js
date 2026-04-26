import prisma from "../prisma.js";

export async function listarMetas(req, res) {
  try {
    const metas = await prisma.meta.findMany({
      orderBy: { iniciadaEm: "desc" },
      include: { ativo: true, aportes: true },
    });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function buscarMeta(req, res) {
  try {
    const { id } = req.params;
    const meta = await prisma.meta.findUnique({
      where: { id: Number(id) },
      include: { ativo: true, aportes: { orderBy: { data: "desc" } } },
    });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function criarMeta(req, res) {
  try {
    const { ativoId, valorAlvo } = req.body;

    if (!ativoId) {
      return res.status(400).json({ erro: "ativoId é obrigatório" });
    }

    const ativo = await prisma.ativo.findUnique({
      where: { id: Number(ativoId) },
    });
    if (!ativo) return res.status(404).json({ erro: "Ativo não encontrado" });

    // Regra: só pode existir UMA meta ativa POR ATIVO
    const metaAtivaDoAtivo = await prisma.meta.findFirst({
      where: { ativoId: Number(ativoId), status: "ativa" },
    });
    if (metaAtivaDoAtivo) {
      return res.status(400).json({
        erro: `O ativo "${ativo.nome}" já possui uma meta ativa. Conclua-a antes de criar uma nova.`,
      });
    }

    // Verifica se é a primeira meta deste ativo
    const totalMetas = await prisma.meta.count({
      where: { ativoId: Number(ativoId) },
    });
    const isPrimeiraMeta = totalMetas === 0;

    const alvo = valorAlvo ? Number(valorAlvo) : 1000;
    const acumuladoInicial = isPrimeiraMeta ? ativo.saldoInicial : 0;
    const jaAtingiu = acumuladoInicial >= alvo;

    const meta = await prisma.meta.create({
      data: {
        ativoId: Number(ativoId),
        valorAlvo: alvo,
        valorAcumulado: acumuladoInicial,
        ...(jaAtingiu && { status: "concluida", concluidaEm: new Date() }),
      },
      include: { ativo: true },
    });

    res.status(201).json({ meta, jaConcluida: jaAtingiu });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function atualizarMeta(req, res) {
  try {
    const { id } = req.params;
    const { valorAlvo } = req.body;

    const meta = await prisma.meta.findUnique({ where: { id: Number(id) } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.status === "concluida") {
      return res
        .status(400)
        .json({ erro: "Não é possível alterar uma meta concluída" });
    }

    const atualizada = await prisma.meta.update({
      where: { id: Number(id) },
      data: { valorAlvo: Number(valorAlvo) },
    });
    res.json(atualizada);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function buscarMetasAtivas(req, res) {
  try {
    const metas = await prisma.meta.findMany({
      where: { status: "ativa" },
      orderBy: { iniciadaEm: "asc" },
      include: { ativo: true, aportes: { orderBy: { data: "desc" } } },
    });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
