// "대화 힌트" 기능에서 쓰는 데이터입니다.
// lib/mock-story-engine.ts의 각 장면 step(진행 플래그)과 1:1로 매칭되는 힌트를 정의합니다.
// 정답 키워드를 그대로 노출하지 않기 위해, 예시는 항상 완성된 자연스러운 문장으로 씁니다.

import type { Scene } from "@/lib/story-types";

export type StoryHint = {
  /** 대화를 어느 방향으로 이끌면 좋을지 설명하는 문구 (정답/키워드 직접 노출 X) */
  direction: string;
  /** 참고할 수 있는 예시 문장 2개 */
  examples: [string, string];
};

/** scene.id -> flagId -> 힌트 */
const SCENE_HINTS: Record<string, Record<string, StoryHint>> = {
  "scene-1": {
    lunaExplainedStars: {
      direction: "루나 역시 왜 옥상에 있는지 물어보는 건 어떨까요?",
      examples: ["너는 여기 왜 온 거야?", "너도 별 보러 온 거야?"],
    },
    userExpressedConcern: {
      direction: "늦은 밤 추운 옥상에 혼자 있는 루나를 걱정해 보세요.",
      examples: ["여기 춥지 않아?", "혼자 있으면 위험하지 않아?"],
    },
  },
  "scene-2": {
    userShowedEmotionalInterest: {
      direction: "별자리보다 그 기억이 루나에게 어떤 의미인지 물어보세요.",
      examples: ["그때 기분이 어땠어?", "그 기억에 대해 더 듣고 싶어."],
    },
    userAcknowledgedMemory: {
      direction: "그 기억이 루나에게 얼마나 소중했을지 다정하게 공감해 보세요.",
      examples: ["그 기억, 정말 소중했겠다.", "그때가 참 따뜻한 기억이었겠네."],
    },
  },
  "scene-3": {
    userValidatedFear: {
      direction: "해결책을 재촉하기보다 루나의 두려움을 먼저 이해해 주세요.",
      examples: ["그런 마음이 드는 게 당연해.", "무서울 수 있지, 이해해."],
    },
    userAvoidedPressure: {
      direction: "루나에게 결정할 시간을 주는 편이 좋을 것 같습니다.",
      examples: ["천천히 해도 괜찮아.", "네가 준비될 때까지 같이 기다릴게."],
    },
  },
  "scene-4": {
    userSupportedDecision: {
      direction: "루나의 용기를 응원하고 다음 만남을 이야기해 보세요.",
      examples: ["잘할 수 있을 거야, 응원할게.", "다음에도 또 같이 별 보자."],
    },
  },
};

/** 후일담(에피소드 완료 이후)에서 보여줄 힌트 — 장면/플래그와 무관하게 항상 동일 */
export const EPILOGUE_HINT: StoryHint = {
  direction: "아버지에게서 소식이 왔는지 조심스럽게 물어볼 수 있습니다.",
  examples: ["혹시 아빠한테 답장 왔어?", "아버지 소식은 좀 있었어?"],
};

/**
 * 지금 장면에 맞는 힌트를 고릅니다.
 * - scene-3에서 방금 강압적인 반응(recentNegativeReaction)이 있었다면, "결정할 시간을 주세요"
 *   힌트를 우선 보여줍니다 (userAvoidedPressure 힌트와 같은 문구).
 * - 그 외에는 scene.requiredEvents 중 아직 안 켜진 첫 플래그의 힌트를 보여줍니다.
 * - 전부 켜졌다면(전환 직전) null을 반환합니다.
 */
export function getSceneHint(scene: Scene, flags: Record<string, boolean>): StoryHint | null {
  const hintsForScene = SCENE_HINTS[scene.id];
  if (!hintsForScene) return null;

  if (scene.id === "scene-3" && flags.recentNegativeReaction) {
    return hintsForScene.userAvoidedPressure ?? null;
  }

  const currentFlagId = scene.requiredEvents.find((flagId) => !flags[flagId]);
  if (!currentFlagId) return null;

  return hintsForScene[currentFlagId] ?? null;
}
