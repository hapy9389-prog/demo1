// 루나의 첫 번째 에피소드 "옥상에서 만난 아이"의 실제 장면 데이터입니다.
// 대사를 직접 적어두는 대신, 각 장면의 배경/목표/이벤트 조건만 정의해서
// (mock-story-engine.ts 또는 나중의 실제 AI가) 이 정보를 보고 알아서 대답을 만들도록 합니다.

import type { Episode, Scene, StoryState } from "@/lib/story-types";

// ⚠️ 테스트 편의를 위한 임시 조건입니다.
// 데모에서 매번 3~5번씩 대화해야 장면이 넘어가면 확인이 번거로워서
// 최소 대화 횟수를 잠깐 낮춰둔 것이며, 나중에 정식으로 스토리를 다듬을 때는
// 원래 의도(3~5회 정도의 자연스러운 대화 후 전환)에 맞게 다시 늘려야 합니다.
/** 장면 전환에 필요한 최소 대화 횟수 (임시: 데모용으로 2회로 낮춤) */
const MIN_TURNS_BEFORE_TRANSITION = 2;

export const lunaEpisode: Episode = {
  id: "roof-first-meeting",
  title: "옥상에서 만난 아이",
  scenes: [
    {
      id: "scene-1",
      title: "경계하는 첫 만남",
      setting:
        "늦은 밤, 학교 옥상. 사용자는 혼자 별을 보고 있는 루나를 우연히 발견한다.",
      goal:
        "루나는 처음엔 낯선 사람을 경계하지만, 대화가 다정하게 이어지면 조금씩 긴장을 풀고 싶어 한다.",
      requiredEvents: ["friendly_reaction"],
      forbiddenEvents: ["reveal_past_trauma"],
      // ⚠️ transitionCondition 설명도 위 임시 조건(MIN_TURNS_BEFORE_TRANSITION=2)에 맞춰뒀습니다.
      transitionCondition:
        "(임시: 데모 편의용) 최소 2회 이상 대화를 나누고, 그중 최소 1회 사용자가 다정한 반응(friendly_reaction)을 보이면 다음 장면으로 전환",
      nextSceneId: "scene-2",
    },
    {
      id: "scene-2",
      title: "조금씩 여는 마음",
      setting: "루나가 경계를 살짝 풀고, 별을 보러 온 이유를 조금씩 이야기하기 시작한다.",
      goal:
        "루나는 학교생활의 답답함을 슬쩍 언급하며 사용자에게 조금 더 마음을 열고 싶어 한다.",
      requiredEvents: [],
      forbiddenEvents: [],
      transitionCondition: "이번 프로토타입에서는 이후 장면을 아직 만들지 않았습니다.",
      nextSceneId: null,
    },
  ],
};

/** id로 장면을 찾습니다. 없으면 에피소드의 첫 장면을 반환합니다. */
export function getSceneById(episode: Episode, sceneId: string): Scene {
  return (
    episode.scenes.find((scene) => scene.id === sceneId) ?? episode.scenes[0]
  );
}

/**
 * 현재 장면에서 다음 장면으로 넘어갈 조건이 충족됐는지 확인합니다.
 * - 최소 대화 횟수를 채웠고
 * - scene.requiredEvents가 전부 triggeredEvents 안에 들어있어야 true
 */
export function checkSceneTransition(scene: Scene, state: StoryState): boolean {
  if (!scene.nextSceneId) return false;
  if (state.turnCount < MIN_TURNS_BEFORE_TRANSITION) return false;
  return scene.requiredEvents.every((event) =>
    state.triggeredEvents.includes(event)
  );
}
