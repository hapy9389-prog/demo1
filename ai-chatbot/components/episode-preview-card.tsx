// 후일담 중 "다음 에피소드 예고"를 보여주는 카드입니다.
// 기존 장면 전환 카드(story-transition-card.tsx)와는 완전히 별개의 컴포넌트입니다.

type EpisodePreviewCardProps = {
  narration: string;
  previewLabel: string;
};

export function EpisodePreviewCard({ narration, previewLabel }: EpisodePreviewCardProps) {
  return (
    <div className="flex justify-center py-1">
      <div className="w-full max-w-sm rounded-2xl border border-violet-700/50 bg-violet-950/40 px-4 py-3 text-center">
        <p className="text-xs leading-relaxed text-violet-100">{narration}</p>
        <p className="mt-2 text-xs font-semibold text-violet-300">
          다음 이야기 · {previewLabel}
        </p>
      </div>
    </div>
  );
}
