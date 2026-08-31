"use client";

import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page-flex">
      <Suspense fallback={<div className="auth-card" style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
