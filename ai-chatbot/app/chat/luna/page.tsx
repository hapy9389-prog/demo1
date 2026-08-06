// /chat/luna 라우트입니다. 이 파일은 서버 컴포넌트로 두고(브라우저 탭 제목을 위해
// metadata를 export해야 하는데, client 컴포넌트에서는 metadata를 export할 수 없습니다),
// 실제 화면 내용은 client 컴포넌트인 LunaChatScreen에 맡깁니다.
//
// URL의 ?sessionId=... 값을 읽어서 어떤 대화 세션을 열어야 하는지 알려줍니다.

import type { Metadata } from "next";
import { LunaChatScreen } from "@/components/luna-chat-screen";

export const metadata: Metadata = {
  title: "루나와 대화하기",
};

type ChatLunaPageProps = {
  searchParams: Promise<{ sessionId?: string | string[] }>;
};

export default async function ChatLunaPage({ searchParams }: ChatLunaPageProps) {
  const params = await searchParams;
  const sessionId =
    typeof params.sessionId === "string" ? params.sessionId : undefined;

  return <LunaChatScreen sessionId={sessionId} />;
}
