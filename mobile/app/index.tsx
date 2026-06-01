import { Redirect } from "expo-router";
import { AppLoader } from "@/components/ui/app-loader";
import { useAuth } from "@/providers/auth-provider";

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  return <Redirect href={user ? "/(app)/(tabs)/home" : "/(auth)"} />;
}
