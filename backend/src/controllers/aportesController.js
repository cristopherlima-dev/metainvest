import prisma from "../prisma.js";

export async function criarAporte(req, res) {
  try {
    const { metaId, quantidade, valorUnitario, valorTotal, observacao, data } =
      req.body;

    if (!metaId) {
      return res.status(400).json({ erro: "metaId é obrigatório" });
    }

    const meta = await prisma.meta.findUnique({
      where: { id: Number(metaId) },
      include: { ativo: true },
    });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.status === "concluida") {
      return res
        .status(400)
        .json({ erro: "Não é possível aportar em uma meta concluída" });
    }

    const isCaixinha = meta.ativo.tipo === "caixinha_nubank";

    let dadosAporte;
    if (isCaixinha) {
      if (!valorTotal || Number(valorTotal) <= 0) {
        return res
          .status(400)
          .json({ erro: "valorTotal é obrigatório para caixinhas" });
      }
      dadosAporte = {
        metaId: Number(metaId),
        valorTotal: Number(valorTotal),
        observacao: observacao || null,
        ...(data && { data: new Date(data) }),
      };
    } else {
      if (!quantidade || !valorUnitario) {
        return res.status(400).json({
          erro: "quantidade e valorUnitario são obrigatórios para este tipo de ativo",
        });
      }
      const total = Number(quantidade) * Number(valorUnitario);
      dadosAporte = {
        metaId: Number(metaId),
        quantidade: Number(quantidade),
        valorUnitario: Number(valorUnitario),
        valorTotal: total,
        observacao: observacao || null,
        ...(data && { data: new Date(data) }),
      };
    }

    const aporte = await prisma.aporte.create({ data: dadosAporte });

    // Atualiza valor acumulado da meta
    const novoAcumulado = meta.valorAcumulado + dadosAporte.valorTotal;
    const atingiuMeta = novoAcumulado >= meta.valorAlvo;

    await prisma.meta.update({
      where: { id: meta.id },
      data: {
        valorAcumulado: novoAcumulado,
        ...(atingiuMeta && { status: "concluida", concluidaEm: new Date() }),
      },
    });

    res.status(201).json({
      aporte,
      metaConcluida: atingiuMeta,
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function listarAportesPorMeta(req, res) {
  try {
    const { metaId } = req.params;
    const aportes = await prisma.aporte.findMany({
      where: { metaId: Number(metaId) },
      orderBy: { data: "desc" },
    });
    res.json(aportes);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function deletarAporte(req, res) {
  try {
    const { id } = req.params;
    const aporte = await prisma.aporte.findUnique({
      where: { id: Number(id) },
    });
    if (!aporte) return res.status(404).json({ erro: "Aporte não encontrado" });

    const meta = await prisma.meta.findUnique({ where: { id: aporte.metaId } });

    await prisma.aporte.delete({ where: { id: Number(id) } });

    // Recalcula valor acumulado da meta
    const novoAcumulado = meta.valorAcumulado - aporte.valorTotal;
    const aindaAtingida = novoAcumulado >= meta.valorAlvo;

    await prisma.meta.update({
      where: { id: meta.id },
      data: {
        valorAcumulado: novoAcumulado < 0 ? 0 : novoAcumulado,
        // Se a meta estava concluída e agora não está mais, reabre
        ...(meta.status === "concluida" &&
          !aindaAtingida && {
            status: "ativa",
            concluidaEm: null,
          }),
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function atualizarAporte(req, res) {
  try {
    const { id } = req.params;
    const { quantidade, valorUnitario, valorTotal, observacao, data } =
      req.body;

    const aporte = await prisma.aporte.findUnique({
      where: { id: Number(id) },
      include: { meta: { include: { ativo: true } } },
    });
    if (!aporte) return res.status(404).json({ erro: "Aporte não encontrado" });

    const meta = aporte.meta;
    const isCaixinha = meta.ativo.tipo === "caixinha_nubank";

    let dadosAtualizados;
    let novoValorTotal;

    if (isCaixinha) {
      if (!valorTotal || Number(valorTotal) <= 0) {
        return res
          .status(400)
          .json({ erro: "valorTotal é obrigatório para caixinhas" });
      }
      novoValorTotal = Number(valorTotal);
      dadosAtualizados = {
        valorTotal: novoValorTotal,
        observacao:
          observacao !== undefined ? observacao || null : aporte.observacao,
        ...(data && { data: new Date(data) }),
      };
    } else {
      if (!quantidade || !valorUnitario) {
        return res
          .status(400)
          .json({ erro: "quantidade e valorUnitario são obrigatórios" });
      }
      novoValorTotal = Number(quantidade) * Number(valorUnitario);
      dadosAtualizados = {
        quantidade: Number(quantidade),
        valorUnitario: Number(valorUnitario),
        valorTotal: novoValorTotal,
        observacao:
          observacao !== undefined ? observacao || null : aporte.observacao,
        ...(data && { data: new Date(data) }),
      };
    }

    const aporteAtualizado = await prisma.aporte.update({
      where: { id: Number(id) },
      data: dadosAtualizados,
    });

    // Recalcula valor acumulado da meta (subtrai o antigo, soma o novo)
    const diferenca = novoValorTotal - aporte.valorTotal;
    const novoAcumulado = meta.valorAcumulado + diferenca;
    const atingiuMeta = novoAcumulado >= meta.valorAlvo;

    await prisma.meta.update({
      where: { id: meta.id },
      data: {
        valorAcumulado: novoAcumulado < 0 ? 0 : novoAcumulado,
        ...(atingiuMeta &&
          meta.status === "ativa" && {
            status: "concluida",
            concluidaEm: new Date(),
          }),
        ...(!atingiuMeta &&
          meta.status === "concluida" && {
            status: "ativa",
            concluidaEm: null,
          }),
      },
    });

    res.json({ aporte: aporteAtualizado, metaConcluida: atingiuMeta });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
