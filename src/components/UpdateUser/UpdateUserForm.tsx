type UpdateUserFormProps = {
  username: string;
  wishlist: Array<string>;
};

export const UpdateUserForm = ({ username, wishlist }: UpdateUserFormProps) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    const response = await fetch("/api/update-user", {
      method: "POST",
      body: formData,
    });

    // [ ]: determine what we want to do with the response

    const data = await response.json();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username
        <input
          type="text"
          id="username"
          name="username"
          required
          placeholder={username}
        />
      </label>

      {wishlist != null && wishlist.length > 0 && (
        <label>
          Wishlist
          <textarea
            id="wishlist"
            name="wishlist"
            required
            placeholder={wishlist.join(", ")}
          ></textarea>
        </label>
      )}
      <button type="submit">Send</button>
    </form>
  );
};
