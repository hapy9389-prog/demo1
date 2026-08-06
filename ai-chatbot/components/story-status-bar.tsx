// 스토리 채팅 화면 상단에 보여줄 상태 표시줄입니다.
// 에피소드 제목/현재 장면/호감도에 더해, 전체 진행률·관계 상태 문구·현재 장면 힌트까지 보여줍니다.

type StoryStatusBarProps = {
  episodeTitle: string;
  sceneTitle: string;
  sceneNumber: number;
  totalScenes: number;
  affection: number;
  /** 완료한 장면 수 기준 전체 에피소드 진행률 (0~100) */
  episodeProgress: number;
  /** 호감도 구간에 따른 관계 상태 문구 (예: "경계를 푸는 중") */
  relationshipLabel: string;
  /** 정답/키워드를 직접 알려주지 않는, 자연스러운 문구의 진행 힌트 */
  progressHint: string;
};

export function StoryStatusBar({
  episodeTitle,
  sceneTitle,
  sceneNumber,
  totalScenes,
  affection,
  episodeProgress,
  relationshipLabel,
  progressHint,
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">진행률</span>
            <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-violet-400 transition-all"
                style={{ width: `${episodeProgress}%` }}
              />
            </div>
            <span className="w-9 text-right text-xs tabular-nums text-neutral-300">
              {episodeProgress}%
            </span>
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

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-neutral-500 italic">{progressHint}</p>
        <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-violet-200">
          {relationshipLabel}
        </span>
      </div>
    </div>
  );
}
