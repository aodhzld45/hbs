import { Server, Workflow, Shield, Network, Terminal, GitBranch } from "lucide-react";

const Pill = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`inline-block text-xs md:text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border ${className}`}>
    {children}
  </span>
);

const Step = ({
  no,
  title,
  children,
}: {
  no: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border bg-white dark:bg-[#141414] dark:border-gray-800 p-4 md:p-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
        {no}
      </div>
      <h4 className="text-base md:text-lg font-semibold">{title}</h4>
    </div>
    <div className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </div>
  </div>
);

export default function DeploySection() {
  return (
    <div>
      {/* 제목 */}
      <div className="text-center mb-12">
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">
          React(Frontend) + Spring Boot(Backend) 를{" "}
          <b>OCI Ubuntu + Apache</b> 환경에 배포하고,{" "}
          <b>GitHub Actions</b>로 CI/CD를 구성했습니다.
        </p>
      </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Pill>작업 예정</Pill>
          <Pill className="hidden md:inline-flex">
            <GitBranch className="w-3.5 h-3.5 mr-1 inline-block" />
            Dev → Staging → Prod 승격
          </Pill>
        </div>
      {/* 스택/인프라 요약 */}
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border bg-white dark:bg-[#121212] dark:border-gray-800 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Network size={18} />
                <h3 className="font-semibold">Infra</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>OCI Ubuntu</Pill>
                <Pill>Apache (Reverse Proxy + Static)</Pill>
                <Pill>OpenJDK 17</Pill>
                <Pill>MySQL/MariaDB</Pill>
                <Pill>systemd 서비스</Pill>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 mb-3">
                <Workflow size={18} />
                <h3 className="font-semibold">CI/CD</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill>GitHub Actions</Pill>
                <Pill>FE: build → rsync/scp</Pill>
                <Pill>BE: JAR 교체 → daemon-reload → restart</Pill>
                <Pill>Secrets로 .env/.yml 주입</Pill>
              </div>
            </div>
          </div>
        </div>

        {/* 단계별 요약 */}
        <div className="grid gap-6 md:gap-8 mt-10">
          <Step no={1} title="환경 준비 (서버)">
            <ul className="list-disc ml-5 space-y-1">
              <li>Apache 설치 및 <b>React 빌드 산출물</b> 제공(문서 루트: <code>/var/www/html</code>)</li>
              <li>필요 시 <b>ProxyPass</b>로 백엔드(8080→80/443) 리버스 프록시</li>
              <li>Java 17, DB(MySQL/MariaDB) 설치 및 접속 방화벽/보안그룹 설정</li>
            </ul>
          </Step>

          <Step no={2} title="Backend 서비스 운영 (systemd)">
            <ul className="list-disc ml-5 space-y-1">
              <li>JAR 위치: <code>/home/hbs/hbs-be/hsb-bo.jar</code></li>
              <li>프로필: <code>--spring.profiles.active=prod</code></li>
              <li>
                서비스 유닛: <code>/etc/systemd/system/hsb-bo.service</code> →{" "}
                <code>systemctl enable --now hsb-bo</code>
              </li>
              <li>로그/메모리 파라미터는 유닛 파일 또는 실행 옵션에서 관리</li>
            </ul>
          </Step>

          <Step no={3} title="Frontend 정적 배포 (Apache)">
            <ul className="list-disc ml-5 space-y-1">
              <li>React 빌드: <code>npm ci && npm run build</code></li>
              <li>산출물 경로: <code>hsb-fe/build</code> → 서버 <code>/var/www/html/</code> 동기화</li>
              <li><code>.htaccess</code> 또는 Apache 설정으로 SPA 라우팅 처리(History API)</li>
            </ul>
          </Step>

          <Step no={4} title="CI/CD 파이프라인 (Dev → Staging → Prod)">
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <b>트리거 규칙</b>:
                <ul className="list-disc ml-6 space-y-1">
                  <li><code>develop</code> push ⟶ <b>DEV 자동 배포</b> (HSBS_DEV)</li>
                  <li><code>rc-*</code> 태그 ⟶ <b>STAGING 배포</b> (HSBS_STG, 승인 필요)</li>
                  <li><code>deploy-*</code> 태그 ⟶ <b>PROD 배포</b> (HSBS_PROD, 승인 필요)</li>
                </ul>
              </li>
              <li>
                <b>Build once, promote</b>: FE/BE는 한 번 빌드 후 아티팩트 재사용(각 환경에서 동일 산출물 배포)
              </li>
              <li>
                <b>배포 단계</b>: FE(artifact ⟶ <code>/home/hbs/hbs-fe/build</code> ⟶ <code>/var/www/html</code>) /
                BE(JAR 교체 ⟶ <code>systemctl daemon-reload && restart hsb-bo</code>)
              </li>
              <li>
                <b>Environments</b>: 환경별 Secrets(예: <code>SSH_HOST/USER/KEY, SPRING_*, MAIL_*, AWS_*</code>) 분리 저장, STG/PROD는 <b>Required reviewers</b> 활성화
              </li>
            </ul>
          </Step>

          <Step no={5} title="보안/모니터링 기본">
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <Shield className="inline-block mr-1" size={14} />
                방화벽/보안그룹 최소 오픈(80/443/22), 관리자 경로 IP 제한
              </li>
              <li>
                <Server className="inline-block mr-1" size={14} />
                백엔드 헬스체크 엔드포인트/actuator 최소한으로 공개
              </li>
              <li>
                <Terminal className="inline-block mr-1" size={14} />
                <code>journalctl -u hsb-bo -f</code> 로 실시간 로그 확인
              </li>
            </ul>
          </Step>

          <Step no={6} title="Next (작업 예정)">
            <ul className="list-disc ml-5 space-y-1">
              <li>릴리스 태그/노트 자동 생성 및 변경내역 링크</li>
              <li>롤백 태그(<code>rollback-*</code>) 혹은 즉시 이전 아티팩트 재배포</li>
              <li>FE 캐시 최적화(Cache-Control/ETag) 및 BO 메트릭 대시보드</li>
            </ul>
          </Step>

        </div>
      </div>
    </div>
  );
}
