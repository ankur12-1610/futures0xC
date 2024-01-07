import React from "react";
import image from "./../../../assets/homepage-img.svg";
import star from "./../../../assets/artifacts/Group 3.svg";

let SectionTwo: React.FC = () => {
  return (
    <>
      <div className="md:flex justify-center items-center py-20 hidden">
        <div className="relative">
          <img src={image} className="w-[1240px]"></img>
          <div className="absolute flex justify-center items-center bottom-0 left-0 w-full">
            <div className="flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full">
              <img src={star} className="h-5"></img>
              <p>Trade Futures in a Non - Custodial Trading Environment</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionTwo;
