import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

// /moj-profil vodi na sopstveni javni profil, a neprijavljenog na prijavu.
export default async function MyProfile() {
  const me = await getCurrentUser();
  if (!me?.profile) redirect("/?nalog=prijava&posle=/moj-profil");
  redirect(`/prodavac/${me.profile.username}`);
}
