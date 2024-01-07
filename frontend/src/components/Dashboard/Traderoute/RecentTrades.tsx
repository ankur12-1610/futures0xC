import { Provider, Network } from "aptos";
import React, { useState, useEffect, useRef } from "react";

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
  pos?: boolean;
  timestamp: string;
}

const RecentTrades = ({ data }: { data: Order[] }) => {
  const [recentTrades, setRecentTrades] = useState<Order[]>([]);

  useEffect(() => {
    setRecentTrades(data);
  }, [data]);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-full w-full border-b-[0.5px] border-[#383C3F]">
        <div className="h-[10%] w-full flex justify-between items-center">
          <div className="flex justify-center items-center h-full w-full">
            Price
          </div>
          <div className="flex justify-center items-center h-full w-full">
            Quantity
          </div>
          <div className="flex justify-center items-center h-full w-full">
            Time
          </div>
        </div>
        <div
          className="h-full w-full flex flex-col justify-start items-center  overflow-y-scroll text-xs"
          id="asks"
        >
          {/* <h2>Asks</h2> */}
          <div className="flex flex-col justify-end items-center w-full gap-1">
            {recentTrades.map((order, index) => (
              <div
                key={index}
                className="flex justify-evenly items-center h-full w-full"
              >
                <div
                  className={`flex justify-center items-center w-20 ${
                    order.pos ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {order.stock_price}
                </div>
                <div className="flex justify-center items-center w-20">
                  {order.qty}
                </div>
                <div className="flex justify-center items-center w-20">
                  {new Date(
                    Math.floor(parseFloat(order.timestamp) / 1000)
                  ).toUTCString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentTrades;
