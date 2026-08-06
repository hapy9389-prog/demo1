// 홈 화면입니다. 서비스 이름/소개와 캐릭터 카드 목록을 보여줍니다.
// 실제 채팅/캐릭터 상세 화면은 각각 /chat/luna, /characters/luna 라우트에서 담당합니다.

import type { Metadata } from "next";
import { characters } from "@/lib/characters";
import { CharacterCard } from "@/components/character-card";

// 서비스 이름은 아직 정해진 게 없어서 임시로 이 한 곳에만 적어뒀습니다.
// 나중에 실제 서비스명이 정해지면 여기만 바꾸면 됩니다.
const SERVICE_NAME = "스토리챗";

export const metadata: Metadata = {
  title: SERVICE_NAME,
  description: "AI 캐릭터와 함께 나만의 이야기를 만들어가는 채팅 서비스",
};

// 지금은 루나만 캐릭터 상세 페이지가 준비되어 있습니다.
const CHARACTER_HREFS: Record<string, string> = {
  luna: "/characters/luna",
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 bg-neutral-950 px-4 py-12 text-neutral-100 sm:px-6">
      <section className="flex flex-col gap-3 text-center sm:text-left">
        <h1 className="text-3xl font-semibold text-neutral-50">
          {SERVICE_NAME}
        </h1>
        <p className="text-sm text-neutral-400 sm:text-base">
          AI 캐릭터와 함께, 나만의 이야기를 만들어가는 채팅 서비스예요.
          마음에 드는 캐릭터를 골라 대화를 시작해보세요.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            href={CHARACTER_HREFS[character.id]}
          />
        ))}
      </section>
    </main>
  );
}
