import { useState, useEffect } from "react";
import Chart from "./Traderoute/Chart";
import CoinInformation from "./Traderoute/CoinInformation.tsx";
import OrderBook from "./Traderoute/OrderBook.tsx";
import RecentTrades from "./Traderoute/RecentTrades.tsx";
import OrderWindow from "./Traderoute/OrderWindow.tsx";
import AcountDetails from "./Traderoute/MariginCall.tsx";
import OpenOrders from "./Traderoute/OpenOrders.tsx";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Positions from "./Traderoute/Positions.tsx";
import { Provider, Network } from "aptos";
import { useLocation } from "react-router-dom";

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
  pos?: boolean;
  timestamp: string;
}

interface Depth {
  key: string;
  value: string;
}

interface Data {
  value: number;
  time: number;
}

const Trade = () => {
  const location = useLocation();
  const currLocation = location.pathname;

  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  
  
  const apiUrl = `https://fullnode.devnet.aptoslabs.com/v1/accounts/${moduleAddress}/events/${moduleAddress}::Orderbook::DexOrderBook/set_ltp_event`;

  const provider = new Provider(Network.DEVNET);

  const [ask, setAsk] = useState<Order[]>([]);
  const [bid, setBid] = useState<Order[]>([]);
  const [buyers, setBuyers] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Order[]>([]);
  const [ltp, setLtp] = useState<Order>();
  const [askDepth, setAskDepth] = useState<Depth[]>([]);
  const [bidDepth, setBidDepth] = useState<Depth[]>([]);
  const [assetLtp, setAssetLtp] = useState<Data>();
  const [futuresLtp, setFuturesLtp] = useState<Data>();
  const [expiryTime, setExpiryTime] = useState<number>(0);
  const rfactor = 0.1;
  var tempExpiryTime = 0;
  const fetchData = async () => {
    try {
      const response = await provider.getAccountResource(
        moduleAddress,
        `${moduleAddress}::Orderbook::Resource`
      );
      console.log("response is:", response.data);
      const currAsk: Order[] = response.data.asks;
      const currBid: Order[] = response.data.bids;
      const currBuyers: Order[] = response.data.buyers;
      const currSellers: Order[] = response.data.sellers;
      const currAskMap: Depth[] = response.data.mktdpthseller.data;
      const currBidMap: Depth[] = response.data.mktdpthbuyer.data;
      const currAskMap1: Depth[] = [];
      const currBidMap1: Depth[] = [];

      const startTime: number = parseFloat(response.data.start_time) / 1000000;

      if (currLocation === "/dashboard/trade/X-APT-24H") {
        tempExpiryTime = startTime + 86400;
      } else if (currLocation === "/dashboard/trade/X-APT-48H") {
        tempExpiryTime = startTime + 86400 * 2;
      } else {
        tempExpiryTime = startTime + 86400 * 3;
      }
      setExpiryTime(tempExpiryTime);
      for (let i = currBidMap.length - 1; i >= 0; i--) {
        if (currBidMap[i].value != "0") currBidMap1.push(currBidMap[i]);
      }
      for (let i = currAskMap.length - 1; i >= 0; i--) {
        if (currAskMap[i].value != "0") currAskMap1.push(currAskMap[i]);
      }

      setAsk(currAsk);
      setBid(currBid);
      setBuyers(currBuyers);
      setSellers(currSellers);
      setLtp(currBuyers.reverse()[0]);
      setAskDepth(currAskMap1.reverse().slice(0, 10).reverse());
      setBidDepth(currBidMap1.slice(0, 10));
    } catch (error) {
      console.log(error, "Error occurred!");
    }
  };

  const fetchltp = async () => {
    try {
      const response = await fetch(`${apiUrl}?limit=10`);
      const data = await response.json();
      const assetData: Data = {
        value: parseFloat(data[data.length - 1].data.ltp),
        time: Math.floor(
          Number(data[data.length - 1].data.timestamp) / 1000000
        ),
      };
      const futuresData: Data = {
        value: Math.floor(
          assetData.value *
            (1 + (rfactor * (tempExpiryTime - assetData.time)) / (24 * 3600))
        ),
        time: Math.floor(
          Number(data[data.length - 1].data.timestamp) / 1000000
        ),
      };
      // console.log("current ltp", assetData, futuresData);
      setAssetLtp(assetData);
      setFuturesLtp(futuresData);
      // console.log("asset data", assetData, futuresData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchltp();
    setInterval(() => {
      fetchData();
      fetchltp();
    }, 500);
  }, []);

  const [order, setOrder] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [portfolio, setPortfolio] = useState(1);
  const [tradeWindow, setTradeWindow] = useState(false);
  const [middleWindow, setMiddleWindow] = useState(1);
  const [bottomWindow, setBottomWindow] = useState(1);

  return (
    <>
      <div className="md:flex hidden justify-center items-center h-full gradient text-white text-opacity-[90%]">
        <div className="h-full w-full">
          <div className="h-[8%]">
            <CoinInformation
              assetLtp={assetLtp}
              futuresLtp={futuresLtp}
            ></CoinInformation>
          </div>
          <div className="grid grid-cols-12 grid-rows-6 h-[92%]">
            <div
              className={`col-start-1 col-end-8 ${
                !fullScreen ? "row-start-1 row-end-4" : "row-start-1 row-end-7"
              } h-full w-full`}
            >
              <div
                className={`flex justify-center items-center ${
                  !fullScreen ? "h-[88%]" : "h-[94%]"
                }
            w-full`}
              >
                <Chart rfactor={rfactor} apiUrl={apiUrl}></Chart>
              </div>

              <div
                className={`flex justify-between items-center ${
                  !fullScreen ? "h-[12%]" : "h-[6%] border-b-[0.5px]"
                }  border-r-[0.5px] border-l-[0.5px] border-t-[0.5px] border-[#383C3F]`}
              >
                <div className="flex justify-center items-center h-full w-[40%] ">
                  <button
                    className={`flex justify-center items-center h-full w-full ${
                      portfolio === 1 ? "bg-[#061323]" : ""
                    }`}
                    onClick={() => {
                      setPortfolio(1);
                    }}
                  >
                    Positions
                  </button>
                  <button
                    className={`flex justify-center items-center h-full w-full border-r-[0.5px] border-[#383C3F] ${
                      portfolio === 2 ? "bg-[#061323]" : ""
                    }`}
                    onClick={() => {
                      setPortfolio(2);
                    }}
                  >
                    Orders
                  </button>
                </div>
                <button
                  className="h-full px-3"
                  onClick={() => {
                    setFullScreen(!fullScreen);
                  }}
                >
                  {!fullScreen ? (
                    <FaAngleDown className="h-full" />
                  ) : (
                    <FaAngleUp className="h-full" />
                  )}
                </button>
              </div>
            </div>
            {!fullScreen ? (
              <div className="col-start-1 col-end-8 row-start-4 row-end-7">
                {portfolio === 1 && (
                  <Positions
                    seller={sellers}
                    buyer={buyers}
                    futuresLtp={futuresLtp}
                  ></Positions>
                )}
                {portfolio === 2 && (
                  <OpenOrders
                    currAsk={ask}
                    currBid={bid}
                    ltp={ltp}
                  ></OpenOrders>
                )}
              </div>
            ) : (
              <></>
            )}
            <div className="col-start-8 col-end-10 row-start-1 row-end-7">
              <div className="flex justify-center items-center h-[8%] w-full">
                <button
                  className={`flex justify-center items-center w-[50%] h-full border-b-[0.5px] border-[#383C3F] ${
                    order ? "bg-[#061323]" : ""
                  }`}
                  onClick={() => {
                    setOrder(true);
                  }}
                >
                  Order
                </button>

                <button
                  className={`flex justify-center items-center w-[50%] h-full border-b-[0.5px] border-[#383C3F] ${
                    !order ? "bg-[#061323]" : ""
                  }`}
                  onClick={() => {
                    setOrder(false);
                  }}
                >
                  Trade
                </button>
              </div>
              <div className="h-[92%]">
                {order && (
                  <OrderBook
                    asks={askDepth}
                    bids={bidDepth}
                    ltp={ltp}
                  ></OrderBook>
                )}
                {!order && (
                  <RecentTrades data={buyers.slice(0, 50)}></RecentTrades>
                )}
              </div>
            </div>
            <div className="col-start-10 col-end-13 row-start-1 row-end-3">
              <AcountDetails></AcountDetails>
            </div>
            <div className="col-start-10 col-end-13 row-start-3 row-end-7">
              <OrderWindow
                tradeWindow={tradeWindow}
                setTradeWindow={setTradeWindow}
                futuresLtp={futuresLtp}
                ltp={ltp}
              ></OrderWindow>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-center items-start font-montserrat h-full bg-[#122337] text-white text-opacity-[90%]">
        {!tradeWindow && (
          <div className="flex flex-col justify-center items-center h-[94.5%] w-full">
            <div className="h-[20%] w-full">
              <CoinInformation
                assetLtp={assetLtp}
                futuresLtp={futuresLtp}
              ></CoinInformation>
            </div>
            <div className="h-[45%] w-full">
              <div className="flex justify-start items-center gap-2 h-[10%] w-full px-3">
                <button
                  className={`text-bold ${
                    middleWindow === 1
                      ? "text-[#0A7CFF]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setMiddleWindow(1);
                  }}
                >
                  Chart
                </button>
                <div className="h-6 border-l-2 border-[#383C3F]"></div>
                <button
                  className={`text-bold ${
                    middleWindow === 2
                      ? "text-[#0A7CFF]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setMiddleWindow(2);
                  }}
                >
                  Order Book
                </button>
                <div className="h-6 border-l-2 border-[#383C3F]"></div>
                <button
                  className={`text-bold ${
                    middleWindow === 3
                      ? "text-[#0A7CFF]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setMiddleWindow(3);
                  }}
                >
                  Trades
                </button>
              </div>
              <div className="flex justify-center items-center h-[90%] w-full">
                {middleWindow === 1 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <Chart rfactor={rfactor} apiUrl={apiUrl}></Chart>
                  </div>
                )}
                {middleWindow === 2 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <OrderBook
                      asks={askDepth}
                      bids={bidDepth}
                      ltp={ltp}
                    ></OrderBook>
                  </div>
                )}
                {middleWindow === 3 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <RecentTrades data={buyers.slice(0, 50)}></RecentTrades>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[35%] w-full">
              <div className="flex justify-start items-center gap-2 h-[15%] w-full px-3">
                <button
                  className={`px-2 py-1 rounded-xl ${
                    bottomWindow === 1
                      ? "bg-[#FFFFFF] bg-opacity-[10%] text-[#FFFFFF] text-opacity-[90%]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setBottomWindow(1);
                  }}
                >
                  Positions
                </button>
                <button
                  className={`px-2 py-1 rounded-xl ${
                    bottomWindow === 2
                      ? "bg-[#FFFFFF] bg-opacity-[10%] text-[#FFFFFF] text-opacity-[90%]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setBottomWindow(2);
                  }}
                >
                  Open Order
                </button>
                <button
                  className={`px-2 py-1 rounded-xl ${
                    bottomWindow === 3
                      ? "bg-[#FFFFFF] bg-opacity-[10%] text-[#FFFFFF] text-opacity-[90%]"
                      : "text-[#eaf0f6] text-opacity-[30%]"
                  }`}
                  onClick={() => {
                    setBottomWindow(3);
                  }}
                >
                  Marigin Call
                </button>
              </div>
              <div className="flex justify-center items-center h-[85%] w-full">
                {bottomWindow === 1 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <Positions
                      seller={sellers}
                      buyer={buyers}
                      futuresLtp={futuresLtp}
                    ></Positions>
                  </div>
                )}
                {bottomWindow === 2 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <OpenOrders currAsk={ask} currBid={bid}></OpenOrders>
                  </div>
                )}
                {bottomWindow === 3 && (
                  <div className="flex justify-center items-center h-full w-full">
                    <AcountDetails></AcountDetails>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!tradeWindow && (
          <div className="flex justify-center items-center bottom-0 fixed bg-translucent-bottom h-12 w-full">
            <button
              className="flex justify-between items-center h-full w-full px-10"
              onClick={() => {
                setTradeWindow(true);
              }}
            >
              <div>Tap to trade</div>
              <div>
                <FaAngleUp size={20} />
              </div>
            </button>
          </div>
        )}
        {tradeWindow && (
          <OrderWindow
            tradeWindow={tradeWindow}
            setTradeWindow={setTradeWindow}
            futuresLtp={futuresLtp}
            ltp={ltp}
          ></OrderWindow>
        )}
      </div>
    </>
  );
};

export default Trade;
