"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="auth-page-flex">
      <Suspense fallback={<div className="auth-card" style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
