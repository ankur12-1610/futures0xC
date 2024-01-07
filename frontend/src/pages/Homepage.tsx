import { useLocation } from "react-router-dom";
import Navbar from "../components/Homepage/Navbar";
import Home from "../components/Homepage/Home";

const Homepage: React.FC = () => {
  const location = useLocation();
  const currLocation = location.pathname;
  return (
    <>
      <div className="svg-background">
        <Navbar></Navbar>
        {currLocation == "/" ? <Home></Home> : <></>}
      </div>
    </>
  );
};

export default Homepage;
