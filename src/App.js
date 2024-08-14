import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Video1 from "./components/Video1";
import Video2 from "./components/Video2";
import Video3 from "./components/Video3";
import FinalVideo from "./components/FinalVideo";


const App = () => {
  return (
    <>
    
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Video1 />} />
          <Route path="/video-2" element={<Video2 />} />
          <Route path="/video-3" element={<Video3 />} />
          <Route path="/final-video" element={<FinalVideo />} />
        
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
