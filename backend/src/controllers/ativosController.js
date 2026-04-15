import prisma from "../prisma.js";

const TIPOS_VALIDOS = ["caixinha_nubank", "tesouro", "acao", "etf", "fii"];

export async function listarAtivos(req, res) {
  try {
    const ativos = await prisma.ativo.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        metas: {
          where: { status: "ativa" },
        },
      },
    });
    res.json(ativos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function buscarAtivo(req, res) {
  try {
    const { id } = req.params;
    const ativo = await prisma.ativo.findUnique({
      where: { id: Number(id) },
      include: {
        metas: {
          orderBy: { iniciadaEm: "desc" },
          include: { aportes: true },
        },
      },
    });
    if (!ativo) return res.status(404).json({ erro: "Ativo não encontrado" });
    res.json(ativo);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function criarAtivo(req, res) {
  try {
    const { nome, tipo, saldoInicial } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({ erro: "Nome e tipo são obrigatórios" });
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res
        .status(400)
        .json({ erro: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(", ")}` });
    }

    const ativo = await prisma.ativo.create({
      data: {
        nome,
        tipo,
        saldoInicial: saldoInicial ? Number(saldoInicial) : 0,
      },
    });
    res.status(201).json(ativo);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function atualizarAtivo(req, res) {
  try {
    const { id } = req.params;
    const { nome, saldoInicial } = req.body;

    const ativo = await prisma.ativo.update({
      where: { id: Number(id) },
      data: {
        ...(nome !== undefined && { nome }),
        ...(saldoInicial !== undefined && {
          saldoInicial: Number(saldoInicial),
        }),
      },
    });
    res.json(ativo);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function deletarAtivo(req, res) {
  try {
    const { id } = req.params;
    // Apaga aportes -> metas -> ativo
    const metas = await prisma.meta.findMany({
      where: { ativoId: Number(id) },
    });
    for (const m of metas) {
      await prisma.aporte.deleteMany({ where: { metaId: m.id } });
    }
    await prisma.meta.deleteMany({ where: { ativoId: Number(id) } });
    await prisma.ativo.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
