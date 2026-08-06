// 캐릭터 채팅에서 쓰는 타입과 목업(가짜) 데이터를 모아둔 파일입니다.
// 아직 실제 AI API나 데이터베이스는 연결하지 않았기 때문에,
// 화면에 보여줄 캐릭터 정보와 대화 내용을 여기서 직접 정의합니다.

export type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export type Character = {
  id: string;
  name: string;
  description: string;
  /** 아바타 대신 사용할 이모지 (이미지 파일 없이 간단하게 표현) */
  avatar: string;
  /** 홈 화면 카드에 표시할 장르 */
  genre: string;
  /** 사용자가 메시지를 보낼 때마다 돌려줄 고정된 목업 답변 */
  mockReply: string;
  /** 채팅방을 처음 열었을 때 이미 보여줄 예시 대화 */
  initialMessages: Message[];
  /** 캐릭터 상세 페이지용 좀 더 긴 소개 (아직 상세 페이지가 없는 캐릭터는 비워둠) */
  intro?: string;
  /** 캐릭터 상세 페이지용 성격 설명 */
  personality?: string;
  /** 캐릭터 상세 페이지용 세계관 설명 */
  worldview?: string;
};

export const characters: Character[] = [
  {
    id: "luna",
    name: "루나",
    description: "밤하늘을 좋아하는 다정한 상담가",
    avatar: "🌙",
    genre: "감성 드라마",
    intro:
      "늦은 밤 학교 옥상에서 혼자 별을 보는 걸 좋아하는 아이. 낯을 많이 가리지만, 한 번 마음을 열면 누구보다 다정해져요.",
    personality:
      "겉으로는 무심하고 까칠해 보이지만, 마음을 연 상대에게는 누구보다 다정하고 세심하게 챙겨주는 성격이에요.",
    worldview:
      "평범한 고등학교가 배경이지만, 등장인물들은 저마다 말 못 할 사정을 안고 있어요. 루나는 답답한 마음이 들 때마다 아무도 없는 늦은 밤 옥상에 올라가 별을 보며 마음을 달래곤 해요.",
    mockReply: "그렇구나, 네 이야기를 들으니 나도 기분이 좋아져. 조금 더 말해줄래?",
    initialMessages: [
      {
        id: "luna-1",
        sender: "ai",
        text: "안녕! 나는 루나야. 오늘 하루는 어땠어?",
      },
      {
        id: "luna-2",
        sender: "user",
        text: "안녕 루나! 오늘 조금 피곤한 하루였어.",
      },
      {
        id: "luna-3",
        sender: "ai",
        text: "고생 많았어. 잠깐 쉬면서 나랑 편하게 이야기 나누자.",
      },
    ],
  },
  {
    id: "kai",
    name: "카이",
    description: "장난기 넘치는 게임 친구",
    avatar: "🎮",
    genre: "코미디",
    mockReply: "오, 재밌겠는데? 나도 껴줘! 다음엔 뭐 할 거야?",
    initialMessages: [
      {
        id: "kai-1",
        sender: "ai",
        text: "왔구나! 오늘은 같이 뭐 하고 놀까?",
      },
      {
        id: "kai-2",
        sender: "user",
        text: "새로 나온 게임 얘기하고 싶어.",
      },
      {
        id: "kai-3",
        sender: "ai",
        text: "좋아! 어떤 게임인지 자세히 말해줘, 궁금해 죽겠어.",
      },
    ],
  },
  {
    id: "haeun",
    name: "하은",
    description: "책과 글쓰기를 좋아하는 차분한 친구",
    avatar: "📚",
    genre: "잔잔한 힐링",
    mockReply: "흥미로운 이야기네요. 그 부분에 대해 조금 더 자세히 들려주실래요?",
    initialMessages: [
      {
        id: "haeun-1",
        sender: "ai",
        text: "안녕하세요, 저는 하은이에요. 요즘 읽고 있는 책이 있나요?",
      },
      {
        id: "haeun-2",
        sender: "user",
        text: "네, 요즘 소설 한 권을 읽고 있어요.",
      },
      {
        id: "haeun-3",
        sender: "ai",
        text: "좋네요! 어떤 이야기인지 정말 궁금해요.",
      },
    ],
  },
];

/** id로 캐릭터를 찾습니다. */
export function getCharacterById(id: string): Character | undefined {
  return characters.find((character) => character.id === id);
}
