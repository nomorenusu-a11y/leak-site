import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-(--container-content) px-3 sm:px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  );
}
