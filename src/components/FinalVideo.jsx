import React, { useState, useEffect } from "react";

const FinalVideo = () => {
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);

  useEffect(() => {
    const fetchFinalVideo = async () => {
      try {
        const response = await fetch(`https://backend-webrtc-video-recorder.onrender.com/api/final-video`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setFinalVideoUrl(url);
        } else {
          console.error("Error fetching final video:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching final video:", error);
      }
    };

    fetchFinalVideo();
  }, []);

  const handleDownload = () => {
    if (finalVideoUrl) {
      const link = document.createElement("a");
      link.href = finalVideoUrl;
      link.download = "merged_video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Final Merged Video
      </h1>
      {finalVideoUrl ? (
        <div className="flex flex-col items-center">
          <video
            src={finalVideoUrl}
            controls
            autoPlay
           // loop
            width="600"
            className="mb-4 border-2 border-gray-300 rounded-lg shadow-md object-cover"
          />
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Download Video
          </button>
        </div>
      ) : (
        <p className="text-xl text-gray-700">Loading...</p>
      )}
    </div>
  );
};

export default FinalVideo;
