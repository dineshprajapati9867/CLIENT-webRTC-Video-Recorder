import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";

const Video1 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [text, setText] = useState(null);
  const [showElements, setShowElements] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [resumeTime, setResumeTime] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/give-text`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            setText(firstItem.videoText);
          } else {
            console.error("No data available");
          }
        } else {
          console.error("Error fetching text:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    };

    fetchText();
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [videoRef.current, streamRef.current]);

  const handleStart = async () => {
    try {
      setStartTime(Date.now());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("stream", stream);

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log("Video stream started and playing");
        };
      } else {
        console.error("Video reference is not set");
      }

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setShowElements(true);
      setIsLiveRecording(true);
      setUploadStatus(null);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handlePause = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.pause();
      setIsRecording(false);
      setIsPaused(true);
      setResumeTime(Date.now());
    }
  };

  const handleResume = () => {
    if (mediaRecorder && isPaused) {
      mediaRecorder.resume();
      setIsRecording(true);
      setIsPaused(false);
      setStartTime(Date.now() - (resumeTime - startTime));
    }
  };

  const handleStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setStartTime(Date.now() - (resumeTime - startTime));
      setIsLiveRecording(false); // Reset live recording indicator
    }
  };

  const handleUpload = async () => {
    if (recordedChunks.length > 0) {
      setIsUploading(true);
      setUploadStatus("Uploading...");

      try {
        const combinedBlob = new Blob(recordedChunks, { type: "video/mp4" });
        const formData = new FormData();
        formData.append("videos", combinedBlob, "video1.mp4");

        const uploadResponse = await fetch(
          `http://localhost:3001/api/upload-videos`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const { files } = await uploadResponse.json();
          setUploadStatus("Video uploaded successfully");
          console.log("Uploaded videos:", files);
        } else {
          const errorText = await uploadResponse.text();
          setUploadStatus(`Error uploading video: ${errorText}`);
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        setUploadStatus("Error uploading video");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-1 text-gray-800">Video Record 1</h1>
      <Timer isActive={isRecording} onComplete={handleStop} />
      <p className="text-lg mb-4 text-gray-600">
        {isRecording ? "Recording" : isPaused ? "Paused" : "Stopped"}
      </p>
      <div className="relative max-w-lg mb-2 h-[50vh] lg:h-[52vh] w-full">
        {showElements && (
          <>
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full border-2 border-gray-400 rounded-lg"
              style={{
                display: isRecording || isPaused ? "block" : "none",
              }}
            />
            {!isRecording && recordedChunks.length > 0 && (
              <video
                src={URL.createObjectURL(
                  new Blob(recordedChunks, { type: "video/mp4" })
                )}
                controls
                autoPlay
                className="w-full h-full border-2 border-gray-400 rounded-lg"
              />
            )}
            {isRecording && text && (
              <div className="absolute z-10 top-0 left-0 bg-gray-100 border-2 border-gray-200 rounded-lg shadow-lg py-4">
                <p className="text-sm font-semibold text-red-800">{text}</p>
              </div>
            )}
            {isLiveRecording && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Paused
              </div>
            )}
          </>
        )}
      </div>

      {uploadStatus && (
        <p
          className={`text-lg mb-4 ${
            uploadStatus.includes("successfully")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <button
          onClick={handleStart}
          disabled={isRecording}
          className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRecording}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={handleResume}
          disabled={!isPaused}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
        >
          Resume
        </button>
        <button
          onClick={handleStop}
          disabled={!isRecording && !isPaused}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          Stop
        </button>
        <button
          onClick={handleUpload}
          disabled={recordedChunks.length === 0 || isUploading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          Upload
        </button>
      </div>
      <button
        onClick={() => navigate("/video-2")}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition  "
      >
        Next
      </button>
    </div>
  );
};

export default Video1;
