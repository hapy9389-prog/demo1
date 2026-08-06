import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    // 개발 모드 표시 아이콘이 채팅 입력창을 가리지 않도록 오른쪽 위로 옮깁니다.
    position: "top-right",
  },
};

export default nextConfig;
