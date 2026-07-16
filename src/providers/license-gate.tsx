import { ReactNode } from "react";

interface LicenseGateProps {
  children: ReactNode;
}

export function LicenseGate({ children }: LicenseGateProps) {
  return <>{children}</>;
}
