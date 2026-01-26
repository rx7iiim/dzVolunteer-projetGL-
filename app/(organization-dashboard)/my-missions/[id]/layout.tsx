import { ReactNode } from "react";

export default function MissionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      {children}
    </div>
  );
}