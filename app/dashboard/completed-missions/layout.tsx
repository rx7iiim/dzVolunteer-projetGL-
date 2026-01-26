import { ReactNode } from "react";

export default function CompletedMissionsLayout({
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