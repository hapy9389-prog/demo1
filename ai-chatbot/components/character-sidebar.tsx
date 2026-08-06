// 왼쪽(모바일에서는 위쪽)에 보여줄 AI 캐릭터 목록입니다.
// 데스크톱 화면에서는 세로로 길게, 모바일 화면에서는 가로로 스크롤되게 만들어서
// 작은 화면에서도 캐릭터를 쉽게 고를 수 있도록 했습니다.

import type { Character } from "@/lib/characters";

type CharacterSidebarProps = {
  characters: Character[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CharacterSidebar({
  characters,
  selectedId,
  onSelect,
}: CharacterSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 gap-2 overflow-x-auto border-b border-neutral-800 bg-neutral-950 p-3 md:h-full md:w-72 md:flex-col md:gap-1 md:overflow-y-auto md:overflow-x-hidden md:border-r md:border-b-0 md:p-4">
      <h2 className="hidden shrink-0 px-2 pb-2 text-sm font-semibold text-neutral-400 md:block">
        캐릭터 목록
      </h2>
      {characters.map((character) => {
        const isSelected = character.id === selectedId;
        return (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors md:w-full ${
              isSelected
                ? "bg-violet-600 text-white"
                : "bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            }`}
          >
            <span className="text-2xl">{character.avatar}</span>
            <span className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {character.name}
              </span>
              <span
                className={`hidden truncate text-xs md:block ${
                  isSelected ? "text-violet-100" : "text-neutral-400"
                }`}
              >
                {character.description}
              </span>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
