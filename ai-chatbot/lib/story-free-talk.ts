// "자유 대화" 주제를 감지하고, 그 주제에 어울리는 짧은 목업 답변을 골라주는 파일입니다.
//
// mock-story-engine.ts는 지금 장면이 기다리는 진행 트리거와 안 맞는 말을 받으면,
// 예전에는 곧바로 그 장면의 waitingReplies(장면 분위기의 정형화된 대사)로 넘어갔습니다.
// 그러면 사용자가 학교/날씨/음식 같은 다른 얘기를 해도 매번 똑같은 대사만 반복되는
// 것처럼 보입니다. 이 파일은 그 사이에 "일상적인 다른 주제로 알아볼 수 있는 말인지"를
// 먼저 확인해서, 스토리 진행과 무관하게 그 주제에 맞는 답변을 하나 골라줍니다.
//
// 이 파일은 mock-story-engine.ts를 전혀 알지 못합니다(반대로만 import됨) — 자유 대화
// 판정은 지금 장면이 무엇인지와 상관없이 항상 같은 규칙으로 동작합니다. 스토리 진행
// 플래그(sceneProgressFlags)는 이 파일에서 절대 다루지 않습니다.

/** 자유 대화 주제 하나 */
export type FreeTalkTopic = {
  /** 어떤 주제인지 (문서용) */
  id: string;
  /** 이 주제로 알아보는 표현들 (부분 문자열 매치) */
  keywords: string[];
  /** 이 주제에 어울리는, 루나의 평소 말투(무심하지만 다정함)를 크게 벗어나지 않는 답변들 */
  replies: string[];
};

/**
 * 배열 순서가 곧 확인 우선순위입니다 — 메시지가 여러 주제와 동시에 겹치면 앞쪽 항목이 이깁니다.
 * 지금은 장면/감정 상태와 무관하게 주제당 하나의 톤만 사용합니다 (데모 범위를 의도적으로
 * 좁힌 것). 나중에 장면별 분위기를 더 세밀하게 반영하고 싶으면, topic.id를 키로 하는
 * 장면별 답변 목록을 추가하고 getFreeTalkReply 호출부에서 scene 정보를 함께 넘기면 됩니다.
 */
const FREE_TALK_TOPICS: FreeTalkTopic[] = [
  {
    id: "casual-reason",
    keywords: ["바람 쐬러", "산책하러 왔", "그냥 왔어", "머리 식히러", "그냥 여기", "걷다가"],
    replies: [
      "...그렇구나. 그런 것도 괜찮아, 여기 원래 자주 오는 사람은 없으니까.",
      "바람 쐬러 왔구나. ...나도 가끔 그래.",
      "음... 그런 이유도 있지. 편하게 있어도 돼.",
    ],
  },
  {
    id: "school-day",
    keywords: ["학교", "시험", "숙제", "야자", "학원", "피곤해", "힘든 일", "힘들었", "지쳤어", "오늘 하루"],
    replies: [
      "학교에서 힘든 일이 있었구나. ...말 안 해도 괜찮아.",
      "그런 날도 있지. 오늘 진짜 피곤했겠다.",
      "...학교 얘기 들으니까, 나도 그런 날 있었던 것 같아.",
    ],
  },
  {
    id: "weather",
    keywords: ["날씨", "덥다", "비가", "맑다", "눈이 와", "바람이 세"],
    replies: [
      "...그러고 보니 오늘 날씨가 좀 그렇긴 하다.",
      "날씨 얘기라니, 새삼스럽네. ...근데 나쁘지 않아.",
      "...그런 것도 신경 쓰는구나. 나는 잘 몰랐어.",
    ],
  },
  {
    id: "food",
    keywords: ["밥 먹었", "저녁 먹", "점심 먹", "배고파", "라면", "맛있는 거"],
    replies: [
      "밥 얘기하니까 갑자기 배고파지네. ...너는 뭐 좋아해?",
      "나는 그런 거 잘 안 챙겨 먹는데. ...너는 챙겨 먹어.",
      "...먹는 얘기하니까 좀 웃기다, 나답지 않게.",
    ],
  },
  {
    id: "hobby",
    keywords: ["취미가 뭐", "좋아하는 거", "무슨 음악", "영화 좋아해", "게임 좋아해", "드라마 봤"],
    replies: [
      "취미라... 나는 딱히 없어. 그냥 여기 오는 것 정도?",
      "그런 거 좋아하는구나. ...낯설지만 궁금하네.",
      "...나도 뭔가 좋아하는 게 있었나 생각하게 되네.",
    ],
  },
  {
    id: "greeting",
    keywords: ["안녕", "반가워", "오랜만이야", "잘 지냈어"],
    replies: ["...어, 안녕.", "왔구나. ...오랜만은 아니지만.", "...반가워. 뭐, 그런 걸로 해두자."],
  },
];

function includesAny(message: string, keywords: string[]): boolean {
  return keywords.some((keyword) => message.includes(keyword));
}

function pickCyclingLine(lines: string[], turnCount: number): string {
  if (lines.length === 0) return "...";
  return lines[turnCount % lines.length];
}

/** 메시지와 가장 먼저 매치되는 자유 대화 주제를 찾습니다. 없으면 undefined. */
function classifyFreeTalk(message: string): FreeTalkTopic | undefined {
  return FREE_TALK_TOPICS.find((topic) => includesAny(message, topic.keywords));
}

export type FreeTalkResult = {
  reply: string;
  /** 이 메시지가 자유 대화 주제로 인식됐는지 — false면 reply는 무시하고 기존 폴백을 쓰세요 */
  matched: boolean;
};

/**
 * 사용자 메시지가 자유 대화 주제(일상/날씨/학교/음식/취미 등)에 해당하는지 확인하고,
 * 해당하면 그 주제에 어울리는 답변을 골라 돌려줍니다. turnCount는 같은 주제가 여러 번
 * 나왔을 때 답변이 매번 똑같이 반복되지 않도록 순환시키는 데만 씁니다.
 */
export function getFreeTalkReply(message: string, turnCount: number): FreeTalkResult {
  const topic = classifyFreeTalk(message);
  if (!topic) {
    return { reply: "", matched: false };
  }
  return { reply: pickCyclingLine(topic.replies, turnCount), matched: true };
}
