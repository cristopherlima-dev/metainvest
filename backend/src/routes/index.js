import { Router } from "express";
import * as ativos from "../controllers/ativosController.js";
import * as metas from "../controllers/metasController.js";
import * as aportes from "../controllers/aportesController.js";

const router = Router();

// Ativos
router.get("/ativos", ativos.listarAtivos);
router.get("/ativos/:id", ativos.buscarAtivo);
router.post("/ativos", ativos.criarAtivo);
router.put("/ativos/:id", ativos.atualizarAtivo);
router.delete("/ativos/:id", ativos.deletarAtivo);

// Metas
router.get("/metas", metas.listarMetas);
router.get("/metas/ativa", metas.buscarMetaAtiva);
router.get("/metas/:id", metas.buscarMeta);
router.post("/metas", metas.criarMeta);
router.put("/metas/:id", metas.atualizarMeta);

// Aportes
router.post("/aportes", aportes.criarAporte);
router.get("/aportes/meta/:metaId", aportes.listarAportesPorMeta);
router.delete("/aportes/:id", aportes.deletarAporte);

export default router;
