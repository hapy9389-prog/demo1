// 스토리 채팅 화면 상단에 보여줄 상태 표시줄입니다.
// 에피소드 제목, 현재 장면(번호/소제목), 호감도(0~100) 게이지를 보여줍니다.

type StoryStatusBarProps = {
  episodeTitle: string;
  sceneTitle: string;
  sceneNumber: number;
  totalScenes: number;
  affection: number;
};

export function StoryStatusBar({
  episodeTitle,
  sceneTitle,
  sceneNumber,
  totalScenes,
  affection,
}: StoryStatusBarProps) {
  return (
    <div className="shrink-0 border-b border-neutral-800 bg-neutral-950/60 px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-violet-300">
            {episodeTitle}
          </p>
          <p className="truncate text-xs text-neutral-400">
            장면 {sceneNumber} / {totalScenes} · {sceneTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">호감도</span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${affection}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs tabular-nums text-neutral-300">
            {affection}
          </span>
        </div>
      </div>
    </div>
  );
}
