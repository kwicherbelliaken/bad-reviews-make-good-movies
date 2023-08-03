import { useState } from "react";

// const moveTransitionClassname = `transition hover:translate-y-96 hover:scale-110`;
//! original 'moveTransitionClassname'
// const moveTransitionClassname = `transition transition-[top, right] ease-in-out duration-750`;

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

const StarMenu = () => {
  return (
    <div
      className={`absolute z-10 w-16 right-0 m-8 cursor-pointer group outline transition transition-[right,top] ease-in-out duration-1000 hover:right-1/2`}
    >
      <img
        className="absolute top-0 right-0 left-0 bottom-0 object-contain opacity-0"
        src="/star-rotated.png"
      />
      <img className="duration-500 ease-out" src="/star.png" />
    </div>
  );
};

export default StarMenu;
