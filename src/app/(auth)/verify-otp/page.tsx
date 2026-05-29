"use client";
import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "you@company.com";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const valid = code.every((c) => c);

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-8">
        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <MailCheck className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-slate-500">
          We sent a 6-digit verification code to <span className="font-medium text-slate-700">{email}</span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push("/dashboard");
        }}
        className="space-y-5"
      >
        <div className="flex gap-2 justify-between">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!valid}>
          Verify and continue
        </Button>

        <p className="text-center text-sm text-slate-500">
          Didn&apos;t receive the code?{" "}
          <button type="button" className="text-blue-600 font-medium hover:underline">
            Resend
          </button>
        </p>
      </form>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
