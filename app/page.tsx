import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkoutDashboard } from "@/components/workout-dashboard";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return <WorkoutDashboard initialUserEmail={user?.email ?? null} />;
}
