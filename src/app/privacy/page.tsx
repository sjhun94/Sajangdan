export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-black">개인정보처리방침</h1>
      <p className="text-xs text-foreground/40">시행일: 2026년 7월 29일</p>

      <div className="flex flex-col gap-6 text-sm leading-7 text-foreground/80">
        <section>
          <h2 className="mb-2 font-bold text-foreground">
            1. 수집하는 개인정보 항목
          </h2>
          <p>사장단은 다음과 같은 개인정보를 수집합니다.</p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              필수 항목: 이메일 주소(카카오/구글/네이버 간편가입 시 해당
              계정으로부터 제공받음), 동네, 업종, 현재/예비 사장님 구분
            </li>
            <li>
              선택 항목: 사업자등록증 이미지(사업자 인증 시), 홈택스 증명서
              이미지·연차·매출 구간(매출/연차 인증 시)
            </li>
            <li>서비스 이용 과정에서 자동으로 생성되는 게시글, 댓글, 신고 내역</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            2. 개인정보의 수집 및 이용 목적
          </h2>
          <ul className="list-disc pl-5">
            <li>회원 식별 및 로그인 처리</li>
            <li>
              &ldquo;동작구 카페사장님&rdquo;과 같은 익명 표시 이름 생성
            </li>
            <li>사업자 인증 및 매출/연차 인증 심사</li>
            <li>신고 처리 및 부정 이용 방지</li>
            <li>공지사항 전달 등 서비스 운영</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p>
            회원 탈퇴 시 또는 수집·이용 목적이 달성된 후에는 지체 없이
            개인정보를 파기합니다. 다만 관계 법령에 따라 보관이 필요한 경우
            해당 법령이 정한 기간 동안 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            4. 개인정보의 제3자 제공 및 위탁
          </h2>
          <p>
            사장단은 아래와 같이 외부 서비스를 통해 회원가입 및 인프라를
            운영하고 있습니다.
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              카카오, 구글, 네이버: 간편가입/로그인 시 각 서비스로부터 이메일
              주소를 제공받습니다.
            </li>
            <li>Vercel: 서비스 호스팅 및 이미지 파일 저장</li>
            <li>Neon: 데이터베이스 운영</li>
          </ul>
          <p className="mt-2">
            그 외의 목적으로 개인정보를 제3자에게 제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            5. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 조회할 수 있으며, 회원 탈퇴를
            통해 개인정보 삭제를 요청할 수 있습니다. 사업자등록증 등 인증
            서류는 비공개로 저장되며 관리자 심사 목적으로만 열람됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            6. 개인정보 보호책임자
          </h2>
          <p>
            개인정보 관련 문의사항은 아래로 연락해주세요.
            <br />
            이메일: sjhun94@naver.com
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            7. 방침의 변경
          </h2>
          <p>
            이 개인정보처리방침은 관계 법령 및 서비스 변경에 따라 수정될 수
            있으며, 변경 시 서비스 내 공지를 통해 안내합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
