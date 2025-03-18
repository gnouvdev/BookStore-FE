import React from "react";
import Banner from "./Banner";
import TopSales from "./TopSellers";
import Recommended from "./Recommended";
import News from "./News";
import GenreBooks from "../../components/GenreBooks";
import MiniBanner from "../../components/miniBanner";

const Home = () => {
  return (
    <>
      <Banner />
      <Recommended />
      <GenreBooks genre={"Fiction"} />
      <MiniBanner genre1={"Business1"} genre2={"Business2"} />
      <GenreBooks genre={"Business"} />
      <MiniBanner genre1={"Horror1"} genre2={"Horror2"} />
      <GenreBooks genre={"Horror"} />
      <MiniBanner genre1={"Adventure1"} genre2={"Adventure2"} />
      <GenreBooks genre={"Adventure"} />
      {/* <TopSales /> */}
    
      <News />
    </>
  );
};

export default Home;
