import { AuthLayout } from "@/components/auth/AuthLayout";
import { VerifyEmailPanel } from "@/components/auth/VerifyEmailPanel";

export function VerifyEmail() {
  return (
    <AuthLayout>
      <VerifyEmailPanel />
    </AuthLayout>
  );
}
