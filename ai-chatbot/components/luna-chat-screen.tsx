// /chat/luna 페이지의 실제 내용입니다. (client 컴포넌트)
// 상단 이동 버튼(ChatNavBar) + 기존 StoryChatPanel을 그대로 조합합니다.
//
// "새로 시작" 버튼을 누르면 resetKey를 바꿔서 StoryChatPanel을 통째로 리마운트합니다.
// 이렇게 하면 StoryChatPanel 내부 코드는 전혀 건드리지 않고도 대화/호감도/장면 상태를
// 처음 상태로 되돌릴 수 있습니다 (React는 key가 바뀌면 컴포넌트를 새로 만듭니다).

"use client";

import { useState } from "react";
import { ChatNavBar } from "@/components/chat-nav-bar";
import { StoryChatPanel } from "@/components/story-chat-panel";
import { getCharacterById } from "@/lib/characters";

// 이 화면은 루나 전용이라 데이터가 항상 존재한다는 걸 알고 있습니다.
const luna = getCharacterById("luna")!;

export function LunaChatScreen() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-100">
      <ChatNavBar
        homeHref="/"
        characterHref="/characters/luna"
        onReset={() => setResetKey((key) => key + 1)}
      />
      <StoryChatPanel key={resetKey} character={luna} />
    </div>
  );
}
