// "대화 힌트" 버튼 + 패널입니다. 메시지 목록과 입력창 사이에 배치합니다.
// 예시 문장을 누르면 입력창에 그 문장만 채워지고, 전송은 사용자가 직접 해야 합니다.

"use client";

import { useState } from "react";
import type { StoryHint } from "@/lib/story-hints";

type StoryHintPanelProps = {
  hint: StoryHint | null;
  onUseExample: (text: string) => void;
};

export function StoryHintPanel({ hint, onUseExample }: StoryHintPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleUseExample(text: string) {
    onUseExample(text);
    setIsOpen(false);
  }

  return (
    <div className="border-t border-neutral-800 px-3 pt-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full px-3 py-1 text-xs font-medium text-violet-300 transition-colors hover:bg-neutral-800"
      >
        💡 대화 힌트
      </button>

      {isOpen && (
        <div className="mb-2 mt-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
          {hint ? (
            <>
              <p className="text-xs leading-relaxed text-neutral-300">{hint.direction}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {hint.examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleUseExample(example)}
                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-left text-xs text-neutral-200 transition-colors hover:border-violet-600 hover:text-violet-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-400">지금처럼 편하게 대화를 이어가 보세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
