import { clerkClient, createClerkClient } from "@clerk/clerk-sdk-node";

const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = import.meta.env.CLERK_SECRET_KEY;

const protectedPageUrls = ["/dashboard"];

export async function onRequest({ request, redirect }, next) {
  const url = new URL(request.url);
  if (!protectedPageUrls.some((path) => url.pathname.startsWith(path))) {
    return next();
  }

  // console.log("starting");

  // const client = createClerkClient({ publishableKey, secretKey });

  // const { isSignedIn } = await client.authenticateRequest({
  //   request,
  //   publishableKey,
  //   secretKey,
  // });

  // console.log("I got here");

  // if (!isSignedIn) {
  //   return redirect("/");
  // }

  return next();
}
