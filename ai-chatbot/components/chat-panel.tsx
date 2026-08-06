// 가운데(선택된 캐릭터와 대화하는) 채팅 화면입니다.
// 위쪽에는 캐릭터 이름/설명, 가운데는 메시지 목록, 아래는 입력창 + 전송 버튼으로 구성됩니다.

"use client";

import { useState, type FormEvent } from "react";
import type { Character, Message } from "@/lib/characters";

type ChatPanelProps = {
  character: Character;
  messages: Message[];
  onSend: (text: string) => void;
};

export function ChatPanel({ character, messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-neutral-900">
      {/* 상단: 캐릭터 이름과 설명 */}
      <header className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-4 py-3">
        <span className="text-2xl">{character.avatar}</span>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-neutral-50">
            {character.name}
          </h1>
          <p className="truncate text-xs text-neutral-400">
            {character.description}
          </p>
        </div>
      </header>

      {/* 가운데: 메시지 목록 */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  isUser
                    ? "rounded-br-sm bg-violet-600 text-white"
                    : "rounded-bl-sm bg-neutral-800 text-neutral-100"
                }`}
              >
                {message.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* 하단: 입력창 + 전송 버튼 */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-neutral-800 p-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`${character.name}에게 메시지 보내기...`}
          className="min-w-0 flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="shrink-0 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          전송
        </button>
      </form>
    </section>
  );
}
