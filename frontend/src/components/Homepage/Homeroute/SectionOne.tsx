import React from "react";
import fire from "./../../../assets/artifacts/62e275df6d0fc5b329129b81_fire.svg.svg";
import gift from "./../../../assets/artifacts/63011d2ad7739c0ae2d6a345_gift.svg.svg";
import corner from "./../../../assets/artifacts/63011f1a01baa4acd99a562a_corner.svg.svg";
import line from "./../../../assets/artifacts/63011f1ba65dd9532c03e563_line.svg.svg";
import reload from "./../../../assets/artifacts/Frame 7.svg";
import phone from "./../../../assets/Pnone 1.svg";
import { Link } from "react-router-dom";

let SectionOne: React.FC = () => {
  return (
    <>
      <div className="md:flex justify-center items-center font-inter py-7 hidden">
        <div className="w-[1240px] flex flex-col gap-7 justify-between items-center">
          <div className="font-bold text-center animate-text text-transparent text-[60px] bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-slate-800">
            Decentralized Futures Trading Redefined for Investors.
          </div>
          <div className="flex justify-center items-center gap-5 text-white">
            <div className="flex justify-center items-center gap-1">
              <img src={line} className="h-6"></img>
              <p>Fast Trading</p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <img src={corner} className="h-6"></img>
              <p>Secure & Reliable</p>
            </div>
            <div className="flex justify-center items-center gap-1">
              <img src={reload} className="h-6"></img>
              <p>Continuous Market Updates</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-5 text-white">
            <Link to="/dashboard/trade/X-APT-24H">
              <button className="bg-[#1068CE] px-4 py-3 rounded-full">
                <div className="flex justify-center items-center gap-1">
                  <img src={fire} className="h-6"></img>
                  <p>Start Trading</p>
                </div>
              </button>
            </Link>
            {/* <button className="bg-[#FFFFFF] px-4 py-3 rounded-full bg-opacity-[4%] drop-shadow-lg shadow-inner">
              <div className="flex justify-center items-center gap-1">
                <img src={gift} className="h-6"></img>
                <p>Connect Wallet</p>
              </div>
            </button> */}
          </div>
        </div>
      </div>

      <div className="md:hidden flex flex-col items-center justify-center gap-20 min-h-[90vh] py-20">
        <div className="font-bold animate-text text-transparent text-[2rem] text-center bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-slate-800 p-4">
          Decentralized Futures Trading Redefined for Investors.
        </div>
        <div className="flex justify-center items-center gap-5 py-5">
          <div className="flex flex-col justify-center items-center gap-10">
            <div className="flex flex-col justify-center items-center gap-5 text-white">
              <Link to="/dashboard/trade/X-APT-24H">
                <button className="bg-[#1068CE] px-4 py-3 rounded-full">
                  <div className="flex justify-center items-center gap-1">
                    <img src={fire} className="h-6"></img>
                    <p>Start Trading</p>
                  </div>
                </button>
              </Link>
              {/* <button className="bg-[#FFFFFF] px-4 py-3 rounded-full bg-opacity-[6%] shadow-inner">
                <div className="flex justify-center items-center gap-1">
                  <img src={gift} className="h-6"></img>
                  <p>Connect Wallet</p>
                </div>
              </button> */}
            </div>
            <div className="flex flex-col justify-center items-start gap-3 text-white text-sm">
              <div className="flex justify-center items-center gap-1">
                <img src={line} className="h-6"></img>
                <p>Fast Trading</p>
              </div>
              <div className="flex justify-center items-center gap-1">
                <img src={corner} className="h-6"></img>
                <p>Secure & Reliable</p>
              </div>
              <div className="flex justify-center items-center gap-1">
                <img src={reload} className="h-6"></img>
                <p>Continuous Updates</p>
              </div>
            </div>
          </div>
          <div>
            <img src={phone} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionOne;
