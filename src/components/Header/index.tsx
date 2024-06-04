import { SignedIn, SignedOut, UserButton } from "astro-clerk-auth/client/react";

const Header = () => {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>

      <SignedOut>
        <a href="/sign-in">Go to Sign in</a>
      </SignedOut>

      <div className="bg-[#fafafa] h-24 p-4">
        <div className="bg-[#defe56] p-4 font-mono700Regular w-fit outline outline-1 outline-[#11111]">
          bad reviews make good movies
        </div>
      </div>
    </header>
  );
};

export default Header;
