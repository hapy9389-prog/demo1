// /chat/luna 페이지의 실제 내용입니다. (client 컴포넌트)
// URL의 sessionId를 기준으로 저장된 대화 세션 하나를 불러와 StoryChatPanel에 연결합니다.
// 메시지/장면/호감도가 바뀔 때마다 "그 세션만" localStorage에 다시 저장합니다.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Message } from "@/lib/characters";
import { getCharacterById } from "@/lib/characters";
import { ChatNavBar } from "@/components/chat-nav-bar";
import { StoryChatPanel } from "@/components/story-chat-panel";
import {
  createSession,
  getSessionById,
  upsertSession,
} from "@/lib/story-session-storage";
import type { StorySession } from "@/lib/story-session-types";
import type { StoryState } from "@/lib/story-types";
import { INITIAL_AFFECTION, getSceneOpeningLine, lunaEpisode } from "@/lib/story-scenes";

// 이 화면은 루나 전용이라 데이터가 항상 존재한다는 걸 알고 있습니다.
const luna = getCharacterById("luna")!;

type LunaChatScreenProps = {
  sessionId?: string;
};

// "이 화면이 지금 뭘 보여줘야 하는지"를 하나의 상태로 합쳐뒀습니다.
// (로딩중 / 못찾음 / 준비완료-세션포함 을 각각 따로 useState로 관리하면
//  서로 어긋날 수 있어서, 한 번에 같이 바뀌도록 묶었습니다)
type ChatLoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "ready"; session: StorySession };

export function LunaChatScreen({ sessionId }: LunaChatScreenProps) {
  const router = useRouter();
  const [loadState, setLoadState] = useState<ChatLoadState>({
    status: "loading",
  });

  useEffect(() => {
    if (!sessionId) {
      // sessionId 없이 채팅 화면에 바로 들어온 경우 — 안전하게 상세 페이지로 돌려보냅니다.
      router.replace("/characters/luna");
      return;
    }

    const found = getSessionById(sessionId);
    // localStorage(브라우저 저장소)라는 외부 저장소를 읽어와 화면 상태와 동기화하는
    // 용도라서 useEffect + setState 조합이 맞는 상황입니다 (마운트 후 1회만 실행).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadState(
      !found || found.characterId !== "luna"
        ? { status: "not-found" }
        : { status: "ready", session: found }
    );
  }, [sessionId, router]);

  function handleStateChange(messages: Message[], state: StoryState) {
    setLoadState((prev) => {
      if (prev.status !== "ready") return prev;

      const updated: StorySession = {
        ...prev.session,
        messages,
        currentSceneId: state.sceneId,
        affection: state.affection,
        turnCount: state.turnCount,
        sceneProgressFlags: state.sceneProgressFlags,
        completedSceneIds: state.completedSceneIds,
        unlockedSceneIds: state.unlockedSceneIds,
        storyEventIds: state.storyEventIds,
        episodeStatus: state.episodeStatus,
        epilogueStage: state.epilogueStage,
        fatherMessageSent: state.fatherMessageSent,
        fatherReplyReceived: state.fatherReplyReceived,
        promises: state.promises,
        sceneHintNoticeShown: state.sceneHintNoticeShown,
        conversationCount: messages.filter((m) => m.kind === "chat" && m.sender === "user")
          .length,
        updatedAt: new Date().toISOString(),
      };

      upsertSession(updated); // 이 세션만 저장, 다른 세션은 건드리지 않음
      return { status: "ready", session: updated };
    });
  }

  function handleStartNewConversation() {
    const firstScene = lunaEpisode.scenes[0];
    const newSession = createSession({
      characterId: "luna",
      title: "루나와의 새 대화",
      sceneId: firstScene.id,
      affection: INITIAL_AFFECTION,
      openingMessageText: getSceneOpeningLine(lunaEpisode, firstScene.id),
    });
    router.push(`/chat/luna?sessionId=${newSession.sessionId}`);
  }

  if (loadState.status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-sm text-neutral-400">
        불러오는 중...
      </div>
    );
  }

  if (loadState.status === "not-found") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-950 px-4 text-center text-neutral-100">
        <p className="text-sm text-neutral-400">
          대화를 찾을 수 없어요. 삭제되었거나 잘못된 주소일 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => router.push("/characters/luna")}
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          캐릭터 정보로 돌아가기
        </button>
      </div>
    );
  }

  const activeSession = loadState.session;

  return (
    <div className="flex h-screen w-full flex-col bg-neutral-950 text-neutral-100">
      <ChatNavBar
        homeHref="/"
        characterHref="/characters/luna"
        sessionTitle={activeSession.title}
        storyEventIds={activeSession.storyEventIds}
        onStartNewConversation={handleStartNewConversation}
      />
      <StoryChatPanel
        key={activeSession.sessionId}
        character={luna}
        initialMessages={activeSession.messages}
        initialState={{
          sceneId: activeSession.currentSceneId,
          turnCount: activeSession.turnCount,
          affection: activeSession.affection,
          sceneProgressFlags: activeSession.sceneProgressFlags,
          completedSceneIds: activeSession.completedSceneIds,
          unlockedSceneIds: activeSession.unlockedSceneIds,
          storyEventIds: activeSession.storyEventIds,
          episodeStatus: activeSession.episodeStatus,
          epilogueStage: activeSession.epilogueStage,
          fatherMessageSent: activeSession.fatherMessageSent,
          fatherReplyReceived: activeSession.fatherReplyReceived,
          promises: activeSession.promises,
          sceneHintNoticeShown: activeSession.sceneHintNoticeShown,
        }}
        onStateChange={handleStateChange}
      />
    </div>
  );
}
