import { useEffect, useState } from "react";

const StarMenuLayout = ({ children }) => {
  return <div className="relative h-[calc(100%-96px)]">{children}</div>;
};

const StarMenu = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleShowAnimation = () => {
    setShowAnimation(!showAnimation);
  };

  // [ ]: refactor this
  useEffect(() => {
    const animationManager = () => {
      const onHoverAnimationDuration = 1000;

      const idsToCheck = [
        "star-animation-static",
        "star-animation",
        "star-animation-touchzone",
        "three-dimensional-star",
        "watchlist-page",
        "watchlist-page-text",
      ];

      let startTime = new Date();

      const shouldResetAnimation = () => {
        const currentTime = new Date();

        const elapsedTime = currentTime.getTime() - startTime.getTime();

        return elapsedTime >= onHoverAnimationDuration;
      };

      const isMouseOffAnimation = (event: MouseEvent) => {
        // [ ] consider the possibility of searching for the id as a child of one of the specified elements
        return !idsToCheck.includes((event.target as HTMLElement).id);
      };

      return {
        resetTimeMouseOffAnimation: () => (startTime = new Date()),
        isMouseOffAnimation,
        shouldResetAnimation,
      };
    };

    const animator = animationManager();

    window.addEventListener("mousemove", (event) => {
      if (animator.isMouseOffAnimation(event)) {
        if (animator.shouldResetAnimation()) {
          setShowAnimation(false);
        }
      } else {
        animator.resetTimeMouseOffAnimation();
      }
    });
  }, []);

  const StarAnimation = (
    <div
      id="star-animation"
      className="absolute right-0 overflow-visible w-full h-full z-10 bg-transparent group"
    >
      <div
        className={`flex flex-col align-middle absolute z-10 w-16 right-0 top-0 m-8 cursor-pointer group transition-[right,top] ease-in-out duration-1000 group-hover:top-1/2 group-hover:right-1/2`}
      >
        <img
          id="two-dimensional-star"
          className="duration-500 ease-out opacity-100 transition-opacity group-hover:opacity-0"
          src="/star.png"
        />
        <img
          id="three-dimensional-star"
          className="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100"
          src="/star-rotated.png"
        />

        <a
          id="watchlist-page"
          href="/watchlist"
          className="pt-6 hover:text-purple-400 hover:font-bold opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100"
          data-astro-reload
        >
          <p id="watchlist-page-text">watchlist</p>
        </a>
      </div>
    </div>
  );

  const StarAnimationStatic = (
    <div
      id="star-animation-static"
      className="absolute right-0 overflow-visible w-full h-full z-10 bg-transparent"
    >
      <div className={`absolute z-10 w-16 right-0 top-0 m-8 cursor-pointer`}>
        <img src="/star.png" />
      </div>
    </div>
  );

  const StarAnimationTouchzone = (
    <>
      <div
        id="star-animation-touchzone"
        className="absolute right-0 overflow-visible w-1/3 h-1/3 z-10"
        onMouseOver={handleShowAnimation}
      />
    </>
  );

  //! NB: the height calculation is based on height of the Header ("96px") and ensures that there is no weird scrolling behaviour.
  //! NB: Use this when testing.
  // return <StarMenuLayout>{StarAnimation}</StarMenuLayout>;

  if (showAnimation) {
    return <StarMenuLayout>{StarAnimation}</StarMenuLayout>;
  }

  return (
    <StarMenuLayout>
      {StarAnimationStatic}
      {StarAnimationTouchzone}
    </StarMenuLayout>
  );
};

export default StarMenu;
