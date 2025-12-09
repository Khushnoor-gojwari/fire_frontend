import { useEffect, useRef, useState, useCallback } from "react";

export default function LiveDetect() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [state, setState] = useState({
    isRunning: false,
    alert: "",
    fireDetected: false,
    smokeDetected: false,
    detectionCount: 0,
    cameraError: "",
    selectedCamera: "",
    cameras: [],
    fps: 15,
    isMobile: false,
    voiceEnabled: true,
    detectionData: [],
    isLoading: false,
    showControls: true,
    processingFps: 2, // Process only 2 FPS
    lastProcessed: 0,
    frameCounter: 0,
    skipFrames: 7, // Skip frames to achieve target processing FPS
    stats: {
      framesSent: 0,
      framesProcessed: 0,
      avgProcessingTime: 0,
      fps: 0
    }
  });

  const statsRef = useRef({
    framesSent: 0,
    framesProcessed: 0,
    processingTimes: [],
    lastFpsUpdate: 0,
    frameCount: 0
  });

  // Check device type and get cameras
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setState(prev => ({ ...prev, isMobile }));
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
    
    // Get available cameras
    getCameras();
    
    return () => {
      stopDetection();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setState(prev => ({
        ...prev,
        cameras: videoDevices,
        selectedCamera: videoDevices[0]?.deviceId || '',
        cameraError: ''
      }));
      
    } catch (error) {
      console.error("Camera permission error:", error);
      setState(prev => ({
        ...prev,
        cameraError: "Please allow camera access to continue"
      }));
    }
  };

  const updateStats = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - statsRef.current.lastFpsUpdate;
    
    if (timeDiff >= 1000) { // Update FPS every second
      const currentFps = (statsRef.current.frameCount * 1000) / timeDiff;
      
      setState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          fps: Math.round(currentFps),
          framesSent: statsRef.current.framesSent,
          framesProcessed: statsRef.current.framesProcessed
        }
      }));
      
      statsRef.current.frameCount = 0;
      statsRef.current.lastFpsUpdate = now;
    }
  }, []);

  const sendFrameToBackend = useCallback((timestamp) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure canvas matches video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Frame skipping logic
    statsRef.current.frameCounter = (statsRef.current.frameCounter + 1) % state.skipFrames;
    if (statsRef.current.frameCounter !== 0) {
      // Skip this frame
      return;
    }

    // Limit processing to target FPS
    const now = Date.now();
    const timeSinceLast = now - state.lastProcessed;
    const minInterval = 1000 / state.processingFps; // e.g., 500ms for 2 FPS
    
    if (timeSinceLast < minInterval) {
      // Too soon to send another frame
      return;
    }

    // Convert to base64 with optimized quality
    const quality = state.isMobile ? 0.4 : 0.6; // Lower quality for faster transfer
    const frameData = canvas.toDataURL("image/jpeg", quality);

    // Send frame with timestamp
    wsRef.current.send(JSON.stringify({ 
      frame: frameData,
      timestamp: now
    }));
    
    statsRef.current.framesSent++;
    statsRef.current.frameCount++;
    
    setState(prev => ({
      ...prev,
      lastProcessed: now
    }));
    
    updateStats();
  }, [state.processingFps, state.skipFrames, state.lastProcessed, updateStats]);

  const drawVideoWithDetections = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!state.isRunning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ensure canvas matches video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw detections if available
    if (state.detectionData && state.detectionData.length > 0) {
      state.detectionData.forEach((det) => {
        const { box, label, confidence } = det;
        const [x1, y1, x2, y2] = box;

        // Colors based on detection type
        const isFire = label.toLowerCase().includes("fire");
        const isSmoke = label.toLowerCase().includes("smoke");
        
        const color = isSmoke ? "rgb(0, 165, 255)" :
                     isFire ? "rgb(255, 0, 0)" :
                     "rgb(0, 255, 0)";

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        // Draw label
        const labelText = `${label} ${(confidence * 100).toFixed(1)}%`;
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = color;
        ctx.fillText(labelText, x1, Math.max(y1 - 10, 20));
      });
    }

    // Draw status overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 60);
    
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Detections: ${state.detectionCount}`, 20, 30);
    ctx.fillText(`FPS: ${state.stats.fps}`, 20, 50);
    ctx.fillText(`Processed: ${state.processingFps}/s`, 20, 70);

    // Animation loop
    animationFrameRef.current = requestAnimationFrame(drawVideoWithDetections);
  }, [state.isRunning, state.detectionData, state.detectionCount, state.stats.fps, state.processingFps]);

  const startDetection = async () => {
    if (state.isRunning) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const constraints = {
        video: {
          deviceId: state.selectedCamera ? { exact: state.selectedCamera } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: state.fps }
        },
        audio: false
      };
      
      if (state.isMobile && !state.selectedCamera) {
        constraints.video.facingMode = { ideal: 'environment' };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      videoRef.current.srcObject = stream;
      
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve);
        };
      });
      
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Connect WebSocket
      wsRef.current = new WebSocket("wss://backend-fire-smoke.onrender.com/api/realtime/stream");

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setState(prev => ({
          ...prev,
          isRunning: true,
          isLoading: false
        }));

        // Reset stats
        statsRef.current = {
          framesSent: 0,
          framesProcessed: 0,
          processingTimes: [],
          lastFpsUpdate: Date.now(),
          frameCount: 0,
          frameCounter: 0
        };

        // Start animation loop
        drawVideoWithDetections();
        
        // Start frame sending loop
        const sendInterval = setInterval(() => {
          if (wsRef.current?.readyState === 1 && videoRef.current) {
            sendFrameToBackend(Date.now());
          }
        }, 1000 / 30); // Send frames at 30 FPS
        
        // Store interval for cleanup
        window.sendInterval = sendInterval;
        
        // Start stats update loop
        window.statsInterval = setInterval(updateStats, 1000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === "frame_received") {
            // Just an acknowledgement, no processing needed
            return;
          }
          
          // Update stats
          statsRef.current.framesProcessed++;
          if (data.processing_time) {
            statsRef.current.processingTimes.push(data.processing_time);
            if (statsRef.current.processingTimes.length > 10) {
              statsRef.current.processingTimes.shift();
            }
          }
          
          // Handle detection data
          if (data.alert) {
            setState(prev => ({ ...prev, alert: data.alert }));
          }
          
          const detections = data.detections || [];
          
          setState(prev => ({
            ...prev,
            detectionData: detections,
            fireDetected: data.fire_detected || false,
            smokeDetected: data.smoke_detected || false,
            detectionCount: detections.length,
            stats: {
              ...prev.stats,
              avgProcessingTime: statsRef.current.processingTimes.length > 0
                ? statsRef.current.processingTimes.reduce((a, b) => a + b, 0) / statsRef.current.processingTimes.length
                : 0
            }
          }));
          
          // Voice alerts
          if (state.voiceEnabled && data.voice_alert) {
            speakAlert(data.voice_alert);
          }
          
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setState(prev => ({ 
          ...prev, 
          alert: "Connection error. Make sure backend server is running.",
          isLoading: false
        }));
      };
      
      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
      };

    } catch (error) {
      console.error("Camera start error:", error);
      let errorMsg = "Failed to start camera: ";
      
      if (error.name === 'NotAllowedError') {
        errorMsg = "Camera permission was denied. Please allow camera access.";
      } else if (error.name === 'NotFoundError') {
        errorMsg = "No camera found on this device.";
      } else {
        errorMsg += error.message;
      }
      
      setState(prev => ({ 
        ...prev, 
        cameraError: errorMsg,
        isRunning: false,
        isLoading: false
      }));
    }
  };

  const stopDetection = () => {
    setState(prev => ({ 
      ...prev, 
      isRunning: false,
      alert: "",
      fireDetected: false,
      smokeDetected: false,
      detectionCount: 0,
      detectionData: []
    }));

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (window.sendInterval) {
      clearInterval(window.sendInterval);
    }

    if (window.statsInterval) {
      clearInterval(window.statsInterval);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const speakAlert = (text) => {
    if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    speechSynthesis.speak(utterance);
  };

  const handleCameraChange = async (deviceId) => {
    if (state.isRunning) {
      stopDetection();
      setTimeout(() => {
        setState(prev => ({ ...prev, selectedCamera: deviceId }));
        startDetection();
      }, 500);
    } else {
      setState(prev => ({ ...prev, selectedCamera: deviceId }));
    }
  };

  const handleProcessingFpsChange = (newFps) => {
    const skipFrames = Math.max(1, Math.floor(30 / newFps));
    setState(prev => ({
      ...prev,
      processingFps: newFps,
      skipFrames: skipFrames
    }));
  };

  const refreshCameras = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await getCameras();
    setState(prev => ({ ...prev, isLoading: false }));
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">
        <i className="fas fa-fire text-danger me-2"></i>
        Live Fire & Smoke Detection (Optimized)
      </h1>

      {state.cameraError && (
        <div className="alert alert-danger alert-dismissible fade show mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {state.cameraError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setState(prev => ({ ...prev, cameraError: '' }))}
          ></button>
        </div>
      )}

      {state.alert && (
        <div className={`alert ${state.fireDetected ? 'alert-danger' : 'alert-warning'} mb-4`}>
          <div className="d-flex align-items-center">
            <i className={`fas fa-${state.fireDetected ? 'fire' : 'smog'} fa-2x me-3`}></i>
            <div>
              <h4 className="alert-heading mb-1">{state.alert}</h4>
              <p className="mb-0">
                {state.fireDetected 
                  ? 'Emergency! Fire detected. Take immediate action!'
                  : 'Warning! Smoke detected. Investigate potential fire source.'}
              </p>
            </div>
            <button 
              className="btn-close ms-auto"
              onClick={() => setState(prev => ({ ...prev, alert: '' }))}
            ></button>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-4 col-md-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">
                  <i className="fas fa-sliders-h me-2"></i>
                  Controls
                </h4>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setState(prev => ({ ...prev, showControls: !prev.showControls }))}
                >
                  <i className={`fas fa-chevron-${state.showControls ? 'up' : 'down'}`}></i>
                </button>
              </div>
              
              {state.showControls && (
                <>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">
                        <i className="fas fa-camera me-2"></i>
                        Camera
                      </label>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={refreshCameras}
                        disabled={state.isLoading}
                      >
                        <i className="fas fa-sync-alt"></i>
                      </button>
                    </div>
                    <select 
                      className="form-select"
                      value={state.selectedCamera}
                      onChange={(e) => handleCameraChange(e.target.value)}
                      disabled={state.isRunning || state.isLoading}
                    >
                      <option value="">-- Auto Select --</option>
                      {state.cameras && state.cameras.length > 0 ? (
                        state.cameras.map((cam, index) => (
                          <option key={cam.deviceId} value={cam.deviceId}>
                            {cam.label || `Camera ${index + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No cameras detected</option>
                      )}
                    </select>
                    <small className="text-muted">
                      {state.cameras ? state.cameras.length : 0} camera(s) available
                    </small>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Processing Speed: {state.processingFps} FPS
                    </label>
                    <input 
                      type="range" 
                      className="form-range"
                      min="1" 
                      max="5"
                      value={state.processingFps}
                      onChange={(e) => handleProcessingFpsChange(parseInt(e.target.value))}
                      disabled={state.isLoading}
                    />
                    <small className="text-muted">
                      Lower FPS = less freezing, faster response
                    </small>
                  </div>
                  
                  <div className="d-grid mb-4">
                    <button
                      className={`btn btn-lg ${state.isRunning ? 'btn-danger' : 'btn-success'}`}
                      onClick={state.isRunning ? stopDetection : startDetection}
                      disabled={state.isLoading}
                    >
                      {state.isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Loading...
                        </>
                      ) : state.isRunning ? (
                        <>
                          <i className="fas fa-stop me-2"></i>
                          Stop Detection
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play me-2"></i>
                          Start Detection
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={state.voiceEnabled}
                        onChange={() => setState(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                        id="voiceSwitch"
                        disabled={state.isLoading}
                      />
                      <label className="form-check-label" htmlFor="voiceSwitch">
                        <i className="fas fa-volume-up me-2"></i>
                        Voice Alerts
                      </label>
                    </div>
                  </div>
                  
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-chart-bar me-2"></i>
                        Performance Stats
                      </h6>
                      <div className="row text-center">
                        <div className="col-6 mb-3">
                          <div className="fw-bold fs-4">{state.stats.fps}</div>
                          <small className="text-muted">Display FPS</small>
                        </div>
                        <div className="col-6 mb-3">
                          <div className="fw-bold fs-4">{state.processingFps}</div>
                          <small className="text-muted">Process FPS</small>
                        </div>
                        <div className="col-6">
                          <div className="small">
                            <div>Frames Sent:</div>
                            <div className="fw-bold">{state.stats.framesSent}</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="small">
                            <div>Frames Processed:</div>
                            <div className="fw-bold">{state.stats.framesProcessed}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-8 col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">
                  <i className="fas fa-desktop me-2"></i>
                  Live Feed
                </h4>
                <div className={`badge ${state.isRunning ? 'bg-success' : 'bg-secondary'}`}>
                  {state.isRunning ? (
                    <>
                      <span className="spinner-grow spinner-grow-sm me-1"></span>
                      LIVE
                    </>
                  ) : 'READY'}
                </div>
              </div>
              
              <div className="video-container position-relative bg-dark rounded overflow-hidden mb-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="d-none"
                />
                
                <canvas
                  ref={canvasRef}
                  className="w-100 h-100"
                  style={{ 
                    display: 'block',
                    objectFit: 'contain'
                  }}
                />
                
                {state.isRunning && (
                  <>
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark bg-opacity-75">
                        <i className="fas fa-bolt me-1"></i>
                        Live
                      </span>
                    </div>
                    
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-info bg-opacity-75">
                        Processing: {state.processingFps} FPS
                      </span>
                    </div>
                    
                    {state.fireDetected && (
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-danger">
                          <i className="fas fa-fire me-1"></i>
                          FIRE!
                        </span>
                      </div>
                    )}
                    
                    {state.smokeDetected && !state.fireDetected && (
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-warning">
                          <i className="fas fa-smog me-1"></i>
                          SMOKE
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {!state.isRunning && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center text-white">
                      <i className="fas fa-video fa-4x mb-3 opacity-50"></i>
                      <h5>Camera Feed</h5>
                      <p className="opacity-75">
                        Click "Start Detection" to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {(state.fireDetected || state.smokeDetected) && (
                <div className="row g-3 mb-4">
                  {state.fireDetected && (
                    <div className="col-md-6">
                      <div className="alert alert-danger py-2">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-fire fa-2x me-3"></i>
                          <div>
                            <h6 className="mb-0">Fire Detected!</h6>
                            <p className="mb-0 small">Take immediate action!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {state.smokeDetected && (
                    <div className="col-md-6">
                      <div className="alert alert-warning py-2">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-smog fa-2x me-3"></i>
                          <div>
                            <h6 className="mb-0">Smoke Detected</h6>
                            <p className="mb-0 small">Investigate immediately!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 pt-3 border-top">
                <h6 className="mb-2">
                  <i className="fas fa-info-circle me-2"></i>
                  Optimization Features:
                </h6>
                <ul className="small text-muted mb-0">
                  <li>Thread-based frame processing</li>
                  <li>Frame skipping for target FPS</li>
                  <li>Reduced image quality for faster transfer</li>
                  <li>Smart frame queue (keeps only latest 2 frames)</li>
                  <li>Configurable processing rate (1-5 FPS)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bootstrap & Font Awesome */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      
      {/* Custom CSS */}
      <style jsx>{`
        .video-container {
          min-height: 400px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .video-container {
            min-height: 300px;
          }
        }
        
        canvas {
          display: block;
        }
      `}</style>
    </div>
  );
}
