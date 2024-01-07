import React, { useEffect, useRef, useState } from "react";
import { createChart, PriceScaleMode } from "lightweight-charts";
import { useLocation } from "react-router-dom";
import { Provider, Network } from "aptos";

interface Data {
  value: number;
  time: number;
}


const Chart = ({ rfactor, apiUrl }: { rfactor: number; apiUrl: string }) => {

  const location = useLocation();
  const currLocation = location.pathname;

  const moduleAddress = currLocation === "/dashboard/trade/X-APT-24H" ? import.meta.env.VITE_APP_MODULE_ADDRESS_24H : currLocation === import.meta.env.VITE_APP_MODULE_ADDRESS_48H ? "X/Apt 48H" : import.meta.env.VITE_APP_MODULE_ADDRESS_72H
  

  const provider = new Provider(Network.DEVNET);


  const chartRef = useRef<HTMLCanvasElement>(null);
  var lastSequenceNumber = "";
  var expiryTime = 1703329600;

  useEffect(() => {
    const chartProperties = {
      localization: {
        priceFormatter: (price: number) => {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "APT",
            maximumFractionDigits: 3,
          }).format(price);
        },
      },
      priceFormat: {
        type: "price",
        minMove: 0.001,
      },
      PriceScaleMode: {
        autoScale: true,
        mode: PriceScaleMode.Normal,
        precision: 3,
      },
      layout: {
        background: {
          color: "rgba(13, 16, 34, 0.87)",
        },
        textColor: "#d1d4dd",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0)" },
        horzLines: { color: "rgba(42, 46, 57, 0.6)" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    };
    const domElement = chartRef.current;
    const chart = createChart(domElement, chartProperties);
    const areaSeries = chart.addAreaSeries({
      topColor: "rgba(38,198,218, 0.56)",
      bottomColor: "rgba(38,198,218, 0.04)",
      lineColor: "rgba(38,198,218, 0.7)",
      lineWidth: 2,
    });
    const fetchExpiryTime = async () => {
      try {
        const response = await provider.getAccountResource(moduleAddress,`${moduleAddress}::Orderbook::Resource`);
        const startTime: number = parseFloat(response.data.start_time) / 1000000;

        if (currLocation === "/dashboard/trade/X-APT-24H")  expiryTime = startTime + 86400;
        else if (currLocation === "/dashboard/trade/X-APT-48H")  expiryTime = startTime + 86400 * 2;
        else expiryTime = startTime + 86400 * 3;

      } catch (error) {
        console.log(error, "Error occurred!");
      }
    };

    fetchExpiryTime();

    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}?limit=100`);
        const data = await response.json();
        lastSequenceNumber = (
          parseInt(data[data.length - 1].sequence_number) + 1
        ).toString();
        const newData = data.map((item: any) => ({
          value: Math.floor(
            parseFloat(item.data.ltp) *
              (1 +
                (rfactor *
                  (expiryTime -
                    Math.floor(Number(item.data.timestamp) / 1000000))) /
                  (24 * 3600))
          ),
          time: Math.floor(Number(item.data.timestamp) / 1000000),
        }));
        areaSeries.setData(newData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    setInterval(() => {
      fetch(`${apiUrl}?limit=10&start=${lastSequenceNumber}`)
        .then((res) => res.json())
        .then((data) => {
          lastSequenceNumber = (
            parseInt(data[data.length - 1].sequence_number) + 1
          ).toString();
          const newData: Data = {
            value: Math.floor(
              parseFloat(data[data.length - 1].data.ltp) *
                (1 +
                  (rfactor *
                    (expiryTime -
                      Math.floor(
                        Number(data[data.length - 1].data.timestamp) / 1000000
                      ))) /
                    (24 * 3600))
            ),
            time: Math.floor(
              Number(data[data.length - 1].data.timestamp) / 1000000
            ),
          };
          areaSeries.update(newData);
        })
        .catch((err) => console.log(err));
    }, 500);

    new ResizeObserver((entries) => {
      if (entries.length === 0 || entries[0].target !== chartRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      chart.applyOptions({ height: newRect.height, width: newRect.width });
    }).observe(chartRef.current);
  }, []);

  return (
    <>
      <div className="flex justify-center items-center h-full w-full md:border-r-[0.5px] md:border-l-[0.5px] md:border-[#383C3F] ">
        <div ref={chartRef} className="h-full w-full "></div>
      </div>{" "}
    </>
  );
};

export default Chart;
