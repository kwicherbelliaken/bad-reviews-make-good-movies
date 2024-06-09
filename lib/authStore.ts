import { atom } from "nanostores";
import { Clerk } from "@clerk/clerk-js";

const clerkPublishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * The principle reponsibility of the store is to keep a reference to the Clerk client.
 * @returns
 */
export const authStore = async () => {
  const store = atom<Clerk | null>(null);
  const clerk = new Clerk(clerkPublishableKey);

  await clerk
    .load()
    .then(() => {
      store.set(clerk);
    })
    .catch((error) =>
      console.warn("An error occurred trying to load the Clerk client", {
        error,
      })
    );

  return {
    get: () => {
      if (store == null) {
        console.warn(
          "Uh oh. The authentication store is not yet instantiated."
        );
      }

      if (!clerk.loaded) {
        console.warn("The Clerk client has not yet loaded.");
      }

      return store;
    },
  };
};

export const authStoreAPI = await authStore();
