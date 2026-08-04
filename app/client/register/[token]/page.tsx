import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegisterForm } from "@/components/client/RegisterForm";
import { findUserByInviteToken, getUserOrganisations } from "@/lib/auth/users";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Complete registration",
  robots: { index: false, follow: false },
};

export default async function RegisterInvitePage({ params }: Props) {
  const { token } = await params;
  const user = await findUserByInviteToken(token);
  if (!user) notFound();

  const orgs = await getUserOrganisations(user.id);
  const organisation = orgs[0];
  if (!organisation) notFound();

  return (
    <>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,10vw,4.5rem)] italic leading-[0.95] text-ink">
        Finish your account.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Set your password and confirm the organisation. Next you&apos;ll add
        billing details on your profile before the dashboard unlocks.
      </p>
      <RegisterForm
        token={token}
        email={user.email}
        organisationName={organisation.name}
      />
    </>
  );
}
