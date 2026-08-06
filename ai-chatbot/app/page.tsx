// AI 캐릭터 채팅 서비스의 첫 화면입니다.
// 왼쪽에는 캐릭터 목록, 가운데는 선택한 캐릭터와의 채팅 화면을 보여줍니다.
// 아직 실제 AI API는 연결하지 않았고, 메시지를 보내면 고정된 목업 답변이 돌아옵니다.

"use client";

import { useState } from "react";
import { CharacterSidebar } from "@/components/character-sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { StoryChatPanel } from "@/components/story-chat-panel";
import { characters, type Message } from "@/lib/characters";

// 이번 프로토타입에서는 루나만 스토리 진행형 대화를 사용합니다.
const STORY_CHARACTER_ID = "luna";

// 캐릭터 id별로 메시지 목록을 저장하는 타입
type MessagesByCharacter = Record<string, Message[]>;

function createInitialMessages(): MessagesByCharacter {
  const initial: MessagesByCharacter = {};
  for (const character of characters) {
    initial[character.id] = character.initialMessages;
  }
  return initial;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState(characters[0].id);
  const [messagesByCharacter, setMessagesByCharacter] =
    useState<MessagesByCharacter>(createInitialMessages);

  const selectedCharacter =
    characters.find((character) => character.id === selectedId) ??
    characters[0];
  const messages = messagesByCharacter[selectedId] ?? [];

  function handleSend(text: string) {
    const userMessage: Message = {
      id: `${selectedId}-${Date.now()}-user`,
      sender: "user",
      text,
    };
    const aiMessage: Message = {
      id: `${selectedId}-${Date.now()}-ai`,
      sender: "ai",
      text: selectedCharacter.mockReply,
    };

    setMessagesByCharacter((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), userMessage, aiMessage],
    }));
  }

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      <CharacterSidebar
        characters={characters}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selectedId === STORY_CHARACTER_ID ? (
        <StoryChatPanel character={selectedCharacter} />
      ) : (
        <ChatPanel
          character={selectedCharacter}
          messages={messages}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
