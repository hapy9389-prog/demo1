// 채팅 화면 맨 위에 캐릭터 아바타 + 이름 + 설명을 보여주는 헤더입니다.
// 자유 채팅(chat-panel)과 스토리 채팅(story-chat-panel)에서 공통으로 사용합니다.

type ChatHeaderProps = {
  avatar: string;
  name: string;
  description: string;
};

export function ChatHeader({ avatar, name, description }: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-neutral-800 px-4 py-3">
      <span className="text-2xl">{avatar}</span>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-neutral-50">
          {name}
        </h1>
        <p className="truncate text-xs text-neutral-400">{description}</p>
      </div>
    </header>
  );
}
