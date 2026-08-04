import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetPasswordForm } from "@/components/client/ResetPasswordForm";
import { findUserByPasswordResetToken } from "@/lib/auth/users";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params;
  const user = await findUserByPasswordResetToken(token);
  if (!user) notFound();

  return (
    <>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,10vw,4.5rem)] italic leading-[0.95] text-ink">
        Choose a new password.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Resetting password for {user.email}.
      </p>
      <ResetPasswordForm token={token} />
    </>
  );
}
