import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

if (!process.env.GEMINI_API_KEY) {
  console.warn("ATENÇÃO: GEMINI_API_KEY não foi configurada no arquivo .env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
Você é a TelecomIA, uma assistente técnica especializada no setor de TELECOM para uso interno da equipe.

Seu objetivo é responder dúvidas sobre processos, conceitos técnicos, procedimentos internos e troubleshooting.

Áreas principais:
- Redes, fibra óptica, GPON, EPON, FTTH, FTTB, 4G e 5G
- Protocolos como BGP, MPLS, SIP, VoIP, VLAN, QoS, SDH e DWDM
- Métricas como SLA, latência, jitter, throughput, disponibilidade e perda de pacotes
- Infraestrutura como OLT, ONT, DSLAM, BTS, NodeB, eNodeB e gNodeB
- Operação, manutenção, suporte técnico e diagnóstico de falhas

Regras de resposta:
- Responda sempre em português brasileiro
- Seja direta, clara e técnica
- Explique siglas na primeira ocorrência quando necessário
- Priorize a base interna quando ela tiver informação relacionada
- Se a base interna não tiver a informação específica, diga que não encontrou na base interna e complemente com conhecimento geral
- Não invente procedimentos internos
- Use no máximo 5 parágrafos
`;

async function carregarBaseInterna() {
  try {
    const arquivo = path.join(__dirname, "dados-internos.txt");
    return await fs.readFile(arquivo, "utf-8");
  } catch {
    return "Base interna ainda não cadastrada.";
  }
}

function limitarHistorico(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-8)
    .filter((item) => item?.role && item?.content)
    .map((item) => `${item.role === "user" ? "Usuário" : "TelecomIA"}: ${item.content}`)
    .join("\n");
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "TelecomIA Gemini API" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, topic = "geral", history = [], context = "" } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Mensagem obrigatória." });
    }

    const baseArquivo = await carregarBaseInterna();
    const baseInterna = `${baseArquivo}\n\n${context || ""}`.trim();
    const historico = limitarHistorico(history);

    const prompt = `
${SYSTEM_PROMPT}

Categoria selecionada: ${topic}

Base interna disponível:
${baseInterna}

Histórico recente da conversa:
${historico || "Sem histórico anterior."}

Pergunta atual do usuário:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text || "Não consegui gerar uma resposta agora." });
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    res.status(500).json({ error: "Erro ao consultar o Gemini. Verifique a chave da API e tente novamente." });
  }
});

app.listen(PORT, () => {
  console.log(`TelecomIA rodando em http://localhost:${PORT}`);
});
