import React from "react";
import image from "./../../../assets/bg-2.svg";
import star from "./../../../assets/artifacts/Group 3.svg";

const SectionFour: React.FC = () => {
  return (
    <>
      <div className="flex justify-center items-center">
        <img src={image}></img>
      </div>
      <div className="md:hidden p-4">
        <div className="flex justify-center items-center">
          <div className="flex justify-center items-center gap-2 text-[0.75rem] bg-gray-900 text-white px-4 py-3 rounded-full">
            <img src={star} className=""></img>
            <p>Trade Futures in a Non - Custodial Trading Environment</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionFour;
