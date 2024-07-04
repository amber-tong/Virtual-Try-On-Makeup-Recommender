import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { updateMakeupOverlays } from './makeupUtils';
import * as tf from '@tensorflow/tfjs';

const WebcamStream = ({ tryOnProduct }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayContainerRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [opacity, setOpacity] = useState(0.7); // Default opacity value
  
    // Function to start the webcam stream
    const setupWebcam = useCallback(async () => {
      if (navigator.mediaDevices.getUserMedia && videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        videoRef.current.srcObject = stream;
      }
    }, []);
  
    // Function to stop the webcam stream
    const stopWebcam = useCallback(() => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }, []);
        
    useEffect(() => {
        // Load models
        const loadModels = async () => {
            try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            console.log('Models loaded');
            // After loading, check if they are loaded correctly
            console.log('TinyFaceDetectorModel loaded:', faceapi.nets.tinyFaceDetector.isLoaded);
            console.log('FaceLandmark68Net loaded:', faceapi.nets.faceLandmark68Net.isLoaded);
            setModelsLoaded(true);
            } catch (error) {
            console.error('Model loading failed:', error);
            }
        };

        loadModels();


        // Set the backend and wait for it to be ready
        const initializeTFBackend = async () => {
            await tf.setBackend('webgl');
            await tf.ready();
            console.log('TensorFlow.js is ready with the WebGL backend');
        };

        initializeTFBackend();

        // Setup the webcam
        setupWebcam();

        // Cleanup function to stop the webcam on unmount
        return () => {
            stopWebcam();
        };
    }, [setupWebcam, stopWebcam]);

    // Cleanup and restart the webcam stream when `tryOnProduct` changes
    useEffect(() => {
        // Clean up the previous canvas and stop the webcam
        stopWebcam();

        // Clear the previous overlays from the container
        if (overlayContainerRef.current) {
        overlayContainerRef.current.innerHTML = '';
        }

        // Restart the webcam for the new product
        setupWebcam();

        // Cleanup function will run when `tryOnProduct` changes again
        return () => {
        stopWebcam();
        };
    }, [tryOnProduct, setupWebcam, stopWebcam]);

  // Canvas creation
  useEffect(() => {
    if (modelsLoaded && videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
            // Check if the overlay container is not null
            if (!overlayContainerRef.current) {
              console.error('Overlay container is null');
              return;
            }
            const canvas = faceapi.createCanvasFromMedia(videoRef.current);
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.width = 640; // Set the canvas width
            canvas.height = 480; // Set the canvas height
            canvasRef.current = canvas;
            //overlayContainerRef.current.insertBefore(canvas, overlayContainerRef.current.firstChild);

            //overlayContainerRef.current.appendChild(canvas);
            // Append canvas to overlay container with null check
            try {
                overlayContainerRef.current.appendChild(canvas);
            } catch (error) {
                console.error('Error appending canvas to overlay container:', error);
            }


            //const displaySize = { width: videoRef.current.offsetWidth, height: videoRef.current.offsetHeight };
            const displaySize = { width: 640, height: 480};
            faceapi.matchDimensions(canvas, displaySize);
      };
    }
  }, [modelsLoaded]);

useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => {
        if (modelsLoaded) {
          // Match canvas size to the video element's display size
          //const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
          const displaySize = { width: 640, height: 480 };
          faceapi.matchDimensions(canvasRef.current, displaySize);
        }
      });
    }
  }, [modelsLoaded]);

  const handlePlay = useCallback(async () => {
        console.log('Entering handlePlay:', videoRef.current, canvasRef.current);
        if (modelsLoaded && tryOnProduct && videoRef.current && canvasRef.current) {
          console.log('All prerequisites met');
          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 });
          const result = await faceapi.detectSingleFace(videoRef.current, options).withFaceLandmarks();
          
          if (result && videoRef.current) {
            console.log('Detection successful');
            const resizedResult = faceapi.resizeResults(result, videoRef.current);
            updateMakeupOverlays(resizedResult, tryOnProduct, overlayContainerRef.current, videoRef.current, opacity);
            console.log('overlayContainerRef innerHTML after append:', overlayContainerRef.current.innerHTML);
          } else {
            console.log('No face detected');
          }
        } else {
          console.log('Prerequisites not met:', {modelsLoaded, tryOnProduct, videoRef: videoRef.current, canvasRef: canvasRef.current});
        }
    }, [modelsLoaded, tryOnProduct, opacity]); // Add dependencies to useCallback

    useEffect(() => {
      let interval;
      if (modelsLoaded && tryOnProduct && videoRef.current && canvasRef.current) {
        interval = setInterval(() => {
          handlePlay();
        }, 50);
      }
  
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }, [modelsLoaded, tryOnProduct, handlePlay]); // Add handlePlay as a dependency
  
  
  return (
    <div className="webcam-and-slider-container">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline width="640" height="480" style={{ transform: 'scaleX(-1)' }}/>
        <div ref={overlayContainerRef} className="overlay-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}>
        </div>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)'}} />
      </div>
      <div className="opacity-slider-container">
        <label htmlFor="opacity">Makeup Opacity: </label>
        <input 
            type="range" 
            id="opacity" 
            name="opacity" 
            min="0" 
            max="1" 
            step="0.1" 
            value={opacity}
            onChange={(e) => setOpacity(e.target.value)}
        />
        <span>{opacity}</span>
      </div>
    </div>
  );
  
};

export default WebcamStream;