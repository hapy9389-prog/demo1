// 메시지 입력창 + 전송 버튼입니다.
// 자유 채팅(chat-panel)과 스토리 채팅(story-chat-panel)에서 공통으로 사용합니다.
//
// 입력값은 부모 컴포넌트가 들고 있는 "제어 컴포넌트"입니다 (value/onChange로 전달받음).
// 힌트 패널에서 예시 문장을 눌렀을 때 입력창에 그 문장을 채워 넣어야 해서 이렇게 만들었습니다.

"use client";

import type { FormEvent } from "react";

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSend: (text: string) => void;
};

export function MessageInput({ value, onChange, placeholder, onSend }: MessageInputProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend(text);
    onChange("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 gap-2 border-t border-neutral-800 p-3"
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="shrink-0 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        전송
      </button>
    </form>
  );
}
