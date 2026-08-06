// 대화 세션을 localStorage에 저장하고 불러오는 로직만 모아둔 파일입니다.
// 화면 컴포넌트는 이 파일의 함수만 호출하면 되고, localStorage를 직접 건드리지 않습니다.
//
// 중요: 이 파일의 함수들은 전부 "브라우저에서만" 동작해야 합니다.
// Next.js는 페이지를 서버에서도 한 번 렌더링하는데, 서버에는 localStorage가 없기 때문에
// 모든 함수 맨 앞에서 window가 있는지부터 확인합니다.

import type { Message } from "@/lib/characters";
import type { StorySession } from "@/lib/story-session-types";

const STORAGE_KEY = "storychat.sessions.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** 저장된 전체 세션 목록(모든 캐릭터 포함)을 읽어옵니다. */
function loadAllSessions(): StorySession[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StorySession[];
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
  openingMessage: Message;
};

/** 새 세션을 만들어서 바로 저장하고, 만든 세션을 반환합니다. */
export function createSession(input: CreateSessionInput): StorySession {
  const now = new Date().toISOString();

  const session: StorySession = {
    sessionId: crypto.randomUUID(),
    characterId: input.characterId,
    title: input.title,
    currentSceneId: input.sceneId,
    affection: input.affection,
    messages: [input.openingMessage],
    conversationCount: 0,
    turnCount: 0,
    triggeredEvents: [],
    createdAt: now,
    updatedAt: now,
  };

  upsertSession(session);
  return session;
}
