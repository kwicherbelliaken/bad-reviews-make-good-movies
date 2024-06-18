import {
  createClerkClient,
  type ClerkClient,
  type User,
} from "@clerk/clerk-sdk-node";

import { defineMiddleware } from "astro:middleware";

const api = import.meta.env.PUBLIC_API_URL;
const secretKey = import.meta.env.PUBLIC_CLERK_SECRET_KEY;
const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

const protectedPageUrls = ["/watchlist"];

export const onRequest = defineMiddleware(
  async ({ request, redirect }, next) => {
    const url = new URL(request.url);

    //! Restore the concept of protected pages if I want to ensure that only certain users can access certain pages?
    // if (!protectedPageUrls.some((path) => url.pathname.startsWith(path))) {
    //   return next();
    // }

    const client = createClerkClient({ publishableKey, secretKey });

    const { isSignedIn, toAuth } = await client.authenticateRequest(request, {
      publishableKey,
      secretKey,
    });

    if (!isSignedIn && url.pathname !== "/") {
      console.info(
        "User is not currently signed in. Redirecting to landing page."
      );
      return redirect("/");
    }

    const auth = toAuth();

    // This is really shoddy. The rub is that I want to sync my Clerk users' up with entries in the BRMGM database.
    // The Clerk components do not offer callbacks for when a user is created or updated that would allow me to do this.
    //
    // The only other means of doing this is by using web hooks. I am too lazy to get that up and running so I thought,
    // why not make use of the metadata on the Clerk user and create a flag on the Clerk user which indicates that they
    // have been synced with the BRMGM database.
    //
    // This is a bit of a hack but it will work for now. I will need to come back to this and do it properly at some point.
    if (auth && auth.userId) {
      const user = await client.users.getUser(auth.userId);

      if (user) {
        const { publicMetadata: { hasBeenSynced = false } = {} } = user;

        if (hasBeenSynced) {
          console.info("User has been synced already. Skipping.");
        } else {
          await syncClerkUserWithPrivateDatabase({ client, user });
        }
      }
    }

    return next();
  }
);

const syncClerkUserWithPrivateDatabase = async ({
  client,
  user,
}: {
  client: ClerkClient;
  user: User;
}) => {
  console.info(
    "User has not been synced yet. Syncing now. This involves creating a user in the BRMGM database."
  );

  const response = await fetch(`${api}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: user.id,
    }),
  }).catch((error) => {
    console.warn("Error creating user in BRMGM database.", error);
  });

  if (response.ok && response.status === 200) {
    // [ ] provide better TS safety here
    const newUser = await response.json();

    console.info(
      `Setting "hasBeenSynced" flag on user in Clerk database for user ${newUser.username}.`,
      { username: newUser.username }
    );

    const updatedUser = await client.users
      .updateUser(newUser.username, {
        firstName: "Test",
        publicMetadata: {
          ...user.publicMetadata,
          hasBeenSynced: true,
        },
      })
      .catch((error) => {
        console.warn("Error updating user in Clerk database.", error);
      });
  }
};
