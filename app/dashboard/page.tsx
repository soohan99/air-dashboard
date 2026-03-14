"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getGradeColor, getGradeLabel, getGradeBg } from "@/lib/airquality";

interface SidoSummary {
  sido: string;
  pm10Avg: number;
  pm25Avg: number;
  pm10Grade: string;
  pm25Grade: string;
}

interface StationData {
  stationName: string;
  pm10Value: string;
  pm25Value: string;
  o3Value: string;
  no2Value: string;
  coValue: string;
  so2Value: string;
  pm10Grade: string;
  pm25Grade: string;
  dataTime: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<SidoSummary[]>([]);
  const [selectedSido, setSelectedSido] = useState<string | null>(null);
  const [stationData, setStationData] = useState<StationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stationLoading, setStationLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSummary();
    }
  }, [status]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch("/api/airquality");
      const data = await res.json();
      setSummaryData(data);
      setUpdatedAt(new Date().toLocaleTimeString("ko-KR"));
    } finally {
      setLoading(false);
    }
  }

  async function fetchStation(sido: string) {
    setSelectedSido(sido);
    setStationLoading(true);
    try {
      const res = await fetch(`/api/airquality?sido=${encodeURIComponent(sido)}`);
      const data = await res.json();
      setStationData(data);
    } finally {
      setStationLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌤️</div>
          <p className="text-gray-500 text-sm">대기질 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌤️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800">전국 대기질 대시보드</h1>
              <p className="text-xs text-gray-400">한국환경공단 에어코리아 · 업데이트: {updatedAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{session?.user?.email}</span>
            <button
              onClick={fetchSummary}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              🔄 새로고침
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* 등급 범례 */}
        <div className="flex flex-wrap gap-3 text-xs">
          {[["1","좋음","bg-blue-100 text-blue-700"],["2","보통","bg-green-100 text-green-700"],["3","나쁨","bg-yellow-100 text-yellow-700"],["4","매우나쁨","bg-red-100 text-red-700"]].map(([g,l,c]) => (
            <span key={g} className={`rounded-full px-3 py-1 font-medium ${c}`}>{l}</span>
          ))}
        </div>

        {/* 시도별 카드 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">📍 시도별 대기질 현황 (클릭하면 상세 보기)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {summaryData.map((item) => (
              <button
                key={item.sido}
                onClick={() => fetchStation(item.sido)}
                className={`rounded-xl border-2 p-3 text-left transition hover:shadow-md ${
                  selectedSido === item.sido ? "border-blue-400 shadow-md" : "border-gray-100 bg-white"
                }`}
              >
                <p className="font-semibold text-gray-800 text-sm">{item.sido}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">PM10</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${getGradeColor(item.pm10Grade)}`}>
                      {item.pm10Avg}㎍
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">PM2.5</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${getGradeColor(item.pm25Grade)}`}>
                      {item.pm25Avg}㎍
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 차트 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">📊 시도별 PM10 평균 농도 (㎍/㎥)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summaryData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sido" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} ㎍/㎥`, "PM10"]} />
                <Bar dataKey="pm10Avg" name="PM10" radius={[4, 4, 0, 0]}
                  fill="#3B82F6"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">📊 시도별 PM2.5 평균 농도 (㎍/㎥)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summaryData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="sido" tick={{ fontSize: 11 }} angle={-40} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} ㎍/㎥`, "PM2.5"]} />
                <Bar dataKey="pm25Avg" name="PM2.5" radius={[4, 4, 0, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 측정소 상�� */}
        {selectedSido && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              📋 {selectedSido} 측정소별 상세 현황
            </h2>
            {stationLoading ? (
              <p className="text-sm text-gray-400 text-center py-8">불러오는 중...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-gray-500">
                      <th className="pb-2 text-left font-medium">측정소</th>
                      <th className="pb-2 text-center font-medium">PM10</th>
                      <th className="pb-2 text-center font-medium">PM2.5</th>
                      <th className="pb-2 text-center font-medium">O₃</th>
                      <th className="pb-2 text-center font-medium">NO₂</th>
                      <th className="pb-2 text-center font-medium">CO</th>
                      <th className="pb-2 text-left font-medium text-gray-400">측정시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stationData.map((s, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800">{s.stationName}</td>
                        <td className="py-2 text-center">
                          <span className={`rounded px-2 py-0.5 text-xs font-medium border ${getGradeColor(s.pm10Grade)}`}>
                            {s.pm10Value} ({getGradeLabel(s.pm10Grade)})
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`rounded px-2 py-0.5 text-xs font-medium border ${getGradeColor(s.pm25Grade)}`}>
                            {s.pm25Value} ({getGradeLabel(s.pm25Grade)})
                          </span>
                        </td>
                        <td className="py-2 text-center text-xs text-gray-600">{s.o3Value}</td>
                        <td className="py-2 text-center text-xs text-gray-600">{s.no2Value}</td>
                        <td className="py-2 text-center text-xs text-gray-600">{s.coValue}</td>
                        <td className="py-2 text-xs text-gray-400">{s.dataTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-400">
        데이터 출처: 한국환경공단 에어코리아 (data.go.kr)
      </footer>
    </div>
  );
}
