import { OG_SIZE, renderShareCard } from "@/lib/ogCard";

export const alt = "사장단 - 자영업자 전용 익명 커뮤니티";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderShareCard({
    badges: ["익명", "사장님 전용"],
    title: "우리끼리니까 할 수 있는 말",
    footnote: "동작구 카페사장님처럼 동네와 업종으로만 표시돼요",
  });
}
