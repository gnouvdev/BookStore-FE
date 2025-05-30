import React from "react";
import Banner from "./Banner";
import TopSales from "./TopSellers";
import Recommended from "./Recommended";
import News from "./News";
import GenreBooks from "../../components/GenreBooks";
import Recommendationsv2 from "../../components/Recommendationsv2";
import InteractiveBookExplorer from "./InteractiveBook";
import ChatBox from "../../components/ChatBox";
import SimplifiedMiniBanner from './../../components/miniBanner';
const Home = () => {
  return (
    <>
      <Banner />
      <Recommended />
      <Recommendationsv2 />
      <InteractiveBookExplorer />
      <GenreBooks genre={"Fiction"} />
      <SimplifiedMiniBanner genre1={"Business1"} genre2={"Business2"} />
      <GenreBooks genre={"Bussines"} />
      <SimplifiedMiniBanner genre1={"Horror1"} genre2={"Horror2"} />
      <GenreBooks genre={"Horror"} />
      <SimplifiedMiniBanner genre1={"Adventure1"} genre2={"Adventure2"} />
      <GenreBooks genre={"Adventure"} />
      <SimplifiedMiniBanner genre1={"Horror1"} genre2={"Horror2"} />
      <GenreBooks genre={"Manga"} />
      {/* <TopSales /> */}
      <ChatBox />
      <News />
    </>
  );
};

export default Home;
