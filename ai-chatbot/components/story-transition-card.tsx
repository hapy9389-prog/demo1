// 장면이 바뀔 때 채팅 안에 끼워 넣는 "장면 전환 카드"입니다.
// 일반 말풍선과 다르게 가운데 정렬된 카드 형태로 보여줘서 눈에 띄게 만듭니다.

type StoryTransitionCardProps = {
  narration: string;
  nextSceneNumber: number | null;
  nextSceneTitle: string | null;
};

export function StoryTransitionCard({
  narration,
  nextSceneNumber,
  nextSceneTitle,
}: StoryTransitionCardProps) {
  const isEpisodeComplete = nextSceneNumber === null || nextSceneTitle === null;

  return (
    <div className="flex justify-center py-1">
      <div className="w-full max-w-sm rounded-2xl border border-violet-700/50 bg-violet-950/40 px-4 py-3 text-center">
        <p className="text-xs leading-relaxed text-violet-100">{narration}</p>
        <p className="mt-2 text-xs font-semibold text-violet-300">
          {isEpisodeComplete
            ? "🎉 에피소드 완료"
            : `다음 장면 · ${nextSceneNumber}. ${nextSceneTitle}`}
        </p>
      </div>
    </div>
  );
}
