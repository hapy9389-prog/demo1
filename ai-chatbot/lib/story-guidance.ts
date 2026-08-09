// 채팅 화면에 보여주는 "정체 안내"(자동 힌트 알림) 문구/조건을 만드는 파일입니다.
// story-chat-panel.tsx에 하드코딩돼 있던 임계값 계산과 문구를 이곳으로 옮겨서,
// 화면 컴포넌트는 판정 결과(이 함수들의 반환값)만 갖다 쓰면 되게 합니다.
//
// 톤을 일부러 "이렇게 말해야 진행됩니다" 같은 정답 강요 느낌이 아니라, "자유롭게 계속
// 얘기해도 괜찮고, 이야기를 이어가고 싶다면 이런 방향도 있다"는 느낌으로 만듭니다.
// 실제 힌트 데이터(lib/story-hints.ts)와 StoryHintPanel은 그대로 재사용합니다.

import type { StoryHint } from "@/lib/story-hints";

/** 같은 장면에서 이만큼 대화했는데도 진행이 없으면 "정체 안내"를 (반복적으로) 보여줍니다 */
export const STALL_NOTICE_TURN_INTERVAL = 2;

/**
 * 지금 턴에 정체 안내를 보여줘야 하는지 판단합니다.
 * - madeProgress: 방금 턴에서 이 장면의 진행 플래그가 새로 켜졌는지
 * - turnCount: 지금 장면에서 사용자가 보낸 메시지 수
 */
export function shouldShowStallNotice(turnCount: number, madeProgress: boolean): boolean {
  return (
    !madeProgress &&
    turnCount >= STALL_NOTICE_TURN_INTERVAL &&
    turnCount % STALL_NOTICE_TURN_INTERVAL === 0
  );
}

/**
 * 정체 안내에 보여줄 문구를 만듭니다. 힌트가 없으면(장면 전환 직전 등) 힌트 패널을
 * 확인해보라는 문구만 보여주고, 있으면 그 힌트의 방향과 예시 문장 하나를 자연스럽게 곁들입니다.
 */
export function buildStallNoticeText(hint: StoryHint | null): string {
  if (!hint) {
    return "자유롭게 계속 이야기해도 괜찮아요.\n이야기를 이어가고 싶다면 아래 대화 힌트를 확인해 보세요.";
  }
  return `자유롭게 계속 이야기해도 괜찮아요.\n이야기를 이어가고 싶다면 이렇게 말해볼 수도 있어요: "${hint.examples[0]}"`;
}
