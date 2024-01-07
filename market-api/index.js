const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Network, Provider } = require("aptos");
const provider = new Provider(Network.DEVNET);
const dotenv = require("dotenv");
dotenv.config();
moduleAddress = process.env.MODULE_ADDR;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const fetchData = async () => {
  try {
    const response = await provider.getAccountResource(
      moduleAddress,
      `${moduleAddress}::Orderbook::Resource`
    );
    response["data"]["ltp"] =
      response["data"]["buyers"].slice(-1)[0]["stock_price"];
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error;
  }
};

const emitDataToClients = async () => {
  const data = await fetchData();
  io.emit("message", data);
};

setInterval(emitDataToClients, 1000);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
