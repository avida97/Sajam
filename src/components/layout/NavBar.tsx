import { getCurrentUser } from "@/lib/supabase/server";
import { NavBarClient } from "./NavBarClient";

// Nav bar iz Figme (komponenta „Nav bar“, 449:6095). Korpa je sakrivena do posle MVP-a.
export async function NavBar() {
  const user = await getCurrentUser();
  return (
    <NavBarClient
      user={
        user
          ? {
              avatarUrl: user.profile?.avatar_url ?? null,
              username: user.profile?.username ?? null,
              displayName: user.profile?.display_name ?? user.email ?? "",
              unreadNotifications: user.unreadNotifications,
            }
          : null
      }
    />
  );
}
