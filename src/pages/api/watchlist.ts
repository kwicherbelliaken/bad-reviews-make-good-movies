export async function post({ request }: { request: Request }) {
  const data = await request.formData();

  const username = data.get("username");
  const wishlist = data.get("wishlist");

  if (username == null || wishlist == null) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      { status: 400 }
    );
  }

  const response = await fetch(
    "https://eaoql5a9ab.execute-api.ap-southeast-2.amazonaws.com/users/2aff71b0-3ee9-11ee-bdeb-7797f77643a3",
    {
      method: "PUT",
      body: JSON.stringify({
        username,
        wishlist: [wishlist],
      }),
    }
  );

  // [ ]: we should really return the currently updated item

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
}
