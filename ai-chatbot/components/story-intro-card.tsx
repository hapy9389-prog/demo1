// 새 대화 세션에서 채팅을 시작하기 전에 딱 한 번 보여주는 사용법 안내 화면입니다.
// "선택지를 고르는 게임이 아니라 자유롭게 말하면서 이야기가 진행된다"는 개념을
// 5~10초 안에 읽을 수 있는 짧은 문장 몇 줄로 전달합니다. "대화 시작하기"를 누르면
// 부모(story-chat-panel.tsx)가 introShown을 true로 바꾸고 실제 채팅 화면을 보여줍니다.

import type { Character } from "@/lib/characters";

type StoryIntroCardProps = {
  character: Character;
  onStart: () => void;
};

const GUIDE_POINTS = [
  "정해진 선택지가 아니라, 하고 싶은 말을 편하게 하면 돼요.",
  "루나의 마음과 상황에 관심을 보이면 이야기가 자연스럽게 이어져요.",
  "다른 이야기를 해도 괜찮아요 — 실패하는 게 아니에요.",
  '막히면 "대화 힌트"에서 예시 문장을 참고할 수 있어요.',
];

export function StoryIntroCard({ character, onStart }: StoryIntroCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-6">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 text-center">
        <span className="text-3xl">{character.avatar}</span>
        <h2 className="mt-2 text-base font-semibold text-neutral-50">
          {character.name}와의 대화를 시작하기 전에
        </h2>

        <ul className="mt-4 space-y-2 text-left">
          {GUIDE_POINTS.map((point) => (
            <li key={point} className="flex gap-2 text-xs leading-relaxed text-neutral-300">
              <span className="mt-0.5 text-violet-400">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStart}
          className="mt-5 w-full rounded-full bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          대화 시작하기
        </button>
      </div>
    </div>
  );
}
