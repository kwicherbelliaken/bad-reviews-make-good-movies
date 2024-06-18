import { authStoreAPI } from "../../../../../lib/authStore";

const api = import.meta.env.PUBLIC_API_URL;

export const getSessionUserDetails = async (): Promise<{
  username: string;
  watchlistId: string;
}> => {
  // [ ] get the current clerk user
  let currentUserId;

  const auth = authStoreAPI.get();

  auth.subscribe((clerk) => {
    if (clerk && clerk.user) {
      currentUserId = clerk.user.id;
    }
  });

  const getUserResponse = await fetch(
    `${api}/users/${currentUserId}?resolveWatchlist=true`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const body = await getUserResponse.json();

  if (getUserResponse.status !== 200 || !getUserResponse.ok) {
    throw new Error(body.error);
  }

  // Figure out a better way to have type support for my fetch calls.
  // @ts-ignore
  return body;
};
