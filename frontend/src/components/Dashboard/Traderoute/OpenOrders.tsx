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
}

function specificUserTransaction(currArr: Order[], account: any) {
  const meraPta = String(account.address);
  const tempData: Order[] = [];
  for (let i = 0; i < currArr.length; i++) {
    if (currArr[i].user_address == meraPta) tempData.push(currArr[i]);
  }
  return tempData;
}

function solve(userAsk: Order[], userBid: Order[]) {
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

const OpenOrders = ({
  currAsk,
  currBid,
}: {
  currAsk: Order[];
  currBid: Order[];
}) => {
  const location = useLocation();
  const currLocation = location.pathname;

  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  

  const { account } = useWallet();
  if (!account)
    return (
      <div className="flex justify-center items-center h-full w-full md:border-[0.5px] md:border-[#383C3F] p-5">
        Please Connect your wallet!!
      </div>
    );

  const provider = new Provider(Network.DEVNET);

  const executeOrder = async (timestamp, lvg, bid, qty, price) => {
    if (!account) return [];

    const url = `https://fullnode.devnet.aptoslabs.com/v1/accounts/${moduleAddress}/events/${moduleAddress}::Orderbook::Resource/margin_call_event?limit=100`;

    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::Orderbook::exitOrder`,
      type_arguments: [],
      arguments: [timestamp, lvg, bid, qty, price],
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

  const [openOrder, setOpenOrder] = useState<Order[]>([]);


  useEffect(() => {
    const userAsk = specificUserTransaction(currAsk, account);
    const userBid = specificUserTransaction(currBid, account);

    setOpenOrder(solve(userAsk, userBid));
  }, [currAsk, currBid]);

  const [hoveringRow, setHoveringRow] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setHoveringRow(index);
  };

  const handleMouseLeave = () => {
    setHoveringRow(null);
  };

  const handleExitClick = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to exit this trade?"
    );
    if (confirmed) {
      executeOrder(
        openOrder[index].timestamp,
        openOrder[index].lvg,
        openOrder[index].pos,
        openOrder[index].qty,
        openOrder[index].stock_price
      );
      // Perform exit action here
      setHoveringRow(null); // Reset the hovering state after exit
    }
  };

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
                <th className="lg:py-3 lg:px-6 md:px-2 md:py- text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm font-light">
              {openOrder.map((item, index) => (
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

export default OpenOrders;
