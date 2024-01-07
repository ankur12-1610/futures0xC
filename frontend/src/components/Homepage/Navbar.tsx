import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import logo from "./../../assets/Icon.svg";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Menu from "./../../assets/Menu.svg";
import CloseMenu from "./../../assets/ClodeMenu.svg";

let Navbar: React.FC = () => {
  const location = useLocation();
  const currLocation = location.pathname;

  const [nav, setNav] = useState(false);

  return (
    <>
      <div className="md:flex items-center justify-between px-8 py-3 hidden">
        <div>
          <a href="/">
            <img src={logo}></img>
          </a>
        </div>

        <div className="md:flex font-montserrat md:gap-4 lg:gap-10 items-center hidden text-lg font-semibold">
          <Link
            to="/"
            className={`nav-link ${currLocation == "/" ? "active" : ""}`}
          >
            Home
          </Link>
          {/* <Link
            to="/about"
            className={`nav-link ${currLocation == "/about" ? "active" : ""}`}
          >
            About
          </Link> */}
          <Link
            to="https://github.com/t-Team-18/futures0xC/blob/main/README.md"
            className={`nav-link ${currLocation == "/docs" ? "active" : ""}`}
          >
            Docs
          </Link>
          <Link
            to="https://github.com/t-Team-18/futures0xC/blob/main/transaction-api/README.md"
            className={`nav-link ${currLocation == "/apis" ? "active" : ""}`}
          >
            APIs
          </Link>
        </div>
        {/* <div className="bg-blue-500 rounded-lg hover:bg-white"> */}
        <WalletSelector />
        {/* </div> */}
      </div>

      <div className="md:hidden flex items-center justify-between px-4 py-4">
        <div>
          <a href="/">
            <img src={logo} className="h-12"></img>
          </a>
        </div>

        <div className="">
          {!nav ? (
            <button
              onClick={() => {
                setNav(true);
              }}
            >
              <img src={Menu} className="" />
            </button>
          ) : (
            <></>
          )}
        </div>
        <div
          className={
            nav
              ? "fixed top-0 left-0 w-full h-full bg-[#0D1328] ease-in-out duration-300 md:hidden"
              : "fixed top-[-100%]"
          }
        >
          <div className="md:hidden flex items-center justify-between px-4 py-4">
            <div>
              <a href="/">
                <img src={logo} className="h-12"></img>
              </a>
            </div>
            {nav ? (
              <button
                onClick={() => {
                  setNav(false);
                }}
              >
                <img src={CloseMenu} className="" />
              </button>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col justify-center font-montserrat gap-6 items-center text-2xl font-semibold py-20">
            <Link
              to="/"
              className={`nav-link ${currLocation == "/" ? "active" : ""}`}
              onClick={() => {
                setNav(false);
              }}
            >
              Home
            </Link>
            {/* <Link
              to="/about"
              className={`nav-link ${currLocation == "/about" ? "active" : ""}`}
              onClick={() => {
                setNav(false);
              }}
            >
              About
            </Link> */}
            <Link
              to="https://github.com/t-Team-18/futures0xC/blob/main/README.md"
              className={`nav-link ${currLocation == "/docs" ? "active" : ""}`}
              onClick={() => {
                setNav(false);
              }}
            >
              Docs
            </Link>
            <Link
              to="https://github.com/t-Team-18/futures0xC/blob/main/transaction-api/README.md"
              className={`nav-link ${currLocation == "/apis" ? "active" : ""}`}
              onClick={() => {
                setNav(false);
              }}
            >
              APIs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
