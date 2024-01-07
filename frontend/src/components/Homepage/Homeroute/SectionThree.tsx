import React from "react";
import image from "./../../../assets/Group 48097465.svg";

const SectionThree: React.FC = () => {
  return (
    <>
      <div className="md:flex justify-center items-center hidden">
        <div className="flex justify-center items-center gap-10 py-10">
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-5xl font-semibold">45M+</h1>
            <p className="text-[#FFFFFF] text-opacity-[70%]">User Worldwide</p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-5xl font-semibold">120</h1>
            <p className="text-[#FFFFFF] text-opacity-[70%]">
              Counter Supported
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-5xl font-semibold">73M+</h1>
            <p className="text-[#FFFFFF] text-opacity-[70%]">
              Crypto Transaction
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-5xl font-semibold">$470B</h1>
            <p className="text-[#FFFFFF] text-opacity-[70%]">
              Assets on Platform
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden flex flex-row-reverse justify-center items-center px-3 py-20">
        <div className="flex justify-end items-center md:hidden">
          <img src={image} className="w-screen"></img>
        </div>
        <div className="flex flex-col justify-center items-center w-[30%] text-center gap-4">
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-xl font-semibold">45M+</h1>
            <p className="text-[#FFFFFF] text-[0.75rem] text-opacity-[70%]">
              User Worldwide
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-xl font-semibold">120</h1>
            <p className="text-[#FFFFFF] text-[0.75rem] text-opacity-[70%]">
              Counter Supported
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-xl font-semibold">73M+</h1>
            <p className="text-[#FFFFFF] text-[0.75rem] text-opacity-[70%]">
              Crypto Transaction
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <h1 className="text-white text-xl font-semibold">$470B</h1>
            <p className="text-[#FFFFFF] text-[0.75rem] text-opacity-[70%]">
              Assets on Platform
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionThree;
