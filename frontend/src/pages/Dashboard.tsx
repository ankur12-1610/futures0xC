import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Dashboard/Navbar";
import Trade from "../components/Dashboard/Trade";
// import Markets from "../components/Dashboard/Markets";
import Portfolio from "../components/Dashboard/Portfolio";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const currLocation = location.pathname;
  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar></Navbar>
        <div className="flex-1 h-full overflow-y-auto">
          {currLocation == "/dashboard/trade/X-APT-24H" && <Trade></Trade>}
          {currLocation == "/dashboard/trade/X-APT-48H" && <Trade></Trade>}
          {currLocation == "/dashboard/trade/X-APT-72H" && <Trade></Trade>}
          {currLocation == "/dashboard/portfolio" && <Portfolio></Portfolio>}
          {/* {currLocation == "/dashboard/markets" && <Markets></Markets>} */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
