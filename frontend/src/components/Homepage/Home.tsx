import React from "react";
import SectionOne from "./Homeroute/SectionOne";
import SectionTwo from "./Homeroute/SectionTwo";
import SectionThree from "./Homeroute/SectionThree";
import SectionFour from "./Homeroute/SectionFour";

const Home: React.FC = () => {
  return (
    <>
      <SectionOne></SectionOne>
      <SectionTwo></SectionTwo>
      {/* <SectionThree></SectionThree> */}
      <SectionFour></SectionFour>
    </>
  );
};

export default Home;
