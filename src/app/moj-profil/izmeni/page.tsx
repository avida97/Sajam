import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Podešavanja profila" };

export default async function EditProfilePage() {
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/moj-profil/izmeni");
  const p = me.profile;
  return (
    <ProfileForm
      initial={{
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        city: p.city,
        bio: p.bio,
        shipsWithinDays: p.ships_within_days,
      }}
      email={me.email}
    />
  );
}
