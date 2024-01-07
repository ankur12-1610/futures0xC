import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Homepage from "./pages/Homepage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage></Homepage>}>
            <Route path="about" element={<Homepage></Homepage>}></Route>
            <Route path="docs" element={<Homepage></Homepage>}></Route>
            <Route path="apis" element={<Homepage></Homepage>}></Route>
          </Route>
          <Route path="dashboard">
            <Route path="trade">
              <Route path="X-APT-24H" element={<Dashboard></Dashboard>}></Route>
              <Route path="X-APT-48H" element={<Dashboard></Dashboard>}></Route>
              <Route path="X-APT-72H" element={<Dashboard></Dashboard>}></Route>
            </Route>
            <Route path="portfolio" element={<Dashboard></Dashboard>}></Route>
            <Route path="markets" element={<Dashboard></Dashboard>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
