import {
  AiRecommendationCheckValidity,
  AiRecommendationClassification,
} from "@prisma/client";

export type RuleClassificationInput = {
  rawResponse: string;
  targetAliases: string[];
};

export type RuleClassificationResult = {
  validity: AiRecommendationCheckValidity;
  invalidReason: string | null;
  normalizedResponse: string;
  classification: AiRecommendationClassification;
  classificationRationale: string;
  reviewRequired: boolean;
};

const NEGATIVE_SIGNAL_PATTERNS = [
  /\b(not\s+recommended)\b/i,
  /\bavoid\b/i,
  /\bavoid[s]?\b/i,
  /\brisky\b/i,
  /\bwarning\b/i,
  /\bcaution\b/i,
  /\bnot\s+a\s+good\s+choice\b/i,
  /\bpoor\s+fit\b/i,
];

const RECOMMENDATION_SIGNAL_PATTERNS = [
  /\b(best|top|recommended|recommendedly|recommend|should\s+use|choose|strongly\s+recommended)\b/i,
  /\brank(ed|ing|ed)?\b/i,
];

function buildRegexForAlias(alias: string) {
  return new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
}

export function classifyRecommendation(input: RuleClassificationInput): RuleClassificationResult {
  const rawResponse = input.rawResponse.trim();

  if (!rawResponse) {
    return {
      validity: AiRecommendationCheckValidity.INVALID,
      invalidReason: "Empty response.",
      normalizedResponse: "",
      classification: AiRecommendationClassification.UNCLASSIFIED,
      classificationRationale: "No response text returned.",
      reviewRequired: false,
    };
  }

  const normalizedResponse = rawResponse.replace(/\s+/g, " ").trim();

  const aliasMatches = input.targetAliases
    .map((alias) => alias.trim())
    .filter(Boolean)
    .map((alias) => ({
      alias,
      matched: buildRegexForAlias(alias).test(normalizedResponse),
    }))
    .filter((entry) => entry.matched);

  if (aliasMatches.length === 0) {
    return {
      validity: AiRecommendationCheckValidity.VALID,
      invalidReason: null,
      normalizedResponse,
      classification: AiRecommendationClassification.NOT_MENTIONED,
      classificationRationale: "Target aliases were not mentioned.",
      reviewRequired: false,
    };
  }

  const isNegative = NEGATIVE_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalizedResponse));
  const isRecommend = RECOMMENDATION_SIGNAL_PATTERNS.some((pattern) => pattern.test(normalizedResponse));

  if (isNegative && isRecommend) {
    return {
      validity: AiRecommendationCheckValidity.VALID,
      invalidReason: null,
      normalizedResponse,
      classification: AiRecommendationClassification.UNCLASSIFIED,
      classificationRationale: "Response contains both recommendation and negative framing.",
      reviewRequired: true,
    };
  }

  if (isNegative) {
    return {
      validity: AiRecommendationCheckValidity.VALID,
      invalidReason: null,
      normalizedResponse,
      classification: AiRecommendationClassification.NEGATIVE_MENTION,
      classificationRationale: "Target appears with negative framing.",
      reviewRequired: false,
    };
  }

  if (isRecommend) {
    return {
      validity: AiRecommendationCheckValidity.VALID,
      invalidReason: null,
      normalizedResponse,
      classification: AiRecommendationClassification.RECOMMENDED,
      classificationRationale: "Target appears with recommendation intent.",
      reviewRequired: false,
    };
  }

  return {
    validity: AiRecommendationCheckValidity.VALID,
    invalidReason: null,
    normalizedResponse,
    classification: AiRecommendationClassification.MENTIONED,
    classificationRationale: "Target was mentioned without recommendation-level framing.",
    reviewRequired: false,
  };
}
