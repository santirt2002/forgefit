import { Redirect, Stack } from "expo-router";
import { AppLoader } from "@/components/ui/app-loader";
import { useAuth } from "@/providers/auth-provider";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
