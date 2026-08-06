// 채팅 화면 맨 위에 보여줄 이동 버튼 모음입니다.
// 홈으로 가기, 캐릭터 상세 정보로 가기, 지금 대화를 처음부터 다시 시작하기 기능을 담당합니다.

import Link from "next/link";

type ChatNavBarProps = {
  homeHref: string;
  characterHref: string;
  onReset: () => void;
};

export function ChatNavBar({ homeHref, characterHref, onReset }: ChatNavBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2">
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
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-violet-600 hover:text-violet-300"
      >
        새로 시작
      </button>
    </div>
  );
}
