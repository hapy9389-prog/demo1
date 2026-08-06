// "이야기 기록" 모달입니다. 지금까지 이 대화에서 발생한 사건을 완료/미완료로 보여줍니다.
// 새 라이브러리 없이 단순한 오버레이 div로 구현했습니다.

import { LUNA_STORY_EVENTS } from "@/lib/story-scenes";

type StoryEventLogProps = {
  storyEventIds: string[];
  onClose: () => void;
};

export function StoryEventLog({ storyEventIds, onClose }: StoryEventLogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-50">이야기 기록</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800"
          >
            닫기
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {LUNA_STORY_EVENTS.map((event) => {
            const isDone = storyEventIds.includes(event.id);
            return (
              <li key={event.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0">{isDone ? "✅" : "⬜"}</span>
                <span className={isDone ? "text-neutral-100" : "text-neutral-500"}>
                  {event.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
