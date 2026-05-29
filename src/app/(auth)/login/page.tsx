"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const valid = form.email.includes("@") && form.password.length >= 6;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-slate-500">Log in to your LeadPro workspace.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <Input
            type="email"
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Link href="#" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            type={showPass ? "text" : "password"}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-slate-700">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          Remember me for 30 days
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={!valid}>
          Continue
        </Button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
