import { PropsWithChildren, useEffect } from "react";
import { useTrainingStore } from "@/lib/training-store";
import { useAuth } from "@/providers/auth-provider";

export function TrainingProvider({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const hydrateFromSupabase = useTrainingStore((state) => state.hydrateFromSupabase);
  const resetForSignedOut = useTrainingStore((state) => state.resetForSignedOut);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      resetForSignedOut();
      return;
    }

    void hydrateFromSupabase(user.id, user.email);
  }, [hydrateFromSupabase, loading, resetForSignedOut, user]);

  return children;
}
