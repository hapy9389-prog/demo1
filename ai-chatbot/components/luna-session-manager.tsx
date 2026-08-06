// /characters/luna 페이지에 들어가는 "대화 시작하기" 영역입니다.
// - 새로운 대화 시작: 세션을 하나 새로 만들고 채팅 화면으로 이동
// - 기존 대화 이어하기: localStorage에 저장된 세션 목록을 보여주고, 이어하기/삭제/이름 변경을 처리

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSession,
  deleteSession,
  getSessionsByCharacter,
  renameSession,
} from "@/lib/story-session-storage";
import type { StorySession } from "@/lib/story-session-types";
import { INITIAL_AFFECTION, getSceneById, lunaEpisode } from "@/lib/story-scenes";
import { getSceneOpeningLine } from "@/lib/mock-story-engine";

const CHARACTER_ID = "luna";

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function LunaSessionManager() {
  const router = useRouter();
  const [showList, setShowList] = useState(false);
  const [sessions, setSessions] = useState<StorySession[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function refreshList() {
    setSessions(getSessionsByCharacter(CHARACTER_ID));
  }

  function handleStartNew() {
    const firstScene = lunaEpisode.scenes[0];
    const session = createSession({
      characterId: CHARACTER_ID,
      title: "루나와의 새 대화",
      sceneId: firstScene.id,
      affection: INITIAL_AFFECTION,
      openingMessage: {
        id: crypto.randomUUID(),
        sender: "ai",
        text: getSceneOpeningLine(firstScene.id),
      },
    });
    router.push(`/chat/luna?sessionId=${session.sessionId}`);
  }

  function handleToggleList() {
    if (!showList) refreshList();
    setShowList((prev) => !prev);
  }

  function handleResume(sessionId: string) {
    router.push(`/chat/luna?sessionId=${sessionId}`);
  }

  function handleDelete(sessionId: string) {
    const ok = window.confirm("이 대화를 삭제할까요? 삭제하면 되돌릴 수 없어요.");
    if (!ok) return;
    deleteSession(sessionId);
    refreshList();
  }

  function handleStartRename(session: StorySession) {
    setEditingId(session.sessionId);
    setEditValue(session.title);
  }

  function handleSaveRename(sessionId: string) {
    const title = editValue.trim();
    if (title) {
      renameSession(sessionId, title);
    }
    setEditingId(null);
    refreshList();
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleStartNew}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-violet-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          새로운 대화 시작
        </button>
        <button
          type="button"
          onClick={handleToggleList}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-700 px-5 py-3 text-sm font-medium text-neutral-200 transition-colors hover:border-violet-600 hover:text-violet-300"
        >
          기존 대화 이어하기
        </button>
      </div>

      {showList && (
        <div className="flex flex-col gap-3">
          {sessions.length === 0 ? (
            <p className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center text-sm text-neutral-400">
              저장된 대화가 없습니다.
            </p>
          ) : (
            sessions.map((session) => {
              const scene = getSceneById(lunaEpisode, session.currentSceneId);
              const isEditing = editingId === session.sessionId;

              return (
                <div
                  key={session.sessionId}
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editValue}
                          onChange={(event) => setEditValue(event.target.value)}
                          autoFocus
                          className="min-w-0 flex-1 rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(session.sessionId)}
                          className="shrink-0 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <p className="truncate text-sm font-medium text-neutral-50">
                        {session.title}
                      </p>
                    )}
                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {scene.title} · 호감도 {session.affection} · {formatUpdatedAt(session.updatedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartRename(session)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
                      >
                        이름 변경
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleResume(session.sessionId)}
                      className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
                    >
                      이어하기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(session.sessionId)}
                      className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
