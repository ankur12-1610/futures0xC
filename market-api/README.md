## Market data API

- Create `.env` file in this directory and store `PORT` and `MODULE_ADDRESS`

### Real time market data

Run the following:

```
npm i && node index.js
```

This will start a websocket (SocketIO) server at `PORT`, which fetches real time market data every second. You can listen on this websocket, to get real time updates.
