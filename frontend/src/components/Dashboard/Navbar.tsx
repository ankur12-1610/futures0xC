import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import logo from "./../../assets/Logo.svg";
import { Link, useLocation } from "react-router-dom";
import { PiVaultBold } from "react-icons/pi";
import { TbTransferVertical } from "react-icons/tb";
import { FaRegChartBar } from "react-icons/fa";

let Navbar: React.FC = () => {
  const location = useLocation();
  const currLocation = location.pathname;
  // console.log(currLocation);

  return (
    <>
      <div className="md:flex justify-between items-center h-16 bg-[#0B1B2D] px-10 hidden">
        <div className="flex items-center justify-center">
          <div className="flex gap-3 justify-center items-center pr-3">
            <Link to="/">
              <img className="h-10" src={logo}></img>
            </Link>
            <div className="h-8 border-l-2 border-[#383C3F]"></div>
          </div>

          <div className="md:flex font-montserrat md:gap-4 lg:gap-10 items-center hidden text-lg font-semibold pr-3">
            <Link
              to="/dashboard/trade/X-APT-24H"
              className={`nav-link ${
                currLocation == "/dashboard/trade/X-APT-24H" ||
                currLocation == "/dashboard/trade/X-APT-48H" ||
                currLocation == "/dashboard/trade/X-APT-72H"
                  ? "active"
                  : ""
              }`}
            >
              Trade
            </Link>
            <Link
              to="/dashboard/portfolio"
              className={`nav-link ${
                currLocation == "/dashboard/portfolio" ? "active" : ""
              }`}
            >
              Portfolio
            </Link>
            {/* <Link
              to="/dashboard/markets"
              className={`nav-link ${
                currLocation == "/dashboard/markets" ? "active" : ""
              }`}
            >
              Markets
            </Link> */}
          </div>
          <div className="h-8 border-l-2 border-[#383C3F]"></div>
        </div>
        <div className="bg-[#1068CE] rounded-lg hover:bg-white">
          <WalletSelector />
        </div>
      </div>

      <div className="md:hidden flex justify-between items-center h-16 w-full bg-[#0B1B2D] px-5">
        <div className="flex items-center h-full w-full justify-between">
          <div className="flex gap-3 justify-center items-center pr-3">
            <a>
              <img className="h-10" src={logo}></img>
            </a>
          </div>
          <div className="flex gap-3 justify-center items-center">
            <div className="h-8 border-l-2 border-[#383C3F]"></div>
            <div className="flex font-montserrat  items-center gap-5 font-semibold px-3">
              <Link
                to="/dashboard/trade"
                className={`nav-link flex flex-col gap-1 justify-center items-center ${
                  currLocation == "/dashboard/trade" ? "active" : ""
                }`}
              >
                <TbTransferVertical size={25} />
                <p className="text-[0.5rem]">Trade</p>
              </Link>
              <Link
                to="/dashboard/portfolio"
                className={`nav-link flex flex-col gap-1 justify-center items-center ${
                  currLocation == "/dashboard/portfolio" ? "active" : ""
                }`}
              >
                <PiVaultBold size={25} />
                <p className="text-[0.5rem]">Portfolio</p>
              </Link>
              {/* <Link
                to="/dashboard/markets"
                className={`nav-link flex flex-col gap-1 justify-center items-center ${
                  currLocation == "/dashboard/markets" ? "active" : ""
                }`}
              >
                <FaRegChartBar size={25} />
                <p className="text-[0.5rem]">Markets</p>
              </Link> */}
            </div>
            <div className="h-8 border-l-2 border-[#383C3F]"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
