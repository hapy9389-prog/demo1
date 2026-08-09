// 대화 세션을 localStorage에 저장하고 불러오는 로직만 모아둔 파일입니다.
// 화면 컴포넌트는 이 파일의 함수만 호출하면 되고, localStorage를 직접 건드리지 않습니다.
//
// 중요: 이 파일의 함수들은 전부 "브라우저에서만" 동작해야 합니다.
// Next.js는 페이지를 서버에서도 한 번 렌더링하는데, 서버에는 localStorage가 없기 때문에
// 모든 함수 맨 앞에서 window가 있는지부터 확인합니다.

import type { ChatMessage, Message } from "@/lib/characters";
import type { StorySession } from "@/lib/story-session-types";
import { INITIAL_AFFECTION, getSceneById, lunaEpisode } from "@/lib/story-scenes";

const STORAGE_KEY = "storychat.sessions.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * 예전 버전에서 저장된 세션도 에러 없이 열 수 있도록 안전하게 새 구조로 바꿔줍니다.
 *
 * `raw.episodeStatus`가 있으면 이미 지금 버전의 구조로 저장된 세션이라는 뜻이라,
 * 값을 그대로 신뢰합니다(형식만 안전하게 보정). 그게 없으면(episodeStatus/sceneProgressFlags
 * 개념이 생기기 전, 옛 필드 이름을 쓰던 세션) 진행 상태를 currentSceneId 기준으로
 * 새로 계산합니다 — 옛 이벤트 태그 이름이 지금 플래그와 안 맞기 때문입니다.
 * 어느 경우든 대화 내용(messages)·호감도·제목·생성/수정 시각은 그대로 보존합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSession(raw: any): StorySession {
  const messages: Message[] = Array.isArray(raw.messages)
    ? raw.messages.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (message: any): Message =>
          message && typeof message.kind === "string"
            ? (message as Message)
            : ({ ...message, kind: "chat" } as ChatMessage)
      )
    : [];

  const currentSceneId =
    typeof raw.currentSceneId === "string"
      ? raw.currentSceneId
      : lunaEpisode.scenes[0].id;

  const now = new Date().toISOString();

  const base = {
    sessionId: raw.sessionId,
    characterId: raw.characterId,
    title: typeof raw.title === "string" ? raw.title : "저장된 대화",
    currentSceneId,
    affection: typeof raw.affection === "number" ? raw.affection : INITIAL_AFFECTION,
    messages,
    conversationCount:
      typeof raw.conversationCount === "number"
        ? raw.conversationCount
        : messages.filter((m) => m.kind === "chat" && m.sender === "user").length,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };

  const isCurrentFormat = typeof raw.episodeStatus === "string";

  if (isCurrentFormat) {
    // 이미 지금 구조로 저장된 세션 — 진행 상태를 그대로 신뢰합니다 (매번 초기화하지 않음).
    return {
      ...base,
      turnCount: typeof raw.turnCount === "number" ? raw.turnCount : 0,
      sceneProgressFlags:
        raw.sceneProgressFlags && typeof raw.sceneProgressFlags === "object"
          ? raw.sceneProgressFlags
          : {},
      completedSceneIds: Array.isArray(raw.completedSceneIds) ? raw.completedSceneIds : [],
      unlockedSceneIds: Array.isArray(raw.unlockedSceneIds)
        ? raw.unlockedSceneIds
        : [currentSceneId],
      storyEventIds: Array.isArray(raw.storyEventIds) ? raw.storyEventIds : [],
      episodeStatus: raw.episodeStatus,
      epilogueStage: typeof raw.epilogueStage === "number" ? raw.epilogueStage : 0,
      fatherMessageSent: Boolean(raw.fatherMessageSent),
      fatherReplyReceived: Boolean(raw.fatherReplyReceived),
      promises: Array.isArray(raw.promises) ? raw.promises : [],
      sceneHintNoticeShown: Boolean(raw.sceneHintNoticeShown),
      // 이 필드가 생기기 전에 저장된 세션(현재 포맷이지만 introShown이 없음)은
      // 이미 대화를 시작한 세션이므로 true로 취급해서 온보딩 안내가 다시 뜨지 않게 합니다.
      introShown: typeof raw.introShown === "boolean" ? raw.introShown : true,
    };
  }

  // 옛 형식 세션 — currentSceneId를 기준으로 진행 상태를 새로 계산합니다.
  let unlockedSceneIds: string[] = [];
  let completedSceneIds: string[] = [];
  let storyEventIds: string[] = [];
  let isLastScene = false;

  if (raw.characterId === "luna") {
    const sceneIndex = lunaEpisode.scenes.findIndex((scene) => scene.id === currentSceneId);
    const safeIndex = sceneIndex === -1 ? 0 : sceneIndex;
    isLastScene = safeIndex === lunaEpisode.scenes.length - 1;
    unlockedSceneIds = lunaEpisode.scenes.slice(0, safeIndex + 1).map((scene) => scene.id);
    completedSceneIds = lunaEpisode.scenes.slice(0, safeIndex).map((scene) => scene.id);
    storyEventIds = unlockedSceneIds.map((id) => getSceneById(lunaEpisode, id).storyEventId);
  }

  const wasCompleted = isLastScene && Boolean(raw.episodeCompleted);

  return {
    ...base,
    turnCount: 0,
    sceneProgressFlags: {},
    completedSceneIds,
    unlockedSceneIds,
    storyEventIds,
    episodeStatus: wasCompleted ? "after_story" : "in_progress",
    epilogueStage: 0,
    fatherMessageSent: wasCompleted,
    fatherReplyReceived: false,
    promises: [],
    sceneHintNoticeShown: false,
    // 옛 형식 세션도 이미 대화가 진행 중이었으므로 온보딩 안내를 다시 보여주지 않습니다.
    introShown: true,
  };
}

