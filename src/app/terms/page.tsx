export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-black">이용약관</h1>
      <p className="text-xs text-foreground/40">시행일: 2026년 7월 29일</p>

      <div className="flex flex-col gap-6 text-sm leading-7 text-foreground/80">
        <section>
          <h2 className="mb-2 font-bold text-foreground">제1조 (목적)</h2>
          <p>
            이 약관은 사장단(이하 &ldquo;서비스&rdquo;)을 이용함에 있어
            서비스와 이용자 간의 권리, 의무 및 책임사항, 이용조건 및 절차 등
            기본적인 사항을 정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">제2조 (서비스의 내용)</h2>
          <p>
            서비스는 자영업자(현재 사장님) 및 예비 창업자(예비 사장님)를
            대상으로 한 익명 커뮤니티로, 게시판 이용, 사업자 인증, 매출/연차
            인증 등의 기능을 제공합니다. 게시글과 댓글에는 작성자의 실명이나
            아이디 대신 &ldquo;동작구 카페사장님&rdquo;과 같이 동네와 업종을
            조합한 표시 이름이 사용됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">제3조 (회원가입)</h2>
          <p>
            서비스는 카카오, 구글, 네이버 계정을 통한 간편가입 방식을
            제공합니다. 이용자는 가입 시 실제 이용 중인 동네와 업종 정보를
            정확하게 입력해야 하며, 허위 정보 입력으로 발생하는 불이익은
            이용자 본인이 부담합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            제4조 (이용자의 의무 및 금지행위)
          </h2>
          <p>이용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다.</p>
          <ul className="mt-2 list-disc pl-5">
            <li>스팸, 광고성 게시물을 반복적으로 게시하는 행위</li>
            <li>다른 이용자를 향한 욕설, 비방, 명예훼손 행위</li>
            <li>사기, 허위 정보 유포 등 타인에게 금전적·정신적 피해를 주는 행위</li>
            <li>타인의 사업자 정보를 도용하거나 허위로 인증을 시도하는 행위</li>
            <li>그 밖에 관계 법령 또는 공서양속에 위반되는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            제5조 (게시물의 관리)
          </h2>
          <p>
            이용자는 부적절한 게시글이나 댓글을 신고할 수 있으며, 신고된
            콘텐츠는 운영자의 검토를 거쳐 삭제될 수 있습니다. 또한 이용자는
            특정 사용자를 차단하여 해당 사용자의 게시물이 자신에게 노출되지
            않도록 설정할 수 있습니다. 제4조를 위반한 게시물은 사전 통지 없이
            삭제되거나 작성자의 서비스 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">
            제6조 (서비스 이용 제한 및 계정 정지)
          </h2>
          <p>
            운영자는 이용자가 이 약관을 위반하거나 서비스의 정상적인 운영을
            방해하는 경우, 사전 통지 없이 해당 이용자의 서비스 이용을
            일시적 또는 영구적으로 제한할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">제7조 (면책조항)</h2>
          <p>
            서비스에 게시된 모든 콘텐츠의 내용에 대한 책임은 작성자 본인에게
            있으며, 운영자는 이용자가 게시한 정보의 신뢰성, 정확성에 대해
            보증하지 않습니다. 사업자 인증 및 매출/연차 인증은 이용자가 제출한
            자료를 바탕으로 한 것으로, 운영자가 그 진위를 완전히 보증하지는
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">제8조 (약관의 변경)</h2>
          <p>
            운영자는 필요한 경우 이 약관을 변경할 수 있으며, 변경된 약관은
            서비스 내 공지를 통해 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-foreground">제9조 (문의처)</h2>
          <p>
            서비스 이용과 관련한 문의사항은 아래 이메일로 연락해주세요.
            <br />
            이메일: sjhun94@naver.com
          </p>
        </section>
      </div>
    </div>
  );
}
