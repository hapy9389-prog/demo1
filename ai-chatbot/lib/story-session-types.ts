// 대화 세션(저장된 대화 하나하나)과 관련된 타입입니다.
// "세션"은 사용자가 특정 캐릭터와 나눈 대화 하나를 통째로 담는 단위로,
// localStorage에 이 형태 그대로 여러 개가 배열로 저장됩니다.

import type { Message } from "@/lib/characters";
import type { EpisodeStatus } from "@/lib/story-types";

export type StorySession = {
  sessionId: string;
  characterId: string;
  /** 사용자가 알아볼 수 있게 붙이는 대화 제목 (나중에 이름 변경 가능) */
  title: string;
  currentSceneId: string;
  affection: number;
  messages: Message[];
  /** 지금까지 사용자가 보낸 메시지 누적 개수 (데이터로만 관리) */
  conversationCount: number;
  /** ISO 문자열 형태의 생성 시각 */
  createdAt: string;
  /** ISO 문자열 형태의 마지막 수정 시각 (메시지/장면/호감도가 바뀔 때마다 갱신) */
  updatedAt: string;
  /**
   * 기존 StoryState(lib/story-types.ts)와 같은 개념의 필드입니다.
   * checkSceneTransition/mockStoryEngine을 그대로 재사용하기 위해 필요해서 넣었습니다.
   */
  turnCount: number;
  /** 현재 장면에서 지금까지 충족된 진행 플래그들 (장면이 바뀌면 리셋) */
  sceneProgressFlags: Record<string, boolean>;
  /** 완전히 지나온(완료한) 장면 id 목록 */
  completedSceneIds: string[];
  /** 한 번이라도 도달한 적 있는 장면 id 목록 (완료 + 진행중 포함) */
  unlockedSceneIds: string[];
  /** 지금까지 발생한 "이야기 기록" 사건 id 목록 */
  storyEventIds: string[];
  /** 에피소드 진행 단계 (in_progress / completed / after_story) */
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
};
