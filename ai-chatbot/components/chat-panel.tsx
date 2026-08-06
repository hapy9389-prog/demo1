// 가운데(선택된 캐릭터와 대화하는) 자유 채팅 화면입니다.
// 헤더/말풍선/입력창은 공용 컴포넌트를 사용합니다 (스토리 채팅과 동일한 부품).

"use client";

import { useState } from "react";
import type { Character, Message } from "@/lib/characters";
import { ChatHeader } from "@/components/chat-header";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";

type ChatPanelProps = {
  character: Character;
  messages: Message[];
  onSend: (text: string) => void;
};

export function ChatPanel({ character, messages, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-neutral-900">
      <ChatHeader
        avatar={character.avatar}
        name={character.name}
        description={character.description}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <MessageInput
        value={draft}
        onChange={setDraft}
        placeholder={`${character.name}에게 메시지 보내기...`}
        onSend={onSend}
      />
    </section>
  );
}
