import React, { useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { Provider, Network } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IoMdCloseCircle } from "react-icons/io";
import { useLocation } from "react-router-dom";

interface Data {
  value: number;
  time: number;
}

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
  pos?: boolean;
  timestamp: string;
}

interface OrderWindowProps {
  tradeWindow: boolean;
  setTradeWindow: React.Dispatch<React.SetStateAction<boolean>>;
  futuresLtp: Data;
  ltp: Order;
}

// function to execute order
const param = [
  "buyAtlimitorder",
  "sellAtlimitorder",
  "buyAtMarketorder",
  "sellAtMarketorder",
];

const OrderWindow: React.FC<OrderWindowProps> = ({
  tradeWindow,
  setTradeWindow: _setTradeWindow,
  futuresLtp,
  ltp,
}) => {
  const location = useLocation();
  const currLocation = location.pathname;

  const [limit, setLimit] = useState(true);
  const [openStopLoss, setOpenStopLoss] = useState(false);
  const [side, setSide] = useState("Buy");

  const [limitPrice, setLimitPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);

  const [leverage, setLeverage] = useState(1);
  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  

  const handleLeverage = (e) => {
    setLeverage(e.target.value);
  };

  const handleLimitPrice = (e) => {
    const inputValue = e.target.value;

    // Allow only positive numbers
    const isValid = /^$|^\d+$/.test(inputValue);

    if (isValid) {
      setLimitPrice(inputValue);
      setSize(0.0);
      setPrice(0.0);
    }
  };
  const handleStopLoss = (e) => {
    const inputValue = e.target.value;

    // Allow only positive integers
    const isValid = /^$|^\d+$/.test(inputValue);

    if (isValid) {
      setStopLoss(inputValue);
    }
  };

  const handleSize = (e) => {
    e.preventDefault();
    const inputValue = e.target.value;
    // Allow only positive numbers
    const isValid = /^$|^\d+$/.test(inputValue);

    if (isValid) {
      setSize(inputValue);
      if (limit) {
        setPrice(limitPrice * inputValue);
      } else {
        //Market ltd from reccent trades set price to ltd*size
        setPrice(inputValue * ltp?.stock_price);
      }
    }
  };

  const handlePrice = (e) => {
    const inputValue = e.target.value;

    // Allow only positive numbers
    const isValid = /^$|^\d+$/.test(inputValue);

    if (isValid) {
      setPrice(inputValue);
      if (limit) {
        let calcSize = (inputValue / limitPrice).toFixed(0);
        if (inputValue == 0) {
          setSize(0);
        } else {
          setSize(calcSize);
        }
      } else {
        //Market ltd from recent trades set size to price/recenttrades
        setSize((inputValue / ltp?.stock_price).toFixed(0));
      }
    }
  };

  const handleLimitOrder = () => {
    if (!limitPrice || !size || !price) {
      return;
    }

    // console.log({
    //   orderType: "Limit",
    //   side,
    //   limitPrice,
    //   size,
    // });
  };

  const handleMarketOrder = () => {
  };

  const provider = new Provider(Network.DEVNET);
  const { account } = useWallet();

  const executeOrder = async (leverage, size, price, ind, stoploss) => {
    if (
      (price > 1.20 * futuresLtp.value || price < 0.80 * futuresLtp.value) &&
      limit
    ) {
      window.confirm("Limit Price Should be in 20% range!!!");

      setLimitPrice(0);
      setStopLoss(0);
      setPrice(0);
      setSize(0);
      setLeverage(1);

      return;
    }

    if (!stoploss) {
      if (ind == 0 || ind == 2) stoploss = 0;
      else stoploss = Number.MAX_SAFE_INTEGER;
    } else if (ind == 0 || ind == 2) {
      if (stoploss > price) stoploss = 0;
    } else if (ind == 1 || ind == 3) {
      if (stoploss < price) stoploss = Number.MAX_SAFE_INTEGER;
    }

    size = parseFloat(size);

    let args = [leverage, size, price, stoploss];
    if (ind == 2 || ind == 3) args = [leverage, size, stoploss];

    if (!account) return [];

    const payload = {
      type: "entry_function_payload",
      function: `${moduleAddress}::Orderbook::${param[ind]}`,
      type_arguments: [],
      arguments: args,
    };
    try {
      const response = await (window as any).aptos.signAndSubmitTransaction(
        payload
      );
      // // wait for transaction
      await provider.waitForTransaction(response.hash);
      setLimitPrice(0);
      setStopLoss(0);
      setPrice(0);
      setSize(0);
      setLeverage(1);
    } catch (error: any) {
      console.log(error);
      setLimitPrice(0);
      setStopLoss(0);
      setPrice(0);
      setSize(0);
      setLeverage(1);
    }
  };

  return (
    <>
      <div
        className={`relative flex flex-col justify-start items-center h-full w-full border-[0.5px] border-[#383C3F]`}
      >
        {tradeWindow && (
          <div className="flex justify-center items-center bg-translucent-top h-12 w-full">
            <button
              className="flex justify-between items-center h-full w-full px-10"
              onClick={() => {
                _setTradeWindow(false);
              }}
            >
              <div>Tap to close</div>
              <div>
                <FaAngleDown size={20} />
              </div>
            </button>
          </div>
        )}
        <div
          className={`flex justify-center items-center h-12 w-full ${
            tradeWindow ? "mt-5" : ""
          }`}
        >
          <button
            className={`flex justify-center items-center w-[50%] h-full border-b-[0.5px] border-[#383C3F]
            ${tradeWindow ? "border-t-[0.5px]" : ""}
            ${limit ? "bg-[#061323]" : ""}`}
            onClick={() => {
              setLimit(true);
              setSide("Buy");
              setLimitPrice(0);
              setStopLoss(0);
              setPrice(0);
              setSize(0);
              setLeverage(1);
              setOpenStopLoss(false);
            }}
          >
            Limit
          </button>
          <button
            className={`flex justify-center items-center w-[50%] h-full border-b-[0.5px] border-[#383C3F] 
            ${tradeWindow ? "border-t-[0.5px]" : ""}
            ${!limit ? "bg-[#061323]" : ""}`}
            onClick={() => {
              setLimit(false);
              setSide("Buy");
              setLimitPrice(0);
              setStopLoss(0);
              setPrice(0);
              setSize(0);
              setLeverage(1);
              setOpenStopLoss(false);
            }}
          >
            Market
          </button>
        </div>
        <div className="flex justify-center items-center h-full w-full">
          {limit ? (
            <div className="flex flex-col justify-between items-center  h-full w-full">
              <div className="flex flex-col justify-between items-center pt-3 gap-5 w-full overflow-auto">
                <div className="flex justify-center items-center h-10 w-[60%] bg-[#FFFFFF] bg-opacity-[8%] rounded-xl">
                  <div
                    className={`flex justify-center items-center w-[50%] h-full rounded-xl ${
                      side == "Buy"
                        ? "border border-green-500 text-green-500 bg-[#122337]"
                        : "text-[#eaf0f6] text-opacity-[60%]"
                    }`}
                    onClick={() => {
                      setSide("Buy");
                      setLimitPrice(0);
                      setStopLoss(0);
                      setPrice(0);
                      setSize(0);
                      setLeverage(1);
                      setOpenStopLoss(false);
                    }}
                  >
                    Buy
                  </div>
                  <div
                    className={`flex justify-center items-center w-[50%] h-full rounded-xl ${
                      side === "Sell"
                        ? "border border-red-500 text-red-500 bg-[#122337]"
                        : "text-[#eaf0f6] text-opacity-[60%]"
                    }`}
                    onClick={() => {
                      setSide("Sell");
                      setLimitPrice(0);
                      setStopLoss(0);
                      setPrice(0);
                      setSize(0);
                      setLeverage(1);
                      setOpenStopLoss(false);
                    }}
                  >
                    Sell
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center w-[60%] gap-7">
                  <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                    <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
                      <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                        Limit Price
                      </div>
                      <input
                        className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                        placeholder="0"
                        type="text"
                        value={limitPrice ? limitPrice : ""}
                        onChange={handleLimitPrice}
                      ></input>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                      <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
                        <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                          Size
                        </div>
                        <input
                          className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                          placeholder="0"
                          type="text"
                          value={size ? size : ""}
                          onChange={handleSize}
                        ></input>
                      </div>
                    </div>
                    <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                      <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
                        <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                          Price
                        </div>
                        <input
                          className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                          placeholder="0"
                          type="text"
                          value={price ? price : ""}
                          onChange={handlePrice}
                        ></input>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                    {openStopLoss && (
                      <div className="relative flex flex-col justify-center items-start w-full h-full rounded-xl">
                        <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                          Stop Loss
                        </div>
                        <button
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setStopLoss(0);
                            setOpenStopLoss(false);
                          }}
                        >
                          <IoMdCloseCircle />
                        </button>
                        <input
                          className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                          placeholder="0"
                          type="text"
                          value={stopLoss ? stopLoss : ""}
                          onChange={handleStopLoss}
                        ></input>
                      </div>
                    )}
                    {!openStopLoss && (
                      <button
                        className="text-[#eaf0f6] text-opacity-[60%] text-xs"
                        onClick={() => {
                          setOpenStopLoss(true);
                        }}
                      >
                        Add Stoploss
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-[60%]">
                  <div className="flex flex-col gap-2 w-full">
                    <label
                      htmlFor="leverage"
                      className="block text-sm font-medium text-[#FFFFFF] text-opacity-[70%]"
                    >
                      Leverage: {leverage}x
                    </label>
                    <input
                      type="range"
                      id="leverage"
                      name="leverage"
                      min="1"
                      max="20"
                      step="1"
                      value={leverage}
                      onChange={handleLeverage}
                      className="block w-full bg-blue-200 appearance-none rounded-full h-3"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 pb-8 flex flex-col justify-center items-center w-[80%]">
                <button
                  className="flex justify-center items-center h-12 w-[80%] mb-3 bg-[#1068CE] rounded-lg hover:bg-white hover:border hover:text-[#1068CE] border-[#1068CE]"
                  onClick={
                    side === "Buy"
                      ? () => {
                          executeOrder(leverage, size, limitPrice, 0, stopLoss);
                        }
                      : () => {
                          executeOrder(leverage, size, limitPrice, 1, stopLoss);
                        }
                  }
                >
                  Place Order
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between items-center  h-full w-full">
              <div className="flex flex-col justify-between items-center pt-3 gap-5 w-full overflow-auto">
                <div className="flex justify-center items-center h-10 w-[60%] bg-[#FFFFFF] bg-opacity-[8%] rounded-xl">
                  <div
                    className={`flex justify-center items-center w-[50%] h-full rounded-xl ${
                      side == "Buy"
                        ? "border border-green-500 text-green-500 bg-[#122337]"
                        : "text-[#eaf0f6] text-opacity-[60%]"
                    }`}
                    onClick={() => {
                      setSide("Buy");
                      setLimitPrice(0);
                      setStopLoss(0);
                      setPrice(0);
                      setSize(0);
                      setLeverage(1);
                      setOpenStopLoss(false);
                    }}
                  >
                    Buy
                  </div>
                  <div
                    className={`flex justify-center items-center w-[50%] h-full rounded-xl ${
                      side === "Sell"
                        ? "border border-red-500 text-red-500 bg-[#122337]"
                        : "text-[#eaf0f6] text-opacity-[60%]"
                    }`}
                    onClick={() => {
                      setSide("Sell");
                      setLimitPrice(0);
                      setStopLoss(0);
                      setPrice(0);
                      setSize(0);
                      setLeverage(1);
                      setOpenStopLoss(false);
                    }}
                  >
                    Sell
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center w-[60%] gap-7">
                  <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                    <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
                      <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                        Size
                      </div>
                      <input
                        className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                        placeholder="0"
                        type="text"
                        value={size ? size : ""}
                        onChange={handleSize}
                      ></input>
                    </div>
                    <div className="flex flex-col justify-center items-center w-full gap-7">
                      <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                        <div className="flex flex-col justify-center items-start w-full h-full rounded-xl">
                          <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                            Price
                          </div>
                          <input
                            className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                            placeholder="0"
                            type="text"
                            value={price ? price : ""}
                            onChange={handlePrice}
                          ></input>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-start w-full gap-2 h-8 rounded-xl">
                    {openStopLoss && (
                      <div className="relative flex flex-col justify-center items-start w-full h-full rounded-xl">
                        <div className="w-full h-full bg-[#FFFFFF] bg-opacity-[8%]  px-2 pt-1 rounded-t-xl text-[#eaf0f6] text-opacity-[60%]">
                          Stop Loss
                        </div>
                        <button
                          className="absolute top-0 right-0"
                          onClick={() => {
                            setStopLoss(0);
                            setOpenStopLoss(false);
                          }}
                        >
                          <IoMdCloseCircle />
                        </button>
                        <input
                          className="w-full h-full px-2 pb-1 appearance-none focus:outline-none bg-[#FFFFFF] bg-opacity-[8%] rounded-b-xl"
                          placeholder="0"
                          type="text"
                          value={stopLoss ? stopLoss : ""}
                          onChange={handleStopLoss}
                        ></input>
                      </div>
                    )}
                    {!openStopLoss && (
                      <button
                        className="text-[#eaf0f6] text-opacity-[60%] text-xs"
                        onClick={() => {
                          setOpenStopLoss(true);
                        }}
                      >
                        Add Stoploss
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-[60%]">
                  <div className="flex flex-col gap-2 w-full">
                    <label
                      htmlFor="leverage"
                      className="block text-sm font-medium text-[#FFFFFF] text-opacity-[70%]"
                    >
                      Leverage: {leverage}x
                    </label>
                    <input
                      type="range"
                      id="leverage"
                      name="leverage"
                      min="1"
                      max="20"
                      step="1"
                      value={leverage}
                      onChange={handleLeverage}
                      className="block w-full bg-blue-200 appearance-none rounded-full h-3"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 pb-8 flex flex-col justify-center items-center gap-3 w-[80%]">
                <button
                  className="flex justify-center items-center h-12 w-[80%] mb-3 bg-[#1068CE] rounded-lg hover:bg-white hover:border hover:text-[#1068CE] border-[#1068CE]"
                  onClick={
                    side === "Buy"
                      ? () => {
                          executeOrder(leverage, size, price, 2, stopLoss);
                        }
                      : () => {
                          executeOrder(leverage, size, price, 3, stopLoss);
                        }
                  }
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderWindow;