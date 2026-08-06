// /characters/luna 라우트 — 루나 캐릭터 상세 화면입니다.
// 캐릭터 데이터는 lib/characters.ts, 에피소드 제목은 이미 만들어둔
// lib/story-scenes.ts의 lunaEpisode.title을 그대로 가져다 씁니다 (중복 작성 X).

import type { Metadata } from "next";
import Link from "next/link";
import { getCharacterById } from "@/lib/characters";
import { lunaEpisode } from "@/lib/story-scenes";

const luna = getCharacterById("luna")!;

export const metadata: Metadata = {
  title: `${luna.name} - 캐릭터 정보`,
};

export default function LunaCharacterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 bg-neutral-950 px-4 py-10 text-neutral-100 sm:px-6">
      <Link
        href="/"
        className="w-fit rounded-full px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
      >
        ← 홈으로 돌아가기
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-5xl">{luna.avatar}</span>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">{luna.name}</h1>
          <span className="inline-block rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
            {luna.genre}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-sm font-semibold text-violet-300">소개</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          {luna.intro}
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-sm font-semibold text-violet-300">성격</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          {luna.personality}
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-sm font-semibold text-violet-300">세계관</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          {luna.worldview}
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="text-sm font-semibold text-violet-300">현재 에피소드</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-300">
          {lunaEpisode.title}
        </p>
      </section>

      <Link
        href="/chat/luna"
        className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 sm:w-auto sm:self-start"
      >
        채팅 시작
      </Link>
    </main>
  );
}
