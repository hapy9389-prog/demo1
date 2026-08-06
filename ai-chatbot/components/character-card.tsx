// 홈 화면에 보여줄 캐릭터 카드입니다.
// href가 있으면 카드 전체가 링크가 되고(예: 루나 → 상세 페이지),
// href가 없으면 "준비 중" 상태로 비활성 표시됩니다(카이, 하은).

import Link from "next/link";
import type { Character } from "@/lib/characters";

type CharacterCardProps = {
  character: Character;
  href?: string;
};

export function CharacterCard({ character, href }: CharacterCardProps) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{character.avatar}</span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-neutral-50">
            {character.name}
          </h2>
          <span className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
            {character.genre}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-400">{character.description}</p>
      <span
        className={`mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          href
            ? "bg-violet-600 text-white group-hover:bg-violet-500"
            : "cursor-not-allowed bg-neutral-800 text-neutral-500"
        }`}
      >
        {href ? "대화 시작" : "준비 중"}
      </span>
    </>
  );

  if (!href) {
    return (
      <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-5 opacity-70">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-violet-600"
    >
      {content}
    </Link>
  );
}