/** 저장된 전체 세션 목록(모든 캐릭터 포함)을 읽어옵니다. */
function loadAllSessions(): StorySession[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateSession);
  } catch {
    // 저장된 값이 깨져있어도 앱이 죽지 않도록 빈 배열로 안전하게 복구합니다.
    return [];
  }
}

function saveAllSessions(sessions: StorySession[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** 특정 캐릭터의 세션만, 최근에 수정된 순서로 정렬해서 반환합니다. */
export function getSessionsByCharacter(characterId: string): StorySession[] {
  return loadAllSessions()
    .filter((session) => session.characterId === characterId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getSessionById(sessionId: string): StorySession | undefined {
  return loadAllSessions().find((session) => session.sessionId === sessionId);
}

/** 세션을 새로 추가하거나(없으면), 있으면 통째로 덮어씁니다. 다른 세션은 그대로 둡니다. */
export function upsertSession(session: StorySession): void {
  const sessions = loadAllSessions();
  const index = sessions.findIndex((item) => item.sessionId === session.sessionId);

  if (index === -1) {
    sessions.push(session);
  } else {
    sessions[index] = session;
  }

  saveAllSessions(sessions);
}

export function renameSession(sessionId: string, title: string): void {
  const sessions = loadAllSessions();
  const target = sessions.find((session) => session.sessionId === sessionId);
  if (!target) return;

  target.title = title;
  target.updatedAt = new Date().toISOString();
  saveAllSessions(sessions);
}

/** 해당 세션 하나만 삭제합니다. 나머지 세션은 영향받지 않습니다. */
export function deleteSession(sessionId: string): void {
  const sessions = loadAllSessions().filter(
    (session) => session.sessionId !== sessionId
  );
  saveAllSessions(sessions);
}

type CreateSessionInput = {
  characterId: string;
  title: string;
  sceneId: string;
  affection: number;
  /** 장면 시작 시 루나가 건네는 첫 대사 (문자열만 넘기면 내부에서 메시지로 만들어줍니다) */
  openingMessageText: string;
};

/** 새 세션을 만들어서 바로 저장하고, 만든 세션을 반환합니다. */
export function createSession(input: CreateSessionInput): StorySession {
  const now = new Date().toISOString();
  const scene = getSceneById(lunaEpisode, input.sceneId);

  const openingMessage: ChatMessage = {
    id: crypto.randomUUID(),
    kind: "chat",
    sender: "ai",
    text: input.openingMessageText,
  };

  const session: StorySession = {
    sessionId: crypto.randomUUID(),
    characterId: input.characterId,
    title: input.title,
    currentSceneId: input.sceneId,
    affection: input.affection,
    messages: [openingMessage],
    conversationCount: 0,
    turnCount: 0,
    // 장면 시작 시 자동으로 참이 되는 첫 비트(seeded 단계)는 목업 엔진이 알아서
    // "이미 지난 단계"로 취급하므로 여기 미리 넣어둘 필요가 없습니다.
    sceneProgressFlags: {},
    completedSceneIds: [],
    unlockedSceneIds: [scene.id],
    storyEventIds: [scene.storyEventId],
    episodeStatus: "in_progress",
    epilogueStage: 0,
    fatherMessageSent: false,
    fatherReplyReceived: false,
    promises: [],
    sceneHintNoticeShown: false,
    // 새로 만든 세션에서만 온보딩 안내를 한 번 보여줍니다 (이어하기 세션은 항상 true로 시작).
    introShown: false,
    createdAt: now,
    updatedAt: now,
  };

  upsertSession(session);
  return session;
}
