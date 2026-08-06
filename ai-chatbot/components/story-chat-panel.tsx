// 루나 전용 스토리 채팅 화면입니다. 선택지 없이 자유 입력만 받습니다.
// 사용자가 메시지를 보내면 mockStoryEngine이 (지금은 목업으로) 답변/호감도/진행
// 플래그를 계산하고, 장면의 모든 플래그가 충족되면 checkSceneTransition에 따라
// 다음 장면으로 넘어갑니다. 마지막 장면까지 끝나면 채팅이 끝나지 않고 "후일담"
// (episodeStatus === "after_story") 모드로 자연스럽게 이어지며, 이때는
// mockEpilogueReply가 대신 답변을 만듭니다.
//
// 대화 시작값(initialMessages/initialState)과 상태가 바뀔 때마다 알려주는
// onStateChange는 부모(LunaChatScreen)가 세션 저장을 위해 넘겨줍니다.
// 이 컴포넌트 자신은 "지금 어떤 세션인지"는 전혀 모르고, 그저 주어진 값으로
// 대화를 진행시키는 역할만 합니다.

"use client";

import { useState } from "react";
import type {
  ChatMessage,
  Character,
  EpisodePreviewMessage,
  Message,
  SceneTransitionMessage,
  SystemNoticeMessage,
} from "@/lib/characters";
import { ChatHeader } from "@/components/chat-header";
import { MessageBubble } from "@/components/message-bubble";
import { MessageInput } from "@/components/message-input";
import { StoryStatusBar } from "@/components/story-status-bar";
import { StoryHintPanel } from "@/components/story-hint-panel";
import {
  lunaEpisode,
  getSceneById,
  checkSceneTransition,
  isSceneGoalMet,
  getSceneOpeningLine,
  getRelationshipLabel,
  getEpisodeProgress,
} from "@/lib/story-scenes";
import { mockStoryEngine, mockEpilogueReply } from "@/lib/mock-story-engine";
import { getSceneHint, EPILOGUE_HINT } from "@/lib/story-hints";
import type { StoryState } from "@/lib/story-types";

/** 같은 장면에서 이만큼 대화했는데도 진행이 없으면 "정체 안내"를 한 번 보여줍니다 */
const STALL_NOTICE_TURN_THRESHOLD = 2;

type StoryChatPanelProps = {
  character: Character;
  /** 이 대화 세션이 지금까지 가지고 있던 메시지 목록 */
  initialMessages: Message[];
  /** 이 대화 세션의 현재 장면/호감도/턴수/진행 상태 */
  initialState: StoryState;
  /** 메시지나 상태가 바뀔 때마다 최신값을 통째로 알려주는 콜백 (세션 저장용) */
  onStateChange: (messages: Message[], state: StoryState) => void;
};

