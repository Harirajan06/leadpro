import { Logo } from "@/components/brand/logo";
import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <Logo className="[&_span:first-child]:text-white [&_span:last-child]:text-blue-200" />
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              AI-Powered Lead Nurturing<br />
              <span className="text-blue-300">at enterprise scale</span>
            </h2>
            <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
              Capture, score, segment, and engage leads with AI-personalized campaigns and visual automation workflows.
            </p>
          </div>

          <div className="space-y-3 max-w-md">
            {[
              "AI-driven prospect scoring & company intelligence",
              "Visual drag-and-drop workflow automation",
              "Multi-channel campaigns with AI message generation",
              "Real-time analytics and conversion funnels",
            ].map((line) => (
              <div key={line} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                <span className="text-blue-50/90">{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-blue-200/60">
          © 2026 LeadPro. All rights reserved.
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
