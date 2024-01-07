import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Provider, Network } from "aptos";
import { useLocation } from "react-router-dom";

interface MarginCall {
  margin: number;
  timestamp: number;
}

const AccountDetails = () => {
  const location = useLocation();
  const currLocation = location.pathname;

  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  
  
  const url = `https://fullnode.devnet.aptoslabs.com/v1/accounts/${moduleAddress}/events/${moduleAddress}::Orderbook::Resource/margin_call_event?limit=100`;

  const [deposit, setDeposit] = useState(0.0);

  const handleDeposit = (e) => {
    const inputValue = e.target.value;

    // Allow only positive numbers
    const isValid = /^\d*\.?\d*$/.test(inputValue);

    if (isValid) {
      setDeposit(inputValue);
    }
  };

  const { account } = useWallet();
  const temp: MarginCall = {
    margin: 0,
    timestamp: 0,
  };
  const [recentMarginCall, setRecentMarginCall] = useState<MarginCall>(temp);
  const [prevMarginCallTime, setPrevMarginCallTime] = useState<number>(
    Date.now()
  );

  const provider = new Provider(Network.DEVNET);

  const executeOrder = async (price) => {
    if (!account) return [];
    const moduleAddress = import.meta.env.VITE_APP_MODULE_ADDRESS;
    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::Orderbook::deposit_margin`,
      type_arguments: [],
      arguments: [price],
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      await provider.waitForTransaction(response.hash);
      setPrevMarginCallTime(recentMarginCall.timestamp);
      setRecentMarginCall(temp);
      setDeposit(0.0);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchMargin = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        for (let i = data.length - 1; i >= 0; i--) {
          if (data[i].data.user_address == account?.address) {
            setRecentMarginCall({
              margin: parseFloat(data[i].data.margin_depleted),
              timestamp: parseFloat(data[i].data.timestamp) / 1000,
            });
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    setInterval(() => {
      fetchMargin();
    }, 1000);
  }, []);
  return (
    <>
      {!account && (
        <div className="flex justify-center items-center h-full w-full border-l-[0.5px] border-r-[0.5px] border-[#383C3F]">
          <div className="flex flex-col justify-center items-center text-center gap-2">
            <h1 className="px-5 ">
              Connect your wallet to deposit funds and start trading.
            </h1>
            <WalletSelector></WalletSelector>
          </div>
        </div>
      )}
      {account && (
        <div className="flex justify-center items-center h-full w-full border-l-[0.5px] border-r-[0.5px] border-[#383C3F]">
          <div className="flex flex-col justify-center items-center p-2 w-[60%] gap-2 bg-[#ffffff] bg-opacity-[4%] rounded-xl shadow">
            <div className="font-montserrat">Marigin Call</div>
            <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
              <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%] px-4 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                Margin Required
              </div>
              <div className="w-full h-full appearance-none focus:outline-none px-4 bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl text-red-500">
                {recentMarginCall.timestamp > prevMarginCallTime
                  ? recentMarginCall?.margin
                  : "0.0"}
              </div>
            </div>
            <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
              <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-4 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                Deposit
              </div>
              <input
                className="w-full h-full appearance-none focus:outline-none px-4 bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                placeholder="0.00"
                type="text"
                value={deposit ? deposit : ""}
                onChange={handleDeposit}
              ></input>
            </div>
            <div
              className="flex justify-center items-center min-w-[40%] h-full bg-[#1068CE] rounded-lg hover:bg-white border hover:text-[#1068CE] border-[#1068CE]"
              onClick={() => {
                executeOrder(deposit);
              }}
            >
              Submit
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDetails;
