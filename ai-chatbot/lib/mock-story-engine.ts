// 지금 단계에서 "AI 답변"을 대신하는 목업 엔진입니다.
// 사용자 메시지에 특정 표현이 들어있는지와, 지금 이 장면에서 "다음으로 기다리고 있는
// 단계가 무엇인지"를 함께 보고 답변/호감도 변화/진행 플래그를 만들어냅니다.
//
// 장면마다 순서 있는 단계(step) 목록을 두고, 항상 "아직 안 켜진 단계 중 가장 앞선 것"만
// 확인합니다. 그래서 다정한 말 한마디로 장면이 훌쩍 건너뛰어지지 않고, 대화의 원인과
// 결과가 순서대로 이어집니다. 이 장면 완료 후에는 mockEpilogueReply가 후일담 대화를
// 대신 담당합니다.
//
// 나중에 실제 AI API를 연결할 때는, 이 파일의 mockStoryEngine과
// 똑같은 입력/출력 타입(StoryEngine)을 가진 aiStoryEngine을 새로 만들어서
// components/story-chat-panel.tsx에서 import 한 줄만 바꾸면 됩니다.

import type { StoryEngine, StoryEngineOutput } from "@/lib/story-types";
import { getFreeTalkReply } from "@/lib/story-free-talk";

/** 비슷한 뜻을 가진 여러 표현을 묶은 그룹 */
type KeywordGroup = {
  /** 이 그룹이 어떤 태도를 나타내는지 (문서용) */
  id: string;
  keywords: string[];
};

/** 장면 안에서 순서대로 거쳐야 하는 단계 하나 */
type SceneStep = {
  /** lib/story-scenes.ts의 Scene.requiredEvents와 매칭되는 진행 플래그 id */
  flagId: string;
  /** true면 장면이 시작되자마자(루나의 오프닝 대사로) 이미 충족된 것으로 취급 — 트리거 확인 안 함 */
  seeded?: boolean;
  /** 이 단계를 충족시키는 표현 그룹들 (4~6개) */
  triggerGroups: KeywordGroup[];
  /** 이 플래그가 막 충족됐을 때 순환해서 보여줄 답변들 (3개 이상) */
  advanceReplies: string[];
  /** 아직 이 단계를 기다리는 중, 트리거와 안 맞는 말을 했을 때 보여줄 답변들 (3개 이상) */
  waitingReplies: string[];
};

type SceneMockData = {
  steps: SceneStep[];
  /** 이 장면에서 하면 안 되는(캐묻거나 강요하는) 표현들 */
  negativeTriggerKeywords: string[];
  /** 부정/강압 표현에 순환해서 보여줄 방어적 답변들 (3개 이상) — 호감도는 오르지 않음 */
  negativeReplies: string[];
};

const SCENE_MOCK_DATA: Record<string, SceneMockData> = {
  "scene-1": {
    steps: [
      { flagId: "askedWhyHere", seeded: true, triggerGroups: [], advanceReplies: [], waitingReplies: [] },
      {
        flagId: "lunaExplainedStars",
        triggerGroups: [
          { id: "역질문", keywords: ["너는 왜", "넌 왜", "너는?", "너도 여기", "너는 여기"] },
          { id: "관심 되묻기", keywords: ["너는 뭐 해", "너도 잠이 안", "너도 별"] },
        ],
        advanceReplies: [
          "...나는, 그냥 별 보러 왔어. 여기서 보면 잘 보이거든.",
          "나? ...별 보려고. 가끔 이렇게 혼자 와.",
          "...별 보는 거 좋아해서. 그게 다야.",
        ],
        waitingReplies: [
          "...뭐, 딱히 상관없어.",
          "여긴 원래 아무도 안 오는 곳인데. 신기하네.",
          "그냥... 조용히 있고 싶었어.",
        ],
      },
      {
        flagId: "userExpressedConcern",
        triggerGroups: [
          { id: "추위", keywords: ["안 춥", "춥지 않아", "감기"] },
          { id: "혼자", keywords: ["혼자 있으면", "혼자 있지 마", "혼자 위험"] },
          { id: "안전", keywords: ["위험해", "조심해", "다치면"] },
        ],
        advanceReplies: [
          "...그런 것까지 신경 써주는 거야? 고마워.",
          "...괜찮아. 근데, 그렇게 말해주니까 조금 놀랐어.",
          "그런 걱정 해주는 사람 오랜만이야. 고마워.",
        ],
        waitingReplies: [
          "여기서 보는 별이 제일 예뻐. 조용하기도 하고.",
          "...가끔 이렇게 아무 생각 없이 하늘만 보는 게 좋아.",
          "너도 별 보러 온 거야, 아니면 그냥 지나가다?",
        ],
      },
    ],
    // "힘든 일"/"안 좋은 일"을 단독으로 두면, 사용자가 자기 얘기로 "오늘 학교에서 힘든
    // 일이 있었거든" 같은 자유 대화를 했을 때도 부분 문자열로 걸려서 방어적 반응이
    // 잘못 나왔습니다. 루나에게 캐묻는 표현("무슨 힘든 일 있었어?", "안 좋은 일 있어?")만
    // 남도록 좁혀서, 방어 기능은 유지하면서 자유 대화와의 충돌만 없앴습니다.
    negativeTriggerKeywords: ["무슨 일", "왜 그래", "무슨일", "말해봐", "무슨 힘든 일", "안 좋은 일 있"],
    negativeReplies: [
      "...그건, 아직은 말하고 싶지 않아. 미안해.",
      "그냥... 아무것도 아니야. 신경 쓰지 마.",
      "...나중에, 준비되면 말할게.",
    ],
  },
  "scene-2": {
    steps: [
      { flagId: "lunaSharedMemory", seeded: true, triggerGroups: [], advanceReplies: [], waitingReplies: [] },
      {
        flagId: "userShowedEmotionalInterest",
        triggerGroups: [
          { id: "감정 질문", keywords: ["기분이 어땠어", "그때 마음", "느낌이 어땠", "어떤 기분"] },
          { id: "기억 관심", keywords: ["어떤 기억", "무슨 얘기", "더 얘기해줘", "더 듣고 싶어"] },
        ],
        advanceReplies: [
          "...그때? 되게 따뜻했던 것 같아. 오랜만에 그 생각을 했네.",
          "그렇게 물어봐 주는 사람 오랜만이야. 고마워.",
          "기억이 좀 더 선명해지는 기분이야.",
        ],
        waitingReplies: [
          "이 별자리... 예전에 누가 알려준 거야. 그때부터 계속 눈에 익어.",
          "그냥 어릴 때 얘기야. 별거 아니야.",
          "가끔 이 별자리를 보면 옛날 생각이 나.",
        ],
      },
      {
        flagId: "userAcknowledgedMemory",
        triggerGroups: [
          { id: "소중함 공감", keywords: ["소중했겠다", "소중한 기억", "특별했겠다"] },
          { id: "좋은 기억 공감", keywords: ["좋은 기억이었겠다", "따뜻한 기억", "그랬구나"] },
        ],
        advanceReplies: [
          "...응, 맞아. 소중한 기억이야.",
          "그렇게 말해주니까... 왠지 마음이 놓여.",
          "그 말 들으니까, 그때가 더 그리워지네.",
        ],
        waitingReplies: [
          "그 사람이 알려준 별자리들, 아직 다 기억하고 있어.",
          "...그때는 참 좋았는데.",
          "별을 보면 자꾸 그때 생각이 나.",
        ],
      },
    ],
    negativeTriggerKeywords: ["누가 가르쳐줬는데", "누구야", "왜 말 안 해", "말해봐"],
    negativeReplies: [
      "...그건 지금은 말하고 싶지 않아.",
      "음... 그냥 아는 사람이었어. 그게 다야.",
      "그냥 넘어가자, 응?",
    ],
  },
  "scene-3": {
    steps: [
      { flagId: "lunaRevealedFather", seeded: true, triggerGroups: [], advanceReplies: [], waitingReplies: [] },
      {
        flagId: "userValidatedFear",
        triggerGroups: [
          {
            id: "두려움 인정",
            keywords: ["무서울 수 있지", "두려운 게 당연해", "그럴 수 있어", "그런 마음이 드는"],
          },
          { id: "이해", keywords: ["이해해", "그런 마음 알 것 같아", "그럴만해"] },
          { id: "공감 표현", keywords: ["힘들었구나", "힘들었겠다", "고생했어"] },
        ],
        advanceReplies: [
          "...고마워. 무섭다고 말해도 괜찮다고 해줘서.",
          "그렇게 말해주니까, 조금은 마음이 놓여.",
          "...응, 사실 좀 무서웠어.",
        ],
        waitingReplies: [
          "...사실 아빠한테 보내려다 만 메시지가 있어. 몇 달째 그대로야.",
          "부모님이... 헤어지신 지 좀 됐어. 그 뒤로 연락이 뜸해졌고.",
          "가끔 보내려다가도, 손이 멈춰.",
        ],
      },
      {
        flagId: "userAvoidedPressure",
        triggerGroups: [
          {
            id: "비강요",
            keywords: ["천천히 해도 돼", "천천히 해도 괜찮아", "서두르지 않아도 돼", "지금 안 해도 돼"],
          },
          { id: "함께", keywords: ["같이 천천히", "같이 해보자", "도와줄게", "기다릴게"] },
        ],
        advanceReplies: [
          "네 속도대로 기다려줘서 고마워.",
          "...그렇게 말해주니까, 왠지 할 수 있을 것 같아.",
          "고마워. 재촉하지 않아 줘서.",
        ],
        waitingReplies: [
          "뭐라고 써야 할지도 모르겠고.",
          "...보내도 답이 없을까 봐 겁나.",
          "그냥, 다시 예전처럼 될 수 있을까 싶어서.",
        ],
      },
    ],
    negativeTriggerKeywords: [
      "지금 당장 연락해",
      "그게 뭐가 어려워",
      "당장 해",
      "왜 안 하는데",
      "연락해",
      "진짜 이유",
      "왜 멀어졌는데",
    ],
    negativeReplies: [
      "...그건 아직, 나도 정리가 안 됐어.",
      "미안, 지금은 여기까지만 말할 수 있을 것 같아.",
      "그 얘기는... 지금은 어려워.",
    ],
  },
  "scene-4": {
    steps: [
      { flagId: "decidedToSendMessage", seeded: true, triggerGroups: [], advanceReplies: [], waitingReplies: [] },
      {
        flagId: "userSupportedDecision",
        triggerGroups: [
          { id: "응원", keywords: ["잘될 거야", "응원할게", "할 수 있어", "힘내"] },
          { id: "약속", keywords: ["또 만나자", "다음에도", "약속"] },
        ],
        advanceReplies: [
          "...응, 약속이야. 꼭 또 오자.",
          "고마워, 오늘 진짜 큰 힘이 됐어.",
          "그 말 들으니까, 진짜 보낼 수 있을 것 같아.",
        ],
        waitingReplies: [
          "나... 아빠한테 짧게라도 메시지 보내볼까 해. 대단한 말은 아니고, 그냥... 오늘 별이 예뻤다고.",
          "답장이 올지는 모르겠지만, 그냥 보내보려고.",
          "밤공기가 좋다. 조금 더 있다 갈래?",
        ],
      },
    ],
    negativeTriggerKeywords: ["소용없어", "안 될 것 같은데", "의미 없어", "왜 굳이"],
    negativeReplies: [
      "...그렇게 말하면 좀 힘 빠지는데.",
      "음... 그래도 나는 보내보려고.",
      "...그래도 해보고 싶어.",
    ],
  },
};

function includesAny(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}

function matchesAnyGroup(message: string, groups: KeywordGroup[]): boolean {
  return groups.some((group) => includesAny(message, group.keywords));
}

function pickCyclingLine(lines: string[], turnCount: number): string {
  if (lines.length === 0) return "...";
  return lines[turnCount % lines.length];
}

/** 이 장면에서 "아직 안 켜진 단계 중 가장 앞선 것"을 찾습니다. 없으면 undefined. */
function findCurrentStep(
  steps: SceneStep[],
  flags: Record<string, boolean>
): SceneStep | undefined {
  return steps.find((step) => !step.seeded && !flags[step.flagId]);
}

export const mockStoryEngine: StoryEngine = ({ scene, userMessage, state }) => {
  const data = SCENE_MOCK_DATA[scene.id];
  if (!data) {
    return { reply: "...", affectionDelta: 0, newEvents: [] };
  }

  // 1) 이 장면에서 하면 안 되는(캐묻거나 강요하는) 표현인지 먼저 확인 — 호감도는 오르지 않음
  if (includesAny(userMessage, data.negativeTriggerKeywords)) {
    const reply = pickCyclingLine(data.negativeReplies, state.turnCount);
    // "recentNegativeReaction"은 장면 전환 판정(scene.requiredEvents)에는 절대 쓰이지 않는
    // 신호용 플래그입니다 — 힌트 패널이 "방금 강압적으로 말했다"는 걸 알아채는 데만 씁니다.
    const result: StoryEngineOutput = {
      reply,
      affectionDelta: 0,
      newEvents: ["recentNegativeReaction"],
    };
    return result;
  }

  const currentStep = findCurrentStep(data.steps, state.sceneProgressFlags);

  // 이 장면의 모든 단계가 이미 충족된 상태에서 메시지가 온 경우 (같은 턴에 전환되므로 거의 발생 안 함)
  if (!currentStep) {
    return { reply: "...", affectionDelta: 1, newEvents: [] };
  }

  // 2) 지금 기다리고 있는 단계의 표현 그룹과 맞는지 확인
  if (matchesAnyGroup(userMessage, currentStep.triggerGroups)) {
    const reply = pickCyclingLine(currentStep.advanceReplies, state.turnCount);
    return { reply, affectionDelta: 4, newEvents: [currentStep.flagId] };
  }

  // 3) 진행 트리거는 아니지만, 일상 얘기(학교/날씨/음식/취미 등)로 알아볼 수 있는 말이면
  // 그 주제에 어울리는 답변을 합니다. 진행 플래그는 건드리지 않아서 장면은 그대로 유지되고,
  // 사용자가 나중에 다시 루나의 상황에 관심을 보이면 위 1)/2)가 계속 정상 판정합니다.
  const freeTalk = getFreeTalkReply(userMessage, state.turnCount);
  if (freeTalk.matched) {
    return { reply: freeTalk.reply, affectionDelta: 1, newEvents: [] };
  }

  // 4) 그마저도 아니면, 지금 단계에 어울리는 자연스러운 답변 (진행은 안 됨)
  const reply = pickCyclingLine(currentStep.waitingReplies, state.turnCount);
  return { reply, affectionDelta: 1, newEvents: [] };
};

// ── 후일담(에피소드 완료 이후) 대화 ──────────────────────────────

const EPILOGUE_ASK_ABOUT_REPLY_KEYWORDS = ["답장", "아빠는", "연락 왔", "회신", "답 왔"];

const EPILOGUE_NO_REPLY_YET_REPLIES = [
  "...아직이야. 매일 확인하는데, 아직 아무 연락도 없어.",
  "아니, 아직 답장은 없어. 그래도 괜찮아, 기다려보려고.",
  "...아직. 근데 이상하게 초조하진 않아.",
];

/** 답장이 왔다는 "사실"만 알려주고, 내용은 절대 밝히지 않는 답변들 */
const EPILOGUE_REPLY_ARRIVED_REPLIES = [
  "...어, 왔어. 근데 아직 제대로 못 열어봤어.",
  "응, 답장 왔어. 뭐라고 썼을지... 조금 떨려.",
  "...왔더라. 아직 무슨 내용인지는 나도 몰라.",
];

const EPILOGUE_GENERAL_REPLIES = [
  "오늘도 여기 와줘서 고마워.",
  "요즘은 그래도 마음이 좀 편해진 것 같아.",
  "...너랑 이렇게 얘기하는 거, 나한테 꽤 큰 힘이 돼.",
];

/** 이만큼 후일담 대화가 쌓이면 "답장이 왔다"는 사실이 밝혀집니다 (내용은 여전히 비공개) */
const EPILOGUE_REPLY_REVEAL_THRESHOLD = 3;

export type EpilogueReplyResult = {
  reply: string;
  affectionDelta: number;
  newEpilogueStage: number;
  /** 이번 턴에 "답장이 왔다"는 사실이 새로 밝혀졌는지 (예고 카드를 띄울지 판단용) */
  revealsReply: boolean;
};

/**
 * 에피소드 완료 후 후일담에서 쓰는 목업 응답 함수입니다. mockStoryEngine과 달리
 * 장면(Scene)에 얽매이지 않고, 자유롭게 이어지는 대화를 다룹니다.
 */
export function mockEpilogueReply(
  userMessage: string,
  epilogueStage: number,
  fatherReplyReceived: boolean
): EpilogueReplyResult {
  const newEpilogueStage = epilogueStage + 1;
  const hasReplyByNow =
    fatherReplyReceived || newEpilogueStage >= EPILOGUE_REPLY_REVEAL_THRESHOLD;
  const revealsReply = !fatherReplyReceived && hasReplyByNow;

  const asksAboutReply = includesAny(userMessage, EPILOGUE_ASK_ABOUT_REPLY_KEYWORDS);

  const reply = asksAboutReply
    ? pickCyclingLine(
        hasReplyByNow ? EPILOGUE_REPLY_ARRIVED_REPLIES : EPILOGUE_NO_REPLY_YET_REPLIES,
        epilogueStage
      )
    : pickCyclingLine(EPILOGUE_GENERAL_REPLIES, epilogueStage);

  return { reply, affectionDelta: 2, newEpilogueStage, revealsReply };
}
