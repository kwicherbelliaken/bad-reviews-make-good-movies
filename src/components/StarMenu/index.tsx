// const moveTransitionClassname = `transition hover:translate-y-96 hover:scale-110`;
//! original 'moveTransitionClassname'
// const moveTransitionClassname = `transition transition-[top, right] ease-in-out duration-750`;

import { SyntheticEvent, useEffect, useRef, useState } from "react";

//  translate-x-1/2 translate-y-1/2
const moveTransitionClassname = `right-1/2`;

//? figure a way to translate the star to the middle of the page

// element.style {
//   transition: right 1s linear;
//   right: 50%;
//   transform: translate(50%, 50%);
// }

//? I need to set the transition property on both "right" and "top"

//! This "StarMenu" has all the group:hover animations
// const StarMenu = () => {
//   return (
//     <div
//       class={`${moveTransitionClassname} absolute z-10 w-16 right-0 m-8 hover:last:opacity-100 hover:first:opacity-0 cursor-pointer group outline`}
//     >
//       <image
//         class="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0 group-hover:opacity-100 group-hover:transition-opacity duration-1000 ease-out"
//         src="/star-rotated.png"
//       />
//       <image
//         class="group-hover:opacity-0 duration-500 ease-out"
//         src="/star.png"
//       />
//     </div>
//   );
// };

const RenderComponent = ({ children }: React.PropsWithChildren<{}>) => (
  <>{children}</>
);

RenderComponent.WithStarComponent = () => (
  <div className="absolute right-0 overflow-visible w-full h-full z-10 bg-transparent group">
    <div
      className={`absolute z-10 w-16 right-0 top-0 m-8 cursor-pointer group outline transition-[right,top] ease-in-out duration-1000 group-hover:top-1/2 group-hover:right-1/2 translate-y-1/2 translate-x-1/2`}
    >
      <img
        className="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100 group-hover:scale-[8.5] delay-200"
        src="/star-rotated.png"
      />
      <img
        className="duration-500 ease-out opacity-100 transition-opacity group-hover:opacity-0"
        src="/star.png"
      />
    </div>
  </div>
);

const StarAnimation = ({
  handleSetShowAnimation,
}: {
  handleSetShowAnimation: () => void;
}) => (
  <div
    className="absolute right-0 overflow-visible w-full h-full z-10 bg-transparent group"
    onMouseLeave={handleSetShowAnimation}
  >
    <div
      className={`absolute z-10 w-16 right-0 top-0 m-8 cursor-pointer group outline transition-[right,top] ease-in-out duration-1000 group-hover:top-1/2 group-hover:right-1/2 translate-y-1/2 translate-x-1/2`}
    >
      <img
        className="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100"
        src="/star-rotated.png"
      />
      <img
        className="duration-500 ease-out opacity-100 transition-opacity group-hover:opacity-0"
        src="/star.png"
      />
    </div>
  </div>
);

const StarMenu = () => {
  console.log("StarMenu rendered");

  const [showAnimation, setShowAnimation] = useState(false);

  const handleShowAnimation = () => {
    setShowAnimation(!showAnimation);
  };

  // [ ]: refactor this
  useEffect(() => {
    const timeRegister = () => {
      let startTime = new Date();

      const getElapsedTime = () => {
        const currentTime = new Date();

        const elapsedTime = currentTime.getTime() - startTime.getTime();

        return elapsedTime;
      };

      return {
        flushStartTime: () => (startTime = new Date()),
        getElapsedTime,
      };
    };

    const idsToCheck = [
      "star-animation-static",
      "star-animation",
      "star-animation-touchzone",
    ];

    const timer = timeRegister();

    window.addEventListener("mousemove", (event) => {
      if (!idsToCheck.includes((event.target as HTMLElement).id)) {
        if (timer.getElapsedTime() > 1000) {
          setShowAnimation(false);
        }
      } else {
        timer.flushStartTime();
      }
    });
  }, []);

  const StarAnimation = (
    <div
      id="star-animation"
      className="absolute right-0 overflow-visible w-full h-full z-10 bg-transparent group"
    >
      <div
        className={`absolute z-10 w-16 right-0 top-0 m-8 cursor-pointer group transition-[right,top] ease-in-out duration-1000 group-hover:top-1/2 group-hover:right-1/2`}
      >
        <img
          className="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0 transition-opacity duration-1000 ease-out group-hover:opacity-100"
          src="/star-rotated.png"
        />
        <img
          className="duration-500 ease-out opacity-100 transition-opacity group-hover:opacity-0"
          src="/star.png"
        />
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

  if (showAnimation) {
    return <>{StarAnimation}</>;
  }

  return (
    <>
      {StarAnimationStatic}
      {StarAnimationTouchzone}
    </>
  );
};

export default StarMenu;
