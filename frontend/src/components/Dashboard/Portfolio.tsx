import React, { useEffect, useState } from "react";
import Navelement from "./Portfolioroute/Navelement";
import Positions from "./Portfolioroute/Positions";
import Order from "./Portfolioroute/Order";
import History from "./Portfolioroute/History";
import { Network, Provider } from "aptos";
import { useLocation } from "react-router-dom";

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
  pos?: boolean;
  timestamp: string;
}
interface Data {
  value: number;
  time: number;
}
const Portfolio = () => {

  const moduleAddress1 = import.meta.env.VITE_APP_MODULE_ADDRESS_24H;
  const moduleAddress2 = import.meta.env.VITE_APP_MODULE_ADDRESS_48H;
  const moduleAddress3 = import.meta.env.VITE_APP_MODULE_ADDRESS_72H;
  
  const [nav, setNav] = useState(1);
  const provider = new Provider(Network.DEVNET);

  const [ask, setAsk] = useState<Order[][]>([]);
  const [bid, setBid] = useState<Order[][]>([]);
  const [buyers, setBuyers] = useState<Order[][]>([]);
  const [sellers, setSellers] = useState<Order[][]>([]);

  const fetchData = async () => {
    try {
      const response1 = await provider.getAccountResource(
        moduleAddress1,
        `${moduleAddress1}::Orderbook::Resource`
      );
      const response2 = await provider.getAccountResource(
        moduleAddress2,
        `${moduleAddress2}::Orderbook::Resource`
      );
      const response3 = await provider.getAccountResource(
        moduleAddress3,
        `${moduleAddress3}::Orderbook::Resource`
      );

      const currAsk: Order[][] = [];
      currAsk.push(response1.data.asks);
      currAsk.push(response2.data.asks);
      currAsk.push(response3.data.asks);
      const currBid: Order[][] = [];
      currBid.push(response1.data.bids);
      currBid.push(response2.data.bids);
      currBid.push(response3.data.bids);
      const currBuyers: Order[][] = [];
      currBuyers.push(response1.data.buyers);
      currBuyers.push(response2.data.buyers);
      currBuyers.push(response3.data.buyers);
      const currSellers: Order[][] = [];
      currSellers.push(response1.data.sellers);
      currSellers.push(response2.data.sellers);
      currSellers.push(response3.data.sellers);

      setAsk(currAsk);
      setBid(currBid);
      setBuyers(currBuyers);
      setSellers(currSellers);
    } catch (error) {
      console.log(error, "Error occurred!");
    }
  };


  useEffect(() => {
    fetchData();
    setInterval(() => {
      fetchData();
    }, 1000);
  }, []);

  return (
    <>
      <div className="flex  h-full w-full">
        <Navelement nav={nav} setNav={setNav}></Navelement>
                {nav === 1 && (
          <Order asks={ask} bids={bid}></Order>
        )}
        {nav === 2 && <Positions seller={sellers} buyer={buyers}></Positions>}
      </div>
    </>
  );
};

export default Portfolio;
