// 루나 전용 스토리 채팅 화면입니다. 선택지 없이 자유 입력만 받습니다.
// 사용자가 메시지를 보내면 mockStoryEngine이 (지금은 목업으로) 답변/호감도/이벤트를
// 계산하고, 조건이 충족되면 checkSceneTransition에 따라 다음 장면으로 넘어갑니다.

"use client";

import { useState } from "react";
import type { Character, Message } from "@/lib/characters";
import { ChatHeader } from "@/components/chat-header";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { StoryStatusBar } from "@/components/story-status-bar";
import {
  lunaEpisode,
  getSceneById,
  checkSceneTransition,
} from "@/lib/story-scenes";
import { mockStoryEngine, getSceneOpeningLine } from "@/lib/mock-story-engine";
import type { StoryState } from "@/lib/story-types";

type StoryChatPanelProps = {
  character: Character;
};

/** 호감도가 0보다 작아지거나 100보다 커지지 않게 잘라줍니다. */
function clampAffection(value: number): number {
  return Math.min(100, Math.max(0, value));
}

const INITIAL_AFFECTION = 20;

function createMessage(sender: Message["sender"], text: string): Message {
  return { id: crypto.randomUUID(), sender, text };
}

export function StoryChatPanel({ character }: StoryChatPanelProps) {
  const firstScene = lunaEpisode.scenes[0];

  const [state, setState] = useState<StoryState>({
    sceneId: firstScene.id,
    turnCount: 0,
    affection: INITIAL_AFFECTION,
    triggeredEvents: [],
  });
  const [messages, setMessages] = useState<Message[]>(() => [
    createMessage("ai", getSceneOpeningLine(firstScene.id)),
  ]);

  const currentScene = getSceneById(lunaEpisode, state.sceneId);
  const sceneNumber =
    lunaEpisode.scenes.findIndex((scene) => scene.id === currentScene.id) + 1;

  function handleSend(text: string) {
    const userMessage = createMessage("user", text);

    // 지금은 mockStoryEngine이 답변을 만들지만, 나중에는 이 자리에서
    // 같은 입력/출력 타입을 가진 실제 AI 호출 함수를 대신 부르면 됩니다.
    const { reply, affectionDelta, newEvents } = mockStoryEngine({
      scene: currentScene,
      userMessage: text,
      state,
    });
    const aiMessage = createMessage("ai", reply);

    const updatedState: StoryState = {
      sceneId: state.sceneId,
      turnCount: state.turnCount + 1,
      affection: clampAffection(state.affection + affectionDelta),
      triggeredEvents: Array.from(
        new Set([...state.triggeredEvents, ...newEvents])
      ),
    };

    const newMessages: Message[] = [userMessage, aiMessage];

    if (
      checkSceneTransition(currentScene, updatedState) &&
      currentScene.nextSceneId
    ) {
      const nextScene = getSceneById(lunaEpisode, currentScene.nextSceneId);
      updatedState.sceneId = nextScene.id;
      updatedState.turnCount = 0;
      updatedState.triggeredEvents = [];
      newMessages.push(createMessage("ai", getSceneOpeningLine(nextScene.id)));
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setState(updatedState);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-neutral-900">
      <ChatHeader
        avatar={character.avatar}
        name={character.name}
        description={character.description}
      />
      <StoryStatusBar
        episodeTitle={lunaEpisode.title}
        sceneTitle={currentScene.title}
        sceneNumber={sceneNumber}
        totalScenes={lunaEpisode.scenes.length}
        affection={state.affection}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <MessageInput
        placeholder={`${character.name}에게 메시지 보내기...`}
        onSend={handleSend}
      />
    </section>
  );
}
