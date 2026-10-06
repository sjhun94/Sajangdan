// 아이폰에서 알림을 받으려면 홈 화면에 추가해야 한다는 안내
export function IosInstallGuide({
  hint,
}: {
  hint: "install" | "open-in-browser";
}) {
  if (hint === "open-in-browser") {
    return (
      <div className="flex flex-col gap-1 text-xs text-foreground/60">
        <span>아이폰은 사장단을 홈 화면에 추가해야 알림을 받을 수 있어요.</span>
        <span>
          지금은 앱 안 브라우저라서 추가가 안 돼요. 화면의{" "}
          <b className="text-foreground/80">··· 또는 공유 버튼 → &lsquo;Safari로 열기&rsquo;</b>
          를 누른 뒤 아래 순서대로 해주세요.
        </span>
      </div>
    );
  }
  return (
    <ol className="flex list-decimal flex-col gap-0.5 pl-4 text-xs text-foreground/60">
      <li>
        화면 아래(또는 위)의 <b className="text-foreground/80">공유 버튼</b>
        (네모에서 화살표가 나오는 모양)을 눌러요.
      </li>
      <li>
        <b className="text-foreground/80">&lsquo;홈 화면에 추가&rsquo;</b>를 눌러요.
        안 보이면 메뉴를 아래로 내려보세요.
      </li>
      <li>
        홈 화면에 생긴 <b className="text-foreground/80">사장단 아이콘</b>으로 열고,
        알림 페이지에서 알림을 켜요.
      </li>
    </ol>
  );
}
