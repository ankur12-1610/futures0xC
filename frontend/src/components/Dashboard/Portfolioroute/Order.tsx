import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network, Provider } from "aptos";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
interface Order {
  lvg?: string;
  qty: string;
  stock_price: string;
  user_address?: string;
  timestamp: string;
  pos?: boolean;
  contract?: number;
}

function specificUserTransaction(currArr: Order[][], account: any) {
  const meraPta = String(account.address);
  const tempData: Order[] = [];
  for (let i = 0; i < currArr?.length; i++) {
    for (let j = 0; j < currArr[i].length; j++) {
      if (currArr[i][j].user_address == meraPta) {
        tempData.push({
          lvg: currArr[i][j].lvg,
          qty: currArr[i][j].qty,
          stock_price: currArr[i][j].stock_price,
          user_address: currArr[i][j].user_address,
          timestamp: currArr[i][j].timestamp,
          contract: i + 1,
        });
      }
    }
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
      contract: userAsk[i].contract,
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
      contract: userBid[i].contract,
    });
  }
  return response.sort(
    (a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp)
  );
}

const Order = ({ asks, buys }: { asks: Order[][]; buys: Order[][] }) => {
  const { account } = useWallet();
  const provider = new Provider(Network.DEVNET);

  if (!account)
    return (
      <div className="flex justify-center items-center h-full w-full md:border-[0.5px] md:border-[#383C3F] p-5">
        Please Connect your wallet!!
      </div>
    );

  const [openOrders, setOpenOrder] = useState<Order[]>([]);
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
      executeOrder(
        openOrders[index].timestamp,
        openOrders[index].lvg,
        openOrders[index].pos,
        openOrders[index].qty,
        openOrders[index].stock_price,
        openOrders[index].contract
      );
      setHoveringRow(null);
    }
  };

  const executeOrder = async (timestamp, lvg, buy, qty, price, contract) => {
    if (!account) return [];
    const payload = {
      type: "entry_function_payload",
      function: `${
        contract === 1
          ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H
          : contract === 2
          ? import.meta.env.VITE_APP_MODULE_ADDRESS_48H
          : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
      }::Orderbook::exitOrder`,
      type_arguments: [],
      arguments: [timestamp, lvg, buy, qty, price],
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      await provider.waitForTransaction(response.hash);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    const userAsks = specificUserTransaction(asks, account);
    const userBids = specificUserTransaction(buys, account);
    const finalData = solve(userAsks, userBids);
    setOpenOrder(finalData);
  }, [asks, buys]);

  return (
    <>
      <div
        className="flex justify-center items-center h-full w-full p-5"
        style={{ backgroundColor: "#0B1B2D" }}
      >
        <div className="flex justify-between items-start h-full w-full overflow-y-auto p-2">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden bg-opacity-[5%]">
            <thead className="bg-slate-900 text-slate-300 uppercase text-sm leading-normal">
              <tr>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Side
                </th>
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Contract
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
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm font-light">
              {openOrders.map((item, index) => (
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
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    {item.contract == 1
                      ? "X-APT-24H"
                      : item.contract == 2
                      ? "X-APT-48H"
                      : "X-APT-72H"}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    {item.stock_price}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    {item.qty}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    {new Date(
                      Math.floor(parseFloat(item.timestamp) / 1000)
                    ).toUTCString()}
                  </td>
                  <td className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                    <button
                      className="h-full w-full bg-slate-600 rounded"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleExitClick(index)}
                    >
                      {hoveringRow === index ? <p>Exit</p> : <p>Pending</p>}
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

export default Order;
