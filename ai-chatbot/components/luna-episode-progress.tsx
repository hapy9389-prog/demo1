// /characters/luna 페이지에 들어가는 "에피소드 진행" 영역입니다.
// 가장 최근에 수정된 대화 세션을 기준으로 각 장면의 완료/진행중/잠김 상태를 보여줍니다.
// 저장된 세션이 없으면 전부 잠김(시작 전) 상태로 보여줍니다.

"use client";

import { useEffect, useState } from "react";
import { getSessionsByCharacter } from "@/lib/story-session-storage";
import { getEpisodeProgress, lunaEpisode } from "@/lib/story-scenes";

type SceneStatus = "completed" | "in-progress" | "locked";

const STATUS_LABEL: Record<SceneStatus, string> = {
  completed: "완료",
  "in-progress": "진행 중",
  locked: "잠김",
};

const STATUS_STYLE: Record<SceneStatus, string> = {
  completed: "bg-violet-600 text-white",
  "in-progress": "bg-violet-950 text-violet-300 border border-violet-700",
  locked: "bg-neutral-800 text-neutral-500",
};

type Progress = { completedSceneIds: string[]; unlockedSceneIds: string[] };

export function LunaEpisodeProgress() {
  // localStorage는 브라우저에서만 읽을 수 있어서, 마운트 이후(useEffect)에만 조회합니다.
  const [progressState, setProgressState] = useState<Progress>({
    completedSceneIds: [],
    unlockedSceneIds: [],
  });

  useEffect(() => {
    const [latestSession] = getSessionsByCharacter("luna");
    // localStorage(외부 저장소)를 읽어와 화면 상태와 동기화하는 용도라서
    // useEffect + setState 조합이 맞는 상황입니다 (마운트 후 1회만 실행).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressState({
      completedSceneIds: latestSession?.completedSceneIds ?? [],
      unlockedSceneIds: latestSession?.unlockedSceneIds ?? [],
    });
  }, []);

  const { completedSceneIds, unlockedSceneIds } = progressState;
  const progress = getEpisodeProgress(completedSceneIds);

  function getStatus(sceneId: string): SceneStatus {
    if (completedSceneIds.includes(sceneId)) return "completed";
    if (unlockedSceneIds.includes(sceneId)) return "in-progress";
    return "locked";
  }

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-violet-300">에피소드 진행</h2>
        <span className="text-xs text-neutral-400">{progress}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {lunaEpisode.scenes.map((scene, index) => {
          const status = getStatus(scene.id);
          const isLocked = status === "locked";

          return (
            <li
              key={scene.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-neutral-950/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-100">
                  {index + 1}. {isLocked ? "아직 공개되지 않은 이야기" : scene.title}
                </p>
                {!isLocked && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {scene.publicDescription}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
