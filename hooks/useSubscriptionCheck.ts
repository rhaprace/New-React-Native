import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "@/convex/_generated/api";

export const useSubscriptionCheck = () => {
  const { user } = useUser();

  // Get user subscription status
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Check if user has access
  const hasAccess =
    userData?.subscription === "active" ||
    userData?.subscription === "free_trial";

  return {
    isLoading: !userData,
    hasAccess,
    userData,
  };
};
