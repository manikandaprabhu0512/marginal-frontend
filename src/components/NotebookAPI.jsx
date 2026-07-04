import axios from "axios";

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

const uid = (prefix) => `${prefix}-${crypto.randomUUID()}`;

let notebooks = [
  {
    id: "nb-1",
    title: "Climate Policy Briefs",
    emoji: "🌎",
    description: "EU and US climate legislation, 2023–2025",
    sourceCount: 4,
    createdAt: "2026-05-02T10:00:00Z",
    updatedAt: "2026-06-10T14:32:00Z",
  },
  {
    id: "nb-2",
    title: "Thesis — Chapter 3",
    emoji: "📚",
    description: "Literature review on distributed consensus",
    sourceCount: 7,
    createdAt: "2026-04-18T09:00:00Z",
    updatedAt: "2026-06-09T08:15:00Z",
  },
  {
    id: "nb-3",
    title: "Q2 Competitor Research",
    emoji: "🔍",
    description: "Product teardown notes and transcripts",
    sourceCount: 3,
    createdAt: "2026-06-01T12:00:00Z",
    updatedAt: "2026-06-08T17:45:00Z",
  },
];

let sources = [
  {
    id: "src-1",
    notebookId: "nb-1",
    title: "EU Green Deal — Summary Report 2024",
    type: "pdf",
    status: "ready",
    addedAt: "2026-05-02T10:05:00Z",
    excerpt:
      "The European Green Deal sets out a roadmap for making the EU's economy sustainable by turning climate and environmental challenges into opportunities...",
    wordCount: 12400,
  },
  {
    id: "src-2",
    notebookId: "nb-1",
    title: "Inflation Reduction Act — Section 13",
    type: "pdf",
    status: "ready",
    addedAt: "2026-05-03T11:20:00Z",
    excerpt:
      "Section 13 establishes tax credits for clean energy production and investment, extending and modifying existing credits under sections 45 and 48...",
    wordCount: 8900,
  },
  {
    id: "src-3",
    notebookId: "nb-1",
    title: "Carbon Border Adjustment Mechanism — explainer",
    type: "url",
    status: "ready",
    addedAt: "2026-05-10T09:00:00Z",
    excerpt:
      "CBAM is designed to put a fair price on carbon emitted during the production of carbon intensive goods entering the EU...",
    wordCount: 3200,
  },
  {
    id: "src-4",
    notebookId: "nb-1",
    title: "Panel discussion — Climate finance gap",
    type: "youtube",
    status: "processing",
    addedAt: "2026-06-10T14:32:00Z",
    wordCount: 0,
  },
];

let messages = [
  {
    id: "msg-1",
    notebookId: "nb-1",
    role: "user",
    content: "What mechanisms does the EU use to prevent carbon leakage?",
    created_at: "2026-06-10T14:00:00Z",
  },
  {
    id: "msg-2",
    notebookId: "nb-1",
    role: "assistant",
    content:
      "The primary mechanism is the Carbon Border Adjustment Mechanism (CBAM), which applies a carbon price to imports of certain goods to match the price paid by EU producers under the EU Emissions Trading System. This prevents companies from relocating production to countries with weaker climate policies.",
    citations: [
      {
        sourceId: "src-3",
        sourceTitle: "Carbon Border Adjustment Mechanism — explainer",
        snippet:
          "CBAM is designed to put a fair price on carbon emitted during the production of carbon intensive goods entering the EU...",
        index: 1,
      },
      {
        sourceId: "src-1",
        sourceTitle: "EU Green Deal — Summary Report 2024",
        snippet:
          "...to ensure that the price of carbon embedded in imports reflects domestic carbon pricing...",
        index: 2,
      },
    ],
    createdAt: "2026-06-10T14:00:08Z",
  },
];

let artifacts = [
  {
    id: "art-1",
    notebookId: "nb-1",
    type: "summary",
    title: "Overview summary",
    content:
      "These sources cover the EU's Green Deal framework, the US Inflation Reduction Act's clean energy provisions, and the Carbon Border Adjustment Mechanism. Together they outline how both blocs are using a mix of subsidies (US) and carbon pricing with border adjustments (EU) to drive decarbonization while managing competitive effects on domestic industry.",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "art-2",
    notebookId: "nb-1",
    type: "study_guide",
    title: "Key terms & definitions",
    content:
      "CBAM — Carbon Border Adjustment Mechanism, a tariff on the carbon content of imports.\nETS — EU Emissions Trading System, a cap-and-trade scheme for carbon emissions.\nIRA Section 45/48 — US tax credit provisions for clean electricity production and investment.",
    createdAt: "2026-06-06T09:30:00Z",
  },
];

export async function listNotebooks() {
  const response = await axios.get(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations`,
  );
  return response.data;
}

export async function getNotebook(id) {
  const response = await axios.get(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${id}`,
  );
  return response.data;
}

export async function createNotebook(title, description = "") {
  const response = await axios.post(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations`,
    {
      conversation_id: uid("nb"),
      title,
    },
  );

  return response.data;
}

export async function deleteNotebook(id) {
  await delay();
  notebooks = notebooks.filter((n) => n.id !== id);
  sources = sources.filter((s) => s.notebookId !== id);
  messages = messages.filter((m) => m.notebookId !== id);
  artifacts = artifacts.filter((a) => a.notebookId !== id);
}

export async function renameNotebook(id, title) {
  await delay(200);
  const nb = notebooks.find((n) => n.id === id);
  if (!nb) return null;
  nb.title = title;
  nb.updatedAt = new Date().toISOString();
  return nb;
}

export async function listSources(conversation_id) {
  const response = await axios.get(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/sources`,
  );

  return response.data;
}

export async function addSource(conversation_id, query) {
  const response = await fetch(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/first-query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  return response;
}

export async function deleteSource(conversation_id, sourceId) {
  const response = await axios.delete(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/sources/${sourceId}`,
  );
}

export async function listMessages(conversation_id) {
  const response = await axios.get(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/messages`,
  );

  return response.data;
}

export async function sendMessage(
  conversation_id,
  message,
  excluded_urls = [],
  files = [],
) {
  const formData = new FormData();

  formData.append("message", message);
  formData.append("excluded_urls", JSON.stringify(excluded_urls));

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/message`,
    {
      method: "POST",
      body: formData,
    },
  );

  return response;
}

export async function listArtifacts(notebookId) {
  await delay(250);
  return artifacts
    .filter((a) => a.notebookId === notebookId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function generateArtifact(notebookId, type, title) {
  await delay(1800);
  const art = {
    id: uid("art"),
    notebookId,
    type,
    title,
    content:
      "This is placeholder content generated by the mock API. Replace `generateArtifact` in `lib/api.ts` with a call to your backend's generation endpoint.",
    createdAt: new Date().toISOString(),
  };
  artifacts.unshift(art);
  return art;
}

export async function deleteArtifact(artifactId) {
  await delay(200);
  artifacts = artifacts.filter((a) => a.id !== artifactId);
}

export async function handleInterrupted(conversation_id, id) {
  const response = await fetch(
    `${import.meta.env.VITE_MARGINAL_URL}/conversations/${conversation_id}/resume`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision: id }),
    },
  );

  return response;
}
