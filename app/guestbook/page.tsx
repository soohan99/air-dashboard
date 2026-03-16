"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry {
  id: number;
  author_email: string;
  author_name: string;
  content: string;
  my_service_url: string;
  created_at: string;
}

export default function GuestbookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");
  const [serviceUrl, setServiceUrl] = useState("https://airdashboard.vercel.app");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchEntries();
  }, [status]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/guestbook");
      const data = await res.json();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, my_service_url: serviceUrl }),
      });
      if (res.ok) {
        setContent("");
        fetchEntries();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/guestbook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEntries();
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📖</div>
          <p className="text-gray-500 text-sm">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← 대시보드</Link>
            <span className="text-gray-300">|</span>
            <span className="text-lg font-bold text-gray-800">📖 방명록</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* 글쓰기 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">✏️ 방명록 작성</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">방문 피드백 및 소감 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="방문한 사이트에 대한 피드백과 본인 서비스 소개를 작성해주세요."
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">본인 서비스 URL</label>
              <input
                type="url"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {submitting ? "등록 중..." : "방명록 남기기"}
            </button>
          </form>
        </div>

        {/* 방명록 목록 */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500">
            총 {entries.length}개의 방명록
          </h2>
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
              아직 방명록이 없습니다. 첫 번째로 남겨보세요!
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-gray-800">{entry.author_name}</span>
                      <span className="text-xs text-gray-400">{entry.author_email}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                    {entry.my_service_url && (
                      <a
                        href={entry.my_service_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-blue-500 hover:underline"
                      >
                        🔗 {entry.my_service_url}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString("ko-KR")}
                    </span>
                    {session?.user?.email === entry.author_email && (
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="mt-10 py-6 text-center text-xs text-gray-400">
        전국 대기질 대시보드 · 방명록
      </footer>
    </div>
  );
}
