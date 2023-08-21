
//! I think this can be an Astro component: https://docs.astro.build/en/core-concepts/astro-components/
//? how am I going to represent the "wishlist"?
//? where am I going to import this

const UpdateUserForm = () => {
  return (
    <form>
      <label>
        Name
        <input type="text" id="username" name="username" required />
      </label>

      <label>
        Message
        <textarea id="message" name="message" required />
      </label>
      <button>Send</button>
    </form>
  );
};

export default UpdateUserForm;
