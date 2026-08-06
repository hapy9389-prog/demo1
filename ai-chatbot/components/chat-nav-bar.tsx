// 채팅 화면 맨 위에 보여줄 이동 버튼 모음입니다.
// 홈으로 가기, 캐릭터 상세 정보로 가기, 지금 보고 있는 대화의 제목,
// 이야기 기록 보기, 그리고 완전히 새로운 대화를 시작하는 기능을 담당합니다.

"use client";

import { useState } from "react";
import Link from "next/link";
import { StoryEventLog } from "@/components/story-event-log";

type ChatNavBarProps = {
  homeHref: string;
  characterHref: string;
  sessionTitle: string;
  storyEventIds: string[];
  /** 지금 세션을 초기화하는 게 아니라, 완전히 새로운 세션을 만들고 그쪽으로 이동시키는 콜백 */
  onStartNewConversation: () => void;
};

export function ChatNavBar({
  homeHref,
  characterHref,
  sessionTitle,
  storyEventIds,
  onStartNewConversation,
}: ChatNavBarProps) {
  const [showEventLog, setShowEventLog] = useState(false);

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2">
        <div className="flex items-center gap-2">
          <Link
            href={homeHref}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            ← 홈
          </Link>
          <Link
            href={characterHref}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            캐릭터 정보
          </Link>
          <button
            type="button"
            onClick={() => setShowEventLog(true)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            이야기 기록
          </button>
        </div>

        <span className="min-w-0 flex-1 truncate text-center text-xs text-neutral-500">
          {sessionTitle}
        </span>

        <button
          type="button"
          onClick={onStartNewConversation}
          className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-violet-600 hover:text-violet-300"
        >
          새 대화 시작
        </button>
      </div>

      {showEventLog && (
        <StoryEventLog
          storyEventIds={storyEventIds}
          onClose={() => setShowEventLog(false)}
        />
      )}
    </>
  );
}
