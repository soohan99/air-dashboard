"use client";

import { signIn } from "next-auth/react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl">
          🚫
        </div>
        <h1 className="text-2xl font-bold text-gray-800">접근 권한 없음</h1>
        <p className="mt-3 text-sm text-gray-500">
          이 서비스는 허용된 계정만 접근할 수 있습니다.
          <br />
          다른 Google 계정으로 로그인하거나 관리자에게 문의하세요.
        </p>
        <button
          onClick={() => signIn("google")}
          className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          다른 계정으로 로그인
        </button>
      </div>
    </div>
  );
}
