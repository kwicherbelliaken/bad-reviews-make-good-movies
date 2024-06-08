// @/lib/clerk.ts
import { Clerk } from "@clerk/clerk-js";
import { auth } from "./authStore";

const clerkPublishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
let clerk: Clerk;

export const initializeClerk = async () => {
  const authNano = auth.get();
  if (authNano) return;

  clerk = new Clerk(clerkPublishableKey);

  auth.set(clerk);

  await clerk.load().catch((error) => console.error(error));
};
