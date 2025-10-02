export interface Admin {
    id: string;                 /** 관리자 아이디 (Primary Key) */
    groupId?: number;           /** 그룹 식별 번호 (옵션) */
    email?: string;             /** 관리자 이메일 (옵션) */
    name?: string;              /** 관리자 이름 (옵션) */
    password?: string;          /** 암호화된 비밀번호 (옵션) */
    createdAt?: string;         /** 계정 생성 일시 (예: ISO 형식의 문자열) */
    updatedAt?: string;         /** 마지막 수정 일시 (예: ISO 형식의 문자열) */
    tel?: string;               /** 전화번호 (옵션) */
    memo?: string;              /** 관리자 메모 (옵션) */
    passwordLength?: number;    /** 비밀번호 길이 (옵션) */
    accessFailCount?: number;   /** 로그인 실패 횟수 (기본: 0) */
    isDeleted?: boolean;        /** 삭제 여부 (0: false, 1: true 등으로 처리할 수 있음) */
    loggedAt?: string;          //마지막 로그인 일시 (옵션)
    passwordUpdatedAt?: string; /** 마지막 비밀번호 변경 일시 (옵션) */

    lastLoginIp?: string;        /** 마지막 로그인 IP (IPv4/IPv6) */
    lastLoginDevice?: string;    /** 마지막 로그인 기기(User-Agent) */
    lastLoginLocation?: string;  /** 마지막 로그인 위치 (선택, GeoIP 기반) */

    status?: 'ACTIVE' | 'LOCKED' | 'SUSPENDED'; /** 계정 상태 */

    createdBy?: string;          /** 계정을 생성한 관리자 ID */
    updatedBy?: string;          /** 마지막으로 수정한 관리자 ID */
    deletedAt?: string;          /** 삭제 처리된 일시 (soft delete 시 기록) */
  }


  