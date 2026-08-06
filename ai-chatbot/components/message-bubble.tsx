// 채팅 메시지 하나를 말풍선으로 보여주는 컴포넌트입니다.
// 자유 채팅(chat-panel)과 스토리 채팅(story-chat-panel)에서 공통으로 사용합니다.

import type { Message } from "@/lib/characters";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
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
