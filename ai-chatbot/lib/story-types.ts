// 스토리 진행형 챗봇에서 쓰는 타입 정의 모음입니다.
// 여기 정의된 타입(특히 Scene)은 지금은 목업 답변을 만드는 데 쓰지만,
// 나중에 실제 AI에게 "지금 상황이 이래, 이 목표로 대화를 이끌어줘" 라고
// 알려주는 프롬프트 재료로 그대로 쓸 수 있도록 설계했습니다.

/** 장면(scene) 하나의 정의. 대사가 아니라 "이 장면의 규칙"을 담습니다. */
export type Scene = {
  id: string;
  /** 이 장면의 소제목 */
  title: string;
  /** 배경 상황 설명 (언제, 어디서, 무슨 일이 벌어지고 있는지) */
  setting: string;
  /** 이 장면에서 AI(루나)가 대화를 이끌어가고 싶은 방향/목표 */
  goal: string;
  /** 다음 장면으로 넘어가기 위해 대화 중 발생해야 하는 이벤트 태그들 */
  requiredEvents: string[];
  /** 이 장면에서는 아직 밝히면 안 되는 정보를 나타내는 태그들 */
  forbiddenEvents: string[];
  /** 사람이 읽을 수 있는 전환 조건 설명 (실제 판정 로직은 checkSceneTransition에서 수행) */
  transitionCondition: string;
  /** 다음 장면 id. 더 이상 다음 장면이 없으면 null */
  nextSceneId: string | null;
};

/** 여러 장면을 묶은 하나의 에피소드 */
export type Episode = {
  id: string;
  title: string;
  scenes: Scene[];
};

/** 지금 대화가 어느 장면/몇 번째 턴/호감도가 얼마인지 나타내는 상태 */
export type StoryState = {
  sceneId: string;
  /** 현재 장면에 들어온 뒤 사용자가 보낸 메시지 수 (장면이 바뀌면 0으로 리셋) */
  turnCount: number;
  /** 0~100, 장면이 바뀌어도 유지되는 누적 호감도 */
  affection: number;
  /** 현재 장면에서 지금까지 감지된 이벤트 태그들 (장면이 바뀌면 리셋) */
  triggeredEvents: string[];
};

/** 응답 엔진에 넘겨줄 입력값 */
export type StoryEngineInput = {
  scene: Scene;
  userMessage: string;
  state: StoryState;
};

/** 응답 엔진이 돌려주는 결과값 */
export type StoryEngineOutput = {
  reply: string;
  affectionDelta: number;
  newEvents: string[];
};

/**
 * "사용자 메시지 + 현재 장면/상태"를 받아서 "AI 답변 + 호감도 변화 + 새로 발생한 이벤트"를
 * 돌려주는 함수의 타입입니다.
 *
 * 지금은 mockStoryEngine(키워드 기반 목업)이 이 타입을 구현합니다.
 * 나중에 실제 AI API를 붙일 때는 같은 입력/출력 타입을 가진 aiStoryEngine을 만들어서
 * StoryChatPanel에서 이 부분만 교체하면 됩니다.
 */
export type StoryEngine = (input: StoryEngineInput) => StoryEngineOutput;
