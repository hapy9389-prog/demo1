// 채팅 안에 끼워 넣는 "시스템 안내" 메시지입니다.
// 루나가 하는 말이 아니라는 걸 보여주기 위해 카드류(장면 전환/에피소드 예고)와도
// 다르게, 작고 은은하게 중앙에 표시합니다.

type SystemNoticeProps = {
  text: string;
};

export function SystemNotice({ text }: SystemNoticeProps) {
  return (
    <div className="flex justify-center py-1">
      <p className="max-w-xs whitespace-pre-line rounded-full border border-neutral-800 bg-neutral-950/60 px-4 py-1.5 text-center text-xs text-neutral-500">
        {text}
      </p>
    </div>
  );
}
