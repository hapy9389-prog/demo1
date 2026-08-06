// 루나 전용 스토리 채팅 화면입니다. 선택지 없이 자유 입력만 받습니다.
// 사용자가 메시지를 보내면 mockStoryEngine이 (지금은 목업으로) 답변/호감도/이벤트를
// 계산하고, 조건이 충족되면 checkSceneTransition에 따라 다음 장면으로 넘어갑니다.
//
// 대화 시작값(initialMessages/initialState)과 상태가 바뀔 때마다 알려주는
// onStateChange는 부모(LunaChatScreen)가 세션 저장을 위해 넘겨줍니다.
// 이 컴포넌트 자신은 "지금 어떤 세션인지"는 전혀 모르고, 그저 주어진 값으로
// 대화를 진행시키는 역할만 합니다.

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
  /** 이 대화 세션이 지금까지 가지고 있던 메시지 목록 */
  initialMessages: Message[];
  /** 이 대화 세션의 현재 장면/호감도/턴수/이벤트 상태 */
  initialState: StoryState;
  /** 메시지나 상태가 바뀔 때마다 최신값을 통째로 알려주는 콜백 (세션 저장용) */
  onStateChange: (messages: Message[], state: StoryState) => void;
};

/** 호감도가 0보다 작아지거나 100보다 커지지 않게 잘라줍니다. */
function clampAffection(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function createMessage(sender: Message["sender"], text: string): Message {
  return { id: crypto.randomUUID(), sender, text };
}

export function StoryChatPanel({
  character,
  initialMessages,
  initialState,
  onStateChange,
}: StoryChatPanelProps) {
  const [state, setState] = useState<StoryState>(initialState);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

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

    const finalMessages = [...messages, ...newMessages];

    setMessages(finalMessages);
    setState(updatedState);
    onStateChange(finalMessages, updatedState);
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
