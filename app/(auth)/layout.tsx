import type React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#58CC02]/10 via-background to-[#3C4DFF]/10 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
