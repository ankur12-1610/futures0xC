import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network, Provider } from "aptos";
import { useState, useEffect } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { useLocation } from "react-router-dom";
interface Order {
  lvg?: string;
  qty: string;
  stock_price: string;
  user_address?: string;
  timestamp: string;
  pos?: boolean;
}
interface Data {
  value: number;
  time: number;
}

function specificUserTransaction(currArr: Order[], account: any) {
  const meraPta = String(account.address);
  const tempData: Order[] = [];
  for (let i = 0; i < currArr.length; i++) {
    if (currArr[i].user_address == meraPta) tempData.push(currArr[i]);
  }
  return tempData;
}

function solve(userAsk: Order[], userBid: Order[]): Order[] {
  const response = [];
  for (let i = 0; i < userAsk.length; i++) {
    response.push({
      user_address: userAsk[i].user_address,
      qty: userAsk[i].qty,
      stock_price: userAsk[i].stock_price,
      timestamp: userAsk[i].timestamp,
      pos: false,
      lvg: userAsk[i].lvg,
    });
  }
  for (let i = 0; i < userBid.length; i++) {
    response.push({
      user_address: userBid[i].user_address,
      qty: userBid[i].qty,
      stock_price: userBid[i].stock_price,
      timestamp: userBid[i].timestamp,
      pos: true,
      lvg: userBid[i].lvg,
    });
  }
  return response.sort(
    (a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp)
  );
}

const Positions = ({
  seller,
  buyer,
  futuresLtp,
}: {
  seller: Order[];
  buyer: Order[];
  futuresLtp: Data;
}) => {

  const location = useLocation();
  const currLocation = location.pathname;

  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  
  

  const { account } = useWallet();
  const provider = new Provider(Network.DEVNET);

  const executeOrder = async (timestamp, lvg, buy, qty, price) => {
    if (!account) return [];

    const url = `https://fullnode.devnet.aptoslabs.com/v1/accounts/${moduleAddress}/events/${moduleAddress}::Orderbook::Resource/margin_call_event?limit=100`;

    // console.log(leverage, parseFloat(size), price);
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::Orderbook::exitPosition`,
      type_arguments: [],
      arguments: [timestamp, lvg, buy, qty, price],
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      // // wait for transaction
      await provider.waitForTransaction(response.hash);
    } catch (error: any) {
      console.log(error);
    }
  };

  if (!account)
    return (
      <div className="flex justify-center items-center h-full w-full md:border-[0.5px] md:border-[#383C3F] p-5">
        Please Connect your wallet!!
      </div>
    );

  const [filledOrders, setFilledOrder] = useState<Order[]>([]);

  useEffect(() => {
    const userSells = specificUserTransaction(seller, account);
    const userBuys = specificUserTransaction(buyer, account);

    setFilledOrder(solve(userSells, userBuys));

  }, [seller, buyer]);

  const [hoveringRow, setHoveringRow] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveringRow(index);
  };

  const handleMouseLeave = () => {
    setHoveringRow(null);
  };

  const handleExitClick = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to exit the position?"
    );
    if (confirmed) {
      // console.log(
      //   filledOrders[index].timestamp,
      //   filledOrders[index].lvg,
      //   filledOrders[index].pos,
      //   filledOrders[index].qty,
      //   filledOrders[index].stock_price,
      //   "this executed"
      // );
      // // Perform exit action here
      executeOrder(
        filledOrders[index].timestamp,
        filledOrders[index].lvg,
        filledOrders[index].pos,
        filledOrders[index].qty,
        filledOrders[index].stock_price
      );
      setHoveringRow(null); // Reset the hovering state after exit
    }
  };
  const colors = ["red", "green"];

  const symbols = [
    <MdArrowDropDown className="text-red-500" />,
    <MdArrowDropUp className="text-green-500" />,
  ];
  return (
    <>
      <div className="flex justify-center items-center h-full w-full md:border-[0.5px] md:border-[#383C3F] p-5">
        <div className="flex justify-between items-start h-full w-full overflow-y-auto p-2">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden bg-opacity-[5%]">
            <thead className="bg-slate-900 text-slate-300 uppercase text-sm leading-normal">
              <tr>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Side
                </th>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Price
                </th>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Quantity
                </th>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  timestamp
                </th>
                <th>P/L</th>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm font-light">
              {filledOrders.map((item, index) => (
                <tr key={index} className="border-b border-[#383C3F]">
                  {item.pos ? (
                    <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center text-green-500 ">
                      <p className="border border-green-500 rounded">Buy</p>
                    </td>
                  ) : (
                    <td className="lg:py-3 lg:px-6 md:px-2 md:py-  text-center text-red-500">
                      <p className="border border-red-500 rounded">Sell</p>
                    </td>
                  )}
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-left">
                    {item.stock_price}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-left">
                    {item.qty}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-left">
                    {new Date(
                      Math.floor(parseFloat(item.timestamp) / 1000)
                    ).toUTCString()}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-left flex flex-row">
                    {item.pos ? (
                      <div className="flex">
                        <div className="text-2xl">
                          {(futuresLtp.value - parseFloat(item.stock_price)) *
                            parseFloat(item.qty) >
                          0
                            ? symbols[1]
                            : symbols[0]}
                        </div>
                        <p
                          className={`${
                            (futuresLtp.value - parseFloat(item.stock_price)) *
                              parseFloat(item.qty) >
                            0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(futuresLtp.value - parseFloat(item.stock_price)) *
                            parseFloat(item.qty)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex">
                        <div className="text-2xl">
                          {Math.abs(-futuresLtp.value + parseFloat(item.stock_price)) *
                            parseFloat(item.qty) >
                          0
                            ? symbols[1]
                            : symbols[0]}
                        </div>
                        <p
                          className={`${
                            Math.abs(-futuresLtp.value + parseFloat(item.stock_price)) *
                              parseFloat(item.qty) >
                            0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {(-futuresLtp.value + parseFloat(item.stock_price)) *
                            parseFloat(item.qty)}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    <button
                      className="h-full w-full bg-slate-600 rounded"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleExitClick(index)}
                    >
                      {hoveringRow === index ? <p>Exit</p> : <p>Filled</p>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Positions;
