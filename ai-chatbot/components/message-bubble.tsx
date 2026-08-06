// 채팅 메시지 하나를 렌더링하는 컴포넌트입니다.
// 자유 채팅(chat-panel)과 스토리 채팅(story-chat-panel)에서 공통으로 사용합니다.
// kind가 "scene-transition"이면 장면 전환 카드를, "episode-preview"면 다음 에피소드
// 예고 카드를, "system-notice"면 시스템 안내를 보여줍니다.

import type { Message } from "@/lib/characters";
import { StoryTransitionCard } from "@/components/story-transition-card";
import { EpisodePreviewCard } from "@/components/episode-preview-card";
import { SystemNotice } from "@/components/system-notice";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.kind === "scene-transition") {
    return (
      <StoryTransitionCard
        narration={message.narration}
        nextSceneNumber={message.nextSceneNumber}
        nextSceneTitle={message.nextSceneTitle}
      />
    );
  }

  if (message.kind === "episode-preview") {
    return (
      <EpisodePreviewCard narration={message.narration} previewLabel={message.previewLabel} />
    );
  }

  if (message.kind === "system-notice") {
    return <SystemNotice text={message.text} />;
  }

  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "rounded-br-sm bg-violet-600 text-white"
            : "rounded-bl-sm bg-neutral-800 text-neutral-100"
        }`}
      >
        {message.text}
      </p>
    </div>
  );
}
