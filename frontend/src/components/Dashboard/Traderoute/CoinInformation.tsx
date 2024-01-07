import React from "react";
import logo from "../../../assets/logo-white.svg";
import { useEffect, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";
import { MdArrowDropUp } from "react-icons/md";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useLocation } from "react-router-dom";

interface Data {
  value: number;
  time: number;
}

const CoinInformation = ({
  assetLtp,
  futuresLtp,
}: {
  assetLtp: Data;
  futuresLtp: Data;
}) => {
  const location = useLocation();
  const currLocation = location.pathname;
  const [prev, setPrev] = useState(0);
  const [color, setColor] = useState(0);
  const [option, setOption] = useState(
    currLocation === "/dashboard/trade/X-APT-24H"
      ? "X/Apt 24H"
      : currLocation === "/dashboard/trade/X-APT-48H"
      ? "X/Apt 48H"
      : "X/Apt 72H"
  );

  const colors = ["white", "red", "green"];

  const symbols = [
    "",
    <MdArrowDropDown className="text-red-500" />,
    <MdArrowDropUp className="text-green-500" />,
  ];

  useEffect(() => {
    if (assetLtp?.value > prev) setColor(2);
    else if (assetLtp?.value < prev) setColor(1);
    else setColor(0);
    setPrev(assetLtp?.value);
  }, [assetLtp]);

  return (
    <>
      <div className="md:flex hidden flex-row px-8 justify-between items-center h-full w-full border-[0.5px] border-[#383C3F]">
        <div className="flex gap-12 justify-start item-center w-full h-full">
          <div className="flex flex-row justify-start item-center basis-1/6 items-center">
            <div className="flex justify-center items-center basis-1/8 h-full lg:p-2">
              <img className="h-[70%]" src={logo}></img>
            </div>
            <div className="px-2 font-bold basis-1/8">{option}</div>
          </div>
          <div className="flex flex-col justify-center item-center basis-1/6 text-left">
            <div className="flex">
              <div className="w-4">{symbols[color]}</div>
              <div>
                <div
                  className={`font-bold basis-1/8 text-${colors[color]}-500`}
                >
                  {assetLtp?.value}
                </div>
                <div className="basis-1/8">Asset Price</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center item-center basis-1/6 text-left">
            <div className="flex">
              <div className="w-4">{symbols[color]}</div>
              <div>
                <div
                  className={`font-bold  basis-1/8 text-${colors[color]}-500`}
                >
                  {futuresLtp?.value}
                </div>
                <div className="basis-1/8">Futures Price</div>
              </div>
            </div>
          </div>
        </div>
        <Dropdown option={option} setOption={setOption}></Dropdown>
      </div>

      <div className="flex md:hidden justify-between item-center w-full h-full p-4">
        <div className="flex flex-row justify-start item-center basis-1/6 items-center">
          <div className="flex flex-row justify-start item-center basis-1/6 items-center">
            <div className="basis-1/8 h-full p-2">
              <img className="h-10" src={logo}></img>
            </div>
            <div className="px-2 font-bold basis-1/8">X/APT</div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <div className="flex flex-col justify-center item-center basis-1/6 text-left">
            <div className="flex">
              <div className="w-4">{symbols[color]}</div>
              <div>
                <div
                  className={`font-bold  basis-1/8 text-xs md:text-base text-${colors[color]}-500`}
                >
                  {assetLtp?.value}
                </div>
                <div className="basis-1/8 text-xs md:text-base">
                  Asset Price
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center item-center basis-1/6 text-left">
            <div className="flex">
              <div className="w-4">{symbols[color]}</div>
              <div>
                <div
                  className={`font-bold  basis-1/8 text-xs md:text-base text-${colors[color]}-500`}
                >
                  {futuresLtp?.value}
                </div>
                <div className="basis-1/8 text-xs md:text-base">
                  Futures Price
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center">
          <WalletSelector></WalletSelector>
          <Dropdown option={option} setOption={setOption}></Dropdown>
        </div>
      </div>
    </>
  );
};

export default CoinInformation;

interface OrderWindowProps {
  option: string;
  setOption: React.Dispatch<React.SetStateAction<string>>;
}

const Dropdown: React.FC<OrderWindowProps> = ({
  option,
  setOption: _setOption,
}) => {
  const location = useLocation();
  const currLocation = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    currLocation === "/dashboard/trade/X-APT-24H"
      ? "X/Apt 24H"
      : currLocation === "/dashboard/trade/X-APT-48H"
      ? "X/Apt 48H"
      : "X/Apt 72H"
  );

  const options = ["X/Apt 24H", "X/Apt 48H", "X/Apt 72H"];

  const handleSelect = (option) => {
    _setOption(option);
    // window.location.reload();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left md:min-w-[200px]">
      <div>
        <span className="rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex justify-center w-full rounded-md bg-white bg-opacity-[8%] px-4 py-2 text-sm font-medium text-grey-300 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            {selectedOption || "Select an option"}
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 12a1 1 0 0 1-.707-.293l-4-4a1 1 0 0 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4A1 1 0 0 1 10 12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {options.map((option, i) => (
            <a
              href={`/dashboard/trade/X-APT-${
                i == 0 ? "24H" : i == 1 ? "48H" : "72H"
              }`}
            >
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className="block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 focus:bg-gray-100"
                role="menuitem"
              >               
                  {option}
              </button>
            </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
