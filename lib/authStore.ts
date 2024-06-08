// @/lib/authStore.ts
import { atom } from "nanostores";
import type { Clerk } from "@clerk/clerk-js";

export const auth = atom<Clerk | null>(null);
