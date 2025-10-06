import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import type { Admin } from '../../../types/Admin/Admin';
import AdminLayout from '../../../components/Layout/AdminLayout';

type MeResponse = Admin & {
  roles?: string[];
  // 세션 메타가 있을 수도 있음(백엔드 구현 따라 옵셔널 처리)
  sessionId?: string;
  sessionCreatedAt?: string | Date;
  sessionLastAccessedAt?: string | Date;
  sessionMaxInactiveInterval?: number; // seconds
};

export default function AdminProfile() {
  const { admin: authAdmin } = useAuth();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get<MeResponse>('/admin/me');
        if (!mounted) return;
        setProfile(data);
      } catch (e: any) {
        setErr(typeof e?.response?.data === 'string' ? e.response.data : '내 정보 조회에 실패했어요.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const display = profile ?? (authAdmin as MeResponse | null);

  // --------- helpers ----------
  const initials = useMemo(() => {
    const base = display?.name || display?.id || '?';
    const parts = base.trim().split(/\s+/);
    return (parts[0][0] || '?') + (parts[1]?.[0] || '');
  }, [display]);

  const statusBadge = (status?: Admin['status']) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      LOCKED: 'bg-gray-100 text-gray-700 border-gray-200',
      SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    const label: Record<string, string> = { ACTIVE: '활성', LOCKED: '잠금', SUSPENDED: '정지' };
    const cls = map[status || 'ACTIVE'] || map.ACTIVE;
    return <span className={`px-2 py-0.5 rounded-full text-xs border ${cls}`}>{label[status || 'ACTIVE']}</span>;
  };

  const formatDate = (v?: string | Date) => {
    if (!v) return '-';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return String(v);
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
  };

  const guessDeviceType = (ua?: string) => {
    if (!ua) return 'UNKNOWN';
    const l = ua.toLowerCase();
    if (/(bot|spider|crawl)/.test(l)) return 'BOT';
    if (l.includes('ipad') || l.includes('tablet') || /android(?!.*mobile)/.test(l)) return 'TABLET';
    if (l.includes('iphone') || l.includes('ipod') || l.includes('windows phone') || l.includes('mobi')) return 'PHONE';
    return 'PC';
  };

  const simplifyIp = (ip?: string) => {
    if (!ip) return '-';
    if (ip === '0:0:0:0:0:0:0:1' || ip === '::1') return '127.0.0.1 (로컬)';
    return ip;
  };

  // --------- UI ----------
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="h-28 bg-gray-100 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4 md:p-6">
        <div className="p-4 border border-rose-200 text-rose-700 bg-rose-50 rounded-lg">{err}</div>
      </div>
    );
  }

  if (!display) return null;

  return (
    <div>
      <AdminLayout>
        <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xl font-semibold">
              {initials.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold">{display.name || display.id}</h2>
                {statusBadge(display.status)}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                ID: <span className="font-mono">{display.id}</span>
                {display.groupId != null && <span className="ml-3">그룹: {display.groupId}</span>}
              </div>
              {Array.isArray((display as any).roles) && (display as any).roles!.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(display as any).roles!.map((r: string) => (
                    <span key={r} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold">기본 정보</h3>
              </div>
              <div className="p-5 space-y-3">
                <Row label="이름" value={display.name || '-'} />
                <Row label="이메일" value={
                  display.email ? <a href={`mailto:${display.email}`} className="text-blue-600 hover:underline">{display.email}</a> : '-'
                } />
                <Row label="전화번호" value={
                  display.tel ? <a href={`tel:${display.tel}`} className="hover:underline">{display.tel}</a> : '-'
                } />
                <Row label="메모" value={display.memo || '-'} />
                <Row label="계정 생성" value={formatDate(display.createdAt)} />
                <Row label="마지막 수정" value={formatDate(display.updatedAt)} />
              </div>
            </div>

            {/* 보안 · 접속 정보 */}
            <div className="bg-white rounded-2xl shadow-sm border">
              <div className="px-5 py-4 border-b">
                <h3 className="font-semibold">보안 · 접속 정보</h3>
              </div>
              <div className="p-5 space-y-3">
                <Row label="최근 로그인" value={formatDate(display.loggedAt)} />
                <Row label="최근 로그인 IP" value={simplifyIp(display.lastLoginIp)} />
                <Row label="최근 로그인 기기" value={
                  <>
                    <span className="mr-2 inline-block px-2 py-0.5 text-xs rounded-full border bg-gray-50">
                      {guessDeviceType(display.lastLoginDevice)}
                    </span>
                    <span className="text-gray-500 break-all">{display.lastLoginDevice || '-'}</span>
                  </>
                } />
                <Row label="로그인 실패 횟수" value={display.accessFailCount ?? 0} />
                {display.status === 'LOCKED' && (
                  <div className="text-rose-600 text-sm">계정이 잠금 상태입니다. 관리자에게 문의하세요.</div>
                )}
              </div>
            </div>

            {/* 세션 정보 (있을 때만) */}
            {(display.sessionId || (display as any).sessionCreatedAt) && (
              <div className="bg-white rounded-2xl shadow-sm border md:col-span-2">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold">세션 정보</h3>
                </div>
                <div className="p-5 grid md:grid-cols-3 gap-4">
                  <Row label="세션 ID" mono value={display.sessionId || '-'} />
                  <Row label="생성 시각" value={formatDate((display as any).sessionCreatedAt)} />
                  <Row label="최근 접근" value={formatDate((display as any).sessionLastAccessedAt)} />
                  <Row label="세션 만료(초)" value={(display as any).sessionMaxInactiveInterval ?? '-'} />
                </div>
              </div>
            )}
          </div>
      </div>
      </AdminLayout>
    </div>

  );
}

// 작은 라벨/값 행 컴포넌트
function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start">
      <div className="w-32 shrink-0 text-sm text-gray-500">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