/** 호감도가 0보다 작아지거나 100보다 커지지 않게 잘라줍니다. */
function clampAffection(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function createChatMessage(sender: ChatMessage["sender"], text: string): ChatMessage {
  return { id: crypto.randomUUID(), kind: "chat", sender, text };
}

function createTransitionMessage(
  narration: string,
  nextSceneNumber: number | null,
  nextSceneTitle: string | null
): SceneTransitionMessage {
  return {
    id: crypto.randomUUID(),
    kind: "scene-transition",
    narration,
    nextSceneNumber,
    nextSceneTitle,
  };
}

function createEpisodePreviewMessage(
  narration: string,
  previewLabel: string
): EpisodePreviewMessage {
  return { id: crypto.randomUUID(), kind: "episode-preview", narration, previewLabel };
}

function createSystemNoticeMessage(text: string): SystemNoticeMessage {
  return { id: crypto.randomUUID(), kind: "system-notice", text };
}

/** 배열에 값이 없을 때만 추가합니다 (중복 방지) */
function addUnique(list: string[], value: string): string[] {
  return list.includes(value) ? list : [...list, value];
}

export function StoryChatPanel({
  character,
  initialMessages,
  initialState,
  onStateChange,
}: StoryChatPanelProps) {
  const [state, setState] = useState<StoryState>(initialState);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");

  const currentScene = getSceneById(lunaEpisode, state.sceneId);
  const sceneNumber =
    lunaEpisode.scenes.findIndex((scene) => scene.id === currentScene.id) + 1;
  const isAfterStory = state.episodeStatus === "after_story";

  function handleSend(text: string) {
    const userMessage = createChatMessage("user", text);

    if (isAfterStory) {
      handleEpilogueSend(userMessage, text);
      return;
    }

    handleSceneSend(userMessage, text);
  }

  function handleEpilogueSend(userMessage: ChatMessage, text: string) {
    // 지금은 mockEpilogueReply가 답변을 만들지만, 나중에는 이 자리에서
    // 실제 AI 호출 함수를 대신 부르면 됩니다.
    const { reply, affectionDelta, newEpilogueStage, revealsReply } = mockEpilogueReply(
      text,
      state.epilogueStage,
      state.fatherReplyReceived
    );
    const aiMessage = createChatMessage("ai", reply);

    const updatedState: StoryState = {
      ...state,
      affection: clampAffection(state.affection + affectionDelta),
      epilogueStage: newEpilogueStage,
      fatherReplyReceived: state.fatherReplyReceived || revealsReply,
    };

    const newMessages: Message[] = [userMessage, aiMessage];

    if (revealsReply) {
      newMessages.push(
        createEpisodePreviewMessage(
          "며칠 후, 아버지에게서 답장이 도착했다.",
          "에피소드 2 · 답장 속에 담긴 뜻"
        )
      );
    }

    commit(newMessages, updatedState);
  }

  function handleSceneSend(userMessage: ChatMessage, text: string) {
    const { reply, affectionDelta, newEvents } = mockStoryEngine({
      scene: currentScene,
      userMessage: text,
      state,
    });
    const aiMessage = createChatMessage("ai", reply);

    // recentNegativeReaction은 "방금 이 턴"에만 의미가 있는 신호라 매번 리셋한 뒤 다시 채웁니다.
    // (다른 플래그들은 지금처럼 한 번 켜지면 장면이 바뀔 때까지 계속 유지됩니다)
    const updatedFlags: Record<string, boolean> = {
      ...state.sceneProgressFlags,
      recentNegativeReaction: false,
    };
    newEvents.forEach((flagId) => {
      updatedFlags[flagId] = true;
    });

    const updatedState: StoryState = {
      ...state,
      turnCount: state.turnCount + 1,
      affection: clampAffection(state.affection + affectionDelta),
      sceneProgressFlags: updatedFlags,
    };

    const newMessages: Message[] = [userMessage, aiMessage];

    if (checkSceneTransition(currentScene, updatedState) && currentScene.nextSceneId) {
      // 다음 장면이 있는 일반적인 장면 전환
      const nextScene = getSceneById(lunaEpisode, currentScene.nextSceneId);
      const nextSceneNumber =
        lunaEpisode.scenes.findIndex((scene) => scene.id === nextScene.id) + 1;

      updatedState.sceneId = nextScene.id;
      updatedState.turnCount = 0;
      updatedState.sceneProgressFlags = {};
      updatedState.sceneHintNoticeShown = false;
      updatedState.completedSceneIds = addUnique(updatedState.completedSceneIds, currentScene.id);
      updatedState.unlockedSceneIds = addUnique(updatedState.unlockedSceneIds, nextScene.id);
      updatedState.storyEventIds = addUnique(updatedState.storyEventIds, nextScene.storyEventId);

      newMessages.push(
        createTransitionMessage(currentScene.transitionNarration, nextSceneNumber, nextScene.title)
      );
      newMessages.push(createChatMessage("ai", getSceneOpeningLine(lunaEpisode, nextScene.id)));
    } else if (
      !currentScene.nextSceneId &&
      updatedState.episodeStatus === "in_progress" &&
      isSceneGoalMet(currentScene, updatedState)
    ) {
      // 마지막 장면(다음 장면 없음)의 목표를 달성해서 에피소드가 끝난 경우 — 후일담으로 전환
      updatedState.completedSceneIds = addUnique(updatedState.completedSceneIds, currentScene.id);
      updatedState.episodeStatus = "after_story";
      updatedState.fatherMessageSent = true;
      updatedState.epilogueStage = 0;
      updatedState.fatherReplyReceived = false;
      updatedState.promises = addUnique(
        updatedState.promises,
        "다음에도 함께 별을 보기로 약속했다."
      );

      newMessages.push(createTransitionMessage(currentScene.transitionNarration, null, null));
    } else {
      // 장면이 안 바뀌고 그대로 머무른 턴 — 정체됐는지 확인해서 필요하면 안내를 보여줍니다.
      // 계속 시도해도 안 풀리면 힌트 버튼을 누르라고만 하지 않고, 예시 문장을 안내에
      // 직접 띄워서 바로 다음으로 넘어갈 수 있게 합니다. 여전히 안 풀리면
      // STALL_NOTICE_TURN_THRESHOLD턴마다 계속 다시 보여줍니다(한 번만 보여주고 끝내지 않음).
      const madeProgress = newEvents.some((flagId) =>
        currentScene.requiredEvents.includes(flagId)
      );
      const isStallCheckpoint =
        updatedState.turnCount >= STALL_NOTICE_TURN_THRESHOLD &&
        updatedState.turnCount % STALL_NOTICE_TURN_THRESHOLD === 0;

      if (!madeProgress && isStallCheckpoint) {
        updatedState.sceneHintNoticeShown = true;
        const hint = getSceneHint(currentScene, updatedState.sceneProgressFlags);
        const noticeText = hint
          ? `이야기가 잠시 머물러 있습니다.\n이렇게 말해보세요: "${hint.examples[0]}" 또는 "${hint.examples[1]}"`
          : "이야기가 잠시 머물러 있습니다.\n대화 힌트를 확인해 보세요.";
        newMessages.push(createSystemNoticeMessage(noticeText));
      }
    }

    commit(newMessages, updatedState);
  }

  function commit(newMessages: Message[], updatedState: StoryState) {
    const finalMessages = [...messages, ...newMessages];
    setMessages(finalMessages);
    setState(updatedState);
    onStateChange(finalMessages, updatedState);
  }

  const currentHint = isAfterStory
    ? EPILOGUE_HINT
    : getSceneHint(currentScene, state.sceneProgressFlags);

  const statusBarProps = isAfterStory
    ? {
        episodeTitle: state.fatherReplyReceived
          ? "후일담 · 답장이 도착했어요"
          : "후일담 · 답장을 기다리며",
        sceneTitle: "에피소드 완료",
        sceneNumber: lunaEpisode.scenes.length,
        progressHint: "이제 편하게 이야기를 이어가 보세요.",
      }
    : {
        episodeTitle: lunaEpisode.title,
        sceneTitle: currentScene.title,
        sceneNumber,
        progressHint: currentScene.progressHint,
      };

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-neutral-900">
      <ChatHeader
        avatar={character.avatar}
        name={character.name}
        description={character.description}
      />
      <StoryStatusBar
        episodeTitle={statusBarProps.episodeTitle}
        sceneTitle={statusBarProps.sceneTitle}
        sceneNumber={statusBarProps.sceneNumber}
        totalScenes={lunaEpisode.scenes.length}
        affection={state.affection}
        episodeProgress={getEpisodeProgress(state.completedSceneIds)}
        relationshipLabel={getRelationshipLabel(state.affection)}
        progressHint={statusBarProps.progressHint}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <StoryHintPanel hint={currentHint} onUseExample={setDraft} />

      <MessageInput
        value={draft}
        onChange={setDraft}
        placeholder={`${character.name}에게 메시지 보내기...`}
        onSend={handleSend}
      />
    </section>
  );
}
