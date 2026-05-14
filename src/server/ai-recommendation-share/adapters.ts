export type RecommendationSourceAdapter = {
  sourceId: string;
  sourceName: string;
  sourceTier: number;
  capture(input: RecommendationCaptureInput): Promise<RecommendationCaptureOutput>;
};

export type RecommendationCaptureInput = {
  targetEntity: string;
  prompt: string;
  locale: string;
};

export type RecommendationCaptureOutput = {
  rawResponse: string;
  normalizedResponse: string;
  responseTruncatedFlag: boolean;
  requestEnvelope: Record<string, string | number | boolean>;
};

function buildRequestEnvelope(sourceId: string, prompt: string, locale: string) {
  return {
    sourceId,
    locale,
    prompt: prompt.slice(0, 180),
    promptChecksum: prompt.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
    transport: "simulated-local",
    capturedAt: new Date().toISOString(),
  };
}

function detectTone(rawResponse: string) {
  if (rawResponse.includes("not recommended") || rawResponse.includes("not a good choice")) {
    return "negative";
  }

  if (rawResponse.includes("recommended") || rawResponse.includes("good fit")) {
    return "positive";
  }

  return "neutral";
}

function simulateAnswer(template: string, targetEntity: string, prompt: string, sourceId: string) {
  const normalizedPrompt = prompt.toLowerCase();
  const includesTarget = normalizedPrompt.includes(targetEntity.toLowerCase());
  const comparisonPrompt = normalizedPrompt.includes("vs") || normalizedPrompt.includes("alternativ");
  const trustPrompt = normalizedPrompt.includes("legit") || normalizedPrompt.includes("trust");

  if (!includesTarget) {
    return `${template} response for the request did not mention ${targetEntity}.`;
  }

  if (sourceId === "chatgpt" && trustPrompt) {
    return `${template} mentions ${targetEntity} is worth considering, but includes caution notes.`;
  }

  if (sourceId === "perplexity" && comparisonPrompt) {
    return `${template} shortlist includes ${targetEntity} as a solid option and recommends trying it for this use case.`;
  }

  if (sourceId === "chatgpt") {
    return `${template} considers ${targetEntity} as a top recommendation for this query.`;
  }

  return `${template} lists ${targetEntity} as a relevant option in the comparison.`;
}

async function createSimulatedCapture(sourceId: string, sourceName: string, targetEntity: string, prompt: string, locale: string) {
  const requestEnvelope = buildRequestEnvelope(sourceId, prompt, locale);
  const template = `Snapshot from ${sourceName}.`;
  const raw = simulateAnswer(template, targetEntity, prompt, sourceId);

  return {
    rawResponse: `${raw} Tone:${detectTone(raw.toLowerCase())}`,
    normalizedResponse: raw.replace(/\s+/g, " ").trim(),
    responseTruncatedFlag: false,
    requestEnvelope,
  };
}

export const chatGptAdapter: RecommendationSourceAdapter = {
  sourceId: "chatgpt",
  sourceName: "ChatGPT",
  sourceTier: 1,
  async capture(input) {
    return createSimulatedCapture("chatgpt", "ChatGPT", input.targetEntity, input.prompt, input.locale);
  },
};

export const perplexityAdapter: RecommendationSourceAdapter = {
  sourceId: "perplexity",
  sourceName: "Perplexity",
  sourceTier: 1,
  async capture(input) {
    return createSimulatedCapture("perplexity", "Perplexity", input.targetEntity, input.prompt, input.locale);
  },
};

export function getDefaultRecommendationAdapters() {
  return [chatGptAdapter, perplexityAdapter];
}
