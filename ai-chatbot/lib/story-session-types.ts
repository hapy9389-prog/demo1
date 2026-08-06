// 대화 세션(저장된 대화 하나하나)과 관련된 타입입니다.
// "세션"은 사용자가 특정 캐릭터와 나눈 대화 하나를 통째로 담는 단위로,
// localStorage에 이 형태 그대로 여러 개가 배열로 저장됩니다.

import type { Message } from "@/lib/characters";

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
  triggeredEvents: string[];
};
