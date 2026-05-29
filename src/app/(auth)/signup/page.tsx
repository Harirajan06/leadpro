"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const passOk = form.password.length >= 8;
  const valid = form.fullName && form.email.includes("@") && passOk;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
        <p className="text-slate-500">Start nurturing leads with AI in minutes.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
          <Input
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Anuradha Ramachandran"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

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
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
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

        <div className="bg-slate-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-slate-700 mb-1.5">Your password must contain:</p>
          <ul className="space-y-1">
            <li className={`flex items-center gap-2 ${passOk ? "text-emerald-600" : "text-slate-500"}`}>
              <Check className="h-3.5 w-3.5" /> At least 8 characters
            </li>
          </ul>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={!valid}>
          Continue
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
