// 지금 단계에서 "AI 답변"을 대신하는 목업 엔진입니다.
// 사용자 메시지에 특정 키워드가 들어있는지와 지금까지 대화 횟수만 보고
// 간단하게 답변/호감도 변화/이벤트를 만들어냅니다.
//
// 나중에 실제 AI API를 연결할 때는, 이 파일의 mockStoryEngine과
// 똑같은 입력/출력 타입(StoryEngine)을 가진 aiStoryEngine을 새로 만들어서
// components/story-chat-panel.tsx에서 import 한 줄만 바꾸면 됩니다.
// (Scene의 setting/goal/forbiddenEvents 등을 실제 AI 프롬프트에 그대로 넣으면 됩니다.)

import type { StoryEngine, StoryEngineOutput } from "@/lib/story-types";

type SceneMockData = {
  /** 이 장면이 시작될 때 루나가 먼저 건네는 대사 */
  openingLine: string;
  /** 다정한 키워드가 감지됐을 때 순환해서 보여줄 답변들 */
  friendlyReplies: string[];
  /** 특별한 키워드가 없을 때 순환해서 보여줄 기본 답변들 */
  neutralReplies: string[];
  /** 다정한 반응으로 인정할 키워드 목록 */
  friendlyKeywords: string[];
  /** 금지된 화제를 건드렸을 때 순환해서 보여줄 회피성 답변들 */
  deflectReplies?: string[];
  /** 금지된 화제를 건드렸다고 판단할 키워드 목록 */
  forbiddenTriggerKeywords?: string[];
};

const SCENE_MOCK_DATA: Record<string, SceneMockData> = {
  "scene-1": {
    openingLine: "...너, 왜 여기 있어? 아무도 없을 시간인데.",
    // ⚠️ "걱정", "옆에 있을게"는 데모 테스트 편의를 위해 임시로 추가한 키워드입니다.
    friendlyKeywords: [
      "고마워",
      "고맙",
      "괜찮아",
      "같이",
      "친구",
      "이쁘다",
      "예쁘다",
      "힘내",
      "궁금해",
      "좋아",
      "걱정",
      "옆에 있을게",
    ],
    friendlyReplies: [
      "그렇게 말해주니까... 고마워. 낯선 사람인데 신경 써줘서.",
      "...너 생각보다 다정하네. 조금 놀랐어.",
      "고마워. 그런 말 들으니까 마음이 좀 풀리는 것 같아.",
    ],
    neutralReplies: [
      "여긴 원래 아무도 안 오는 곳인데. 신기하네.",
      "...뭐, 딱히 상관없어. 그냥 조용히 있고 싶었을 뿐이야.",
      "너도 잠이 안 와서 온 거야?",
    ],
    forbiddenTriggerKeywords: ["무슨 일", "왜 그래", "무슨일", "힘든 일", "안 좋은 일"],
    deflectReplies: [
      "...그건, 아직은 말하고 싶지 않아. 미안해.",
      "그냥... 아무것도 아니야. 신경 쓰지 마.",
    ],
  },
  "scene-2": {
    openingLine:
      "있잖아... 여기서 보면 별이 되게 잘 보이거든. 가끔 혼자 오는 곳이야.",
    friendlyKeywords: [
      "고마워",
      "고맙",
      "괜찮아",
      "같이",
      "친구",
      "좋아",
      "궁금해",
    ],
    friendlyReplies: [
      "정말? 나도... 그렇게 말해주는 사람 오랜만이야.",
      "고마워. 왠지 오늘은 편하게 얘기할 수 있을 것 같아.",
    ],
    neutralReplies: [
      "요즘 학교에서 좀... 답답한 일이 많았어.",
      "그냥, 여기 오면 숨통이 트이는 기분이야.",
      "혼자 있는 게 편할 때도 있잖아. 근데 오늘은 좀 다르네.",
    ],
  },
};

/** 장면이 시작될 때 루나가 먼저 건네는 대사를 가져옵니다. */
export function getSceneOpeningLine(sceneId: string): string {
  return SCENE_MOCK_DATA[sceneId]?.openingLine ?? "...";
}

function includesAny(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}

function pickCyclingLine(lines: string[], turnCount: number): string {
  if (lines.length === 0) return "...";
  return lines[turnCount % lines.length];
}

export const mockStoryEngine: StoryEngine = ({ scene, userMessage, state }) => {
  const data = SCENE_MOCK_DATA[scene.id];
  if (!data) {
    return { reply: "...", affectionDelta: 0, newEvents: [] };
  }

  // 1) 금지된 화제를 건드렸는지 먼저 확인 (forbiddenEvents 반영)
  if (
    data.forbiddenTriggerKeywords &&
    includesAny(userMessage, data.forbiddenTriggerKeywords)
  ) {
    const reply = pickCyclingLine(data.deflectReplies ?? [], state.turnCount);
    const result: StoryEngineOutput = { reply, affectionDelta: 0, newEvents: [] };
    return result;
  }

  // 2) 다정한 키워드가 있는지 확인 (requiredEvents 중 friendly_reaction 반영)
  if (includesAny(userMessage, data.friendlyKeywords)) {
    const reply = pickCyclingLine(data.friendlyReplies, state.turnCount);
    return { reply, affectionDelta: 4, newEvents: ["friendly_reaction"] };
  }

  // 3) 그 외 일반적인 메시지
  const reply = pickCyclingLine(data.neutralReplies, state.turnCount);
  return { reply, affectionDelta: 1, newEvents: [] };
};
