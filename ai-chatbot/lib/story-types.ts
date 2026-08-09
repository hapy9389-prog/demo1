// 스토리 진행형 챗봇에서 쓰는 타입 정의 모음입니다.
// 여기 정의된 타입(특히 Scene)은 지금은 목업 답변을 만드는 데 쓰지만,
// 나중에 실제 AI에게 "지금 상황이 이래, 이 목표로 대화를 이끌어줘" 라고
// 알려주는 프롬프트 재료로 그대로 쓸 수 있도록 설계했습니다.

/** 장면(scene) 하나의 정의. 대사가 아니라 "이 장면의 규칙"을 담습니다. */
export type Scene = {
  id: string;
  /** 이 장면의 소제목 */
  title: string;
  /** 이 장면이 서사적으로 존재하는 이유 (무엇을 보여주기 위한 장면인지) */
  dramaticPurpose: string;
  /** 장면이 시작될 때 루나의 감정 상태 */
  emotionalStart: string;
  /** 장면이 끝날 때(전환 시) 루나의 감정 상태 */
  emotionalEnd: string;
  /** 이 장면에서 이미 드러난/드러나는 사실들 (사용자에게 공개돼도 되는 정보) */
  publicFacts: string[];
  /** 이 장면에서는 아직 감춰야 하는 사실들 (다음 장면 또는 다음 에피소드에서 다룸) */
  hiddenFacts: string[];
  /**
   * 다음 장면으로 넘어가기 위해 사용자가 직접 이끌어내야 하는 진행 플래그 id들 (순서 有).
   * 장면 시작과 동시에 자동으로 참이 되는 첫 비트(루나의 오프닝 대사)는 여기 안 넣습니다 —
   * 항상 참이라 게이트 역할을 하지 않기 때문입니다 (lib/mock-story-engine.ts의 seeded 단계 참고).
   */
  requiredEvents: string[];
  /** 이 장면에서는 아직 밝히면 안 되는 정보를 나타내는 태그들 */
  forbiddenEvents: string[];
  /** 사람이 읽을 수 있는 전환 조건 설명 (실제 판정 로직은 checkSceneTransition에서 수행) */
  transitionCondition: string;
  /** 다음 장면 id. 더 이상 다음 장면이 없으면 null */
  nextSceneId: string | null;
  /** 캐릭터 상세 페이지 "에피소드 진행" 목록에 보여줄 짧은 소개 (잠긴 장면에서는 안 보여줌) */
  publicDescription: string;
  /** 채팅 화면에 자연스러운 문구로 보여줄 힌트 (정답/키워드를 직접 알려주지 않음) */
  progressHint: string;
  /** 이 장면이 시작될 때 루나가 먼저 건네는 첫 대사 */
  initialMessage: string;
  /** 이 장면을 떠날 때(또는 마지막 장면을 완료할 때) 장면 전환 카드에 보여줄 내레이션 */
  transitionNarration: string;
  /** 이 장면에 도달하면 "이야기 기록"에 추가되는 사건 id (lib/story-scenes.ts의 LUNA_STORY_EVENTS와 매칭) */
  storyEventId: string;
};

/** 여러 장면을 묶은 하나의 에피소드 */
export type Episode = {
  id: string;
  title: string;
  scenes: Scene[];
};

/**
 * 에피소드 진행 단계.
 * - in_progress: 아직 장면을 진행 중
 * - completed: 마지막 장면 목표를 막 달성한 순간 (이 에피소드는 곧바로 after_story로 넘어감)
 * - after_story: 후일담 — 채팅은 끝나지 않고 자유롭게 이어짐
 */
export type EpisodeStatus = "in_progress" | "completed" | "after_story";

/** 지금 대화가 어느 장면/몇 번째 턴/호감도가 얼마인지 나타내는 상태 */
export type StoryState = {
  sceneId: string;
  /** 현재 장면(또는 후일담)에서 사용자가 보낸 메시지 수 — 답변 순환에 사용, 장면이 바뀌면 리셋 */
  turnCount: number;
  /** 0~100, 장면이 바뀌어도 유지되는 누적 호감도 */
  affection: number;
  /** 현재 장면에서 지금까지 충족된 진행 플래그들 (장면이 바뀌면 리셋) */
  sceneProgressFlags: Record<string, boolean>;
  /** 완전히 지나온(완료한) 장면 id 목록 */
  completedSceneIds: string[];
  /** 한 번이라도 도달한 적 있는 장면 id 목록 (완료 + 진행중 포함) */
  unlockedSceneIds: string[];
  /** 지금까지 발생한 "이야기 기록" 사건 id 목록 */
  storyEventIds: string[];
  /** 에피소드 진행 단계 */
  episodeStatus: EpisodeStatus;
  /** 후일담에서 사용자가 보낸 메시지 수 */
  epilogueStage: number;
  /** 루나가 아버지에게 메시지를 보냈는지 (scene-4 완료 시 true) */
  fatherMessageSent: boolean;
  /** 아버지의 답장이 왔다는 사실이 밝혀졌는지 (내용은 다음 에피소드까지 비공개) */
  fatherReplyReceived: boolean;
  /** 대화 중 발생한 약속들을 짧은 문구로 누적한 목록 */
  promises: string[];
  /** 이 장면에서 "정체 안내"(자동 힌트)를 한 번이라도 보여준 적이 있는지 (장면이 바뀌면 리셋) */
  sceneHintNoticeShown: boolean;
  /** 이 세션에서 시작 안내 화면(온보딩)을 이미 봤는지. 새 세션만 false로 시작하고,
   * 한 번 보여준 뒤에는 true로 고정돼서 이어하기 할 때 다시 뜨지 않습니다. */
  introShown: boolean;
};

/** "이야기 기록"에 나열되는 사건 하나 (id + 화면에 보여줄 문구) */
export type StoryEvent = {
  id: string;
  label: string;
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
