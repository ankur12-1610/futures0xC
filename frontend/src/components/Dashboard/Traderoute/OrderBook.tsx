import DepthChart from "./DepthChart.tsx";

interface Order {
  lvg: string;
  qty: string;
  stock_price: string;
  user_address: string;
  pos?: Boolean;
}
interface Depth {
  key: string;
  value: string;
}
const OrderBook = ({
  asks,
  bids,
  ltp,
}: {
  asks: Depth[];
  bids: Depth[];
  ltp: Order;
}) => {

  return (
    <div className="flex flex-col justify-between items-center h-full w-full border-b-[0.5px] border-[#383C3F]">
      <div className=" h-[10%] w-full flex justify-between items-center text-xs text-[#eaf0f6] z-20 text-opacity-[60%]">
        <div className="flex justify-center items-center h-full w-full">
          <p>Y-axis: </p> <p className="font-bold">Price</p>
        </div>
        <div className="flex justify-center items-center h-full w-full">
          <p>X-axis: </p> <p className="font-bold">Quantity</p>
        </div>
      </div>

      <div
        className="h-[43%] w-full flex flex-col justify-end items-center overflow-y-hidden text-xs"
        id="asks"
      >
        <div className="flex justify-center items-center h-full w-full">
          <DepthChart side="asks" data={asks}></DepthChart>
        </div>
      </div>
      <div
        className={`h-[6%] relative w-full flex flex-col justify-center items-center font-semibold border-b-[0.5px] border-t-[0.5px] border-[#383C3F] ${
          ltp?.pos ? "text-green-500" : "text-red-500"
        }`}
      >
        {ltp?.stock_price}
      </div>
      <div
        className="h-[43%] w-full flex flex-col justify-start items-center overflow-y-hidden"
        id="bids"
      >
        <div className="flex justify-center items-center h-full w-full">
          <DepthChart side="bids" data={bids}></DepthChart>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
