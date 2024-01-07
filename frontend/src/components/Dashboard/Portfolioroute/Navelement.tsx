import React, { useState } from "react";

interface NavProp {
  nav: boolean;
  setNav: React.Dispatch<React.SetStateAction<Number>>;
}

const Navelement: React.FC<NavProp> = ({ nav, setNav: _setNav }) => {
  return (
    <>
      <div className="md:flex justify-center items-start py-10 hidden gradient h-full md:w-[20%] lg:w-[17%]">
        <ul className="flex flex-col justify-center items-end gap-3 text-[#EAF0F6] font-montserrat w-full">
          <li
            className={`w-[80%] px-4 py-1 rounded-md md:rounded-l-md hover:bg-[#061323] ${
              nav === 1 ? "bg-[#FFFFFF] bg-opacity-[7%] shadow-slate-500" : ""
            }`}
            onClick={() => {
              _setNav(1);
            }}
          >
            Orders
          </li>
          <li
            className={`w-[80%] px-4 py-1 rounded-md md:rounded-l-md hover:bg-[#061323] ${
              nav === 2 ? "bg-[#FFFFFF] bg-opacity-[7%] shadow-slate-500" : ""
            }`}
            onClick={() => {
              _setNav(2);
            }}
          >
            Positions
          </li>
        </ul>
      </div>

     
    </>
  );
};

export default Navelement;
