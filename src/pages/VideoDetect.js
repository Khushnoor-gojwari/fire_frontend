import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function VideoDetect() {
  // Load state from localStorage on component mount
  const loadState = () => {
    const savedState = localStorage.getItem('videoDetectState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      selectedFile: null,
      taskId: "",
      preview: "",
      status: "",
      progress: 0,
      resultVideo: "",
      fireDetected: false,
      smokeDetected: false,
      loading: false,
      fileName: "",
      fileSize: "",
      processedPreview: "",  // ADDED: For showing processed frame image
      frameCount: 0,        // ADDED: Total frames processed
      duration: 0           // ADDED: Video duration
    };
  };

  const [state, setState] = useState(loadState);
  const fileInputRef = useRef(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('videoDetectState', JSON.stringify(state));
  }, [state]);

  // Clean up polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      alert("Please select a video file (MP4, AVI, MOV, etc.)");
      return;
    }
    
    setState({
      selectedFile: file,
      taskId: "",
      preview: "",
      status: "",
      progress: 0,
      resultVideo: "",
      fireDetected: false,
      smokeDetected: false,
      loading: false,
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
      processedPreview: "",  // Reset processed preview
      frameCount: 0,        // Reset frame count
      duration: 0           // Reset duration
    });
  };

  // Upload video
  const uploadVideo = async () => {
    if (!state.selectedFile) {
      alert("Please select a video file first");
      return;
    }

    setState(prev => ({ ...prev, loading: true, status: "Uploading video..." }));

    try {
      const formData = new FormData();
      formData.append("file", state.selectedFile);

      const response = await axios.post(
        "https://backend-fire-smoke.onrender.com/api/video/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setState(prev => ({
        ...prev,
        taskId: response.data.task_id,
        preview: response.data.preview,
        status: "Video uploaded! Click 'Process' to analyze.",
        loading: false
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Start status polling
  const startStatusPolling = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const statusRes = await axios.get(`https://backend-fire-smoke.onrender.com/api/video/status/${taskId}`);
        const data = statusRes.data;
        
        setState(prev => ({ 
          ...prev, 
          progress: data.progress || 0,
          status: data.status === "processing" ? `Processing... ${data.progress}%` : prev.status
        }));
        
        if (data.status === "completed") {
          clearInterval(interval);
          setPollingInterval(null);
          setState(prev => ({
            ...prev,
            status: "Processing completed!",
            resultVideo: `https://backend-fire-smoke.onrender.com/api/video/stream/${taskId}`,
            processedPreview: data.processed_preview || "",  // ADDED: Get processed preview
            fireDetected: data.fire_detected,
            smokeDetected: data.smoke_detected,
            frameCount: data.frame_count || 0,              // ADDED: Get frame count
            duration: data.duration || 0,                   // ADDED: Get duration
            loading: false
          }));
        } else if (data.status === "error") {
          clearInterval(interval);
          setPollingInterval(null);
          setState(prev => ({
            ...prev,
            status: "Error processing video",
            loading: false
          }));
          alert("Processing failed: " + (data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Status poll error:", error);
        clearInterval(interval);
        setPollingInterval(null);
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 2000);
    
    setPollingInterval(interval);
  };

  // Process video
  const processVideo = async () => {
    if (!state.taskId) {
      alert("Please upload a video first");
      return;
    }

    setState(prev => ({ ...prev, loading: true, status: "Processing video..." }));

    try {
      // Start processing
      await axios.post(`https://backend-fire-smoke.onrender.com/api/video/process/${state.taskId}`);
      
      // Start polling for status
      startStatusPolling(state.taskId);
      
    } catch (error) {
      console.error("Process error:", error);
      alert("Failed to start processing");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Resume processing if task was in progress
  const resumeProcessing = () => {
    if (state.taskId && (state.status.includes("Processing") || state.status.includes("processing"))) {
      startStatusPolling(state.taskId);
      setState(prev => ({ ...prev, loading: true }));
    }
  };

  // Reset everything
  const resetAll = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setState({
      selectedFile: null,
      taskId: "",
      preview: "",
      status: "",
      progress: 0,
      resultVideo: "",
      fireDetected: false,
      smokeDetected: false,
      loading: false,
      fileName: "",
      fileSize: "",
      processedPreview: "",  // Reset processed preview
      frameCount: 0,        // Reset frame count
      duration: 0           // Reset duration
    });
    
    localStorage.removeItem('videoDetectState');
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Resume processing on component mount if needed
  useEffect(() => {
    if (state.taskId && state.status.includes("Processing")) {
      resumeProcessing();
    }
  }, []);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">🎥 Video Fire & Smoke Detection</h1>

      {/* Resume Notification */}
      {state.taskId && 
       !state.resultVideo && 
       (state.status.includes("Processing...") || 
        state.status.includes("Processing video") ||
        state.status.includes("Uploading")) && 
       !state.loading && (
        <div className="alert alert-warning mb-4">
          <i className="fas fa-info-circle me-2"></i>
          You have an incomplete video processing session.
          <button 
            className="btn btn-sm btn-warning ms-3"
            onClick={resumeProcessing}
          >
            Resume Monitoring
          </button>
        </div>
      )}

      {/* File Selection */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-4">
            <i className="fas fa-video me-2 text-primary"></i>
            1. Select & Upload Video
          </h4>
          
          <div className="border-dashed p-4 text-center mb-3 rounded bg-light">
            <button 
              onClick={triggerFileInput}
              className="btn btn-primary btn-lg mb-3"
              disabled={state.loading}
            >
              <i className="fas fa-folder-open me-2"></i>
              Choose Video File
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="d-none"
            />
            
            {state.fileName && (
              <div className="mt-3">
                <div className="fw-bold">
                  <i className="fas fa-file-video me-2"></i>
                  {state.fileName}
                </div>
                <div className="text-muted small">
                  Size: {state.fileSize}
                </div>
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button 
              onClick={uploadVideo}
              disabled={!state.selectedFile || state.loading}
              className="btn btn-success"
            >
              {state.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload me-2"></i>
                  Upload Video
                </>
              )}
            </button>
            
            <button 
              onClick={processVideo}
              disabled={!state.taskId || state.loading}
              className="btn btn-warning"
            >
              <i className="fas fa-cogs me-2"></i>
              Process Video
            </button>
            
            <button 
              onClick={resetAll}
              className="btn btn-danger"
            >
              <i className="fas fa-redo me-2"></i>
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      {state.status && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-info-circle me-2 text-info"></i>
              Processing Status
            </h4>
            
            <div className="alert alert-info">
              <i className="fas fa-sync-alt me-2"></i>
              {state.status}
            </div>
            
            {state.progress > 0 && (
              <div className="mt-3">
                <div className="progress mb-2" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar"
                    style={{ width: `${state.progress}%` }}
                    aria-valuenow={state.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {state.progress}%
                  </div>
                </div>
                <small className="text-muted">
                  Processing frames... This may take a few moments
                </small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {state.preview && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-image me-2 text-primary"></i>
              Original Video Preview
            </h4>
            <div className="text-center">
              <img 
                src={state.preview} 
                alt="Video preview" 
                className="img-fluid rounded shadow-sm"
                style={{ maxWidth: '400px' }}
              />
              <p className="text-muted mt-2 small">First frame preview of uploaded video</p>
            </div>
          </div>
        </div>
      )}

      {/* Detection Results */}
      {(state.fireDetected || state.smokeDetected) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
              Detection Results
            </h4>
            {state.fireDetected && (
              <div className="alert alert-danger">
                <i className="fas fa-fire me-2"></i>
                <strong>🔥 FIRE DETECTED</strong> in the video
              </div>
            )}
            {state.smokeDetected && (
              <div className="alert alert-warning">
                <i className="fas fa-smog me-2"></i>
                <strong>💨 SMOKE DETECTED</strong> in the video
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processed Video Preview - UPDATED SECTION */}
      {state.resultVideo && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="card-title mb-0">
                <i className="fas fa-check-circle me-2 text-success"></i>
                Analysis Results
              </h4>
              <div className="badge bg-primary">
                {state.frameCount} frames analyzed
              </div>
            </div>
            
            {/* Video Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-light bg-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">
                      <i className="fas fa-info-circle me-2"></i>
                      Video Analysis Summary
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Duration:</span>
                        <span className="fw-bold">
                          {state.duration ? `${Math.round(state.duration)} seconds` : 'Calculating...'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Frames processed:</span>
                        <span className="fw-bold">{state.frameCount || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Status:</span>
                        <span className="badge bg-success">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card border-light bg-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted">
                      <i className="fas fa-download me-2"></i>
                      Download Options
                    </h6>
                    <div className="d-grid">
                      <a 
                        href={state.resultVideo.replace('/stream/', '/download/')}
                        download={`processed_${state.fileName || 'video'}.mp4`}
                        className="btn btn-success btn-lg"
                      >
                        <i className="fas fa-video me-2"></i>
                        Download Processed Video
                      </a>
                      <small className="text-muted text-center mt-2">
                        Download the full video with all detected objects marked
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Processed Preview Image */}
            {state.processedPreview ? (
              <div className="text-center mb-4">
                <h5 className="mb-3">
                  <i className="fas fa-search me-2"></i>
                  Detection Preview (First Processed Frame)
                </h5>
                
                <div className="position-relative d-inline-block">
                  <img 
                    src={state.processedPreview} 
                    alt="First frame with detections" 
                    className="img-fluid rounded shadow-lg border"
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-dark bg-opacity-75">
                      <i className="fas fa-box me-1"></i>
                      Bounding boxes show detected objects
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    This shows the first frame with object detections. Download the full video to see all frames.
                  </small>
                </div>
              </div>
            ) : (
              <div className="alert alert-info text-center">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Loading processed preview image...
              </div>
            )}
            
            {/* Task Info */}
            <div className="mt-4 pt-3 border-top">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <i className="fas fa-id-card me-1"></i>
                    Task ID: <code>{state.taskId}</code>
                  </small>
                </div>
                <div className="col-md-6 text-md-end">
                  <small className="text-muted">
                    <i className="fas fa-save me-1"></i>
                    State is automatically saved
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title">
            <i className="fas fa-question-circle me-2"></i>
            How to use Video Detection:
          </h5>
          <ol className="mb-0">
            <li>Select a video file (MP4, AVI, MOV, etc.)</li>
            <li>Click "Upload Video" to upload to server</li>
            <li>Click "Process Video" to analyze for fire/smoke</li>
            <li>Monitor progress and view results when complete</li>
            <li>Download the processed video with all detections</li>
            <li>State is automatically saved - you can navigate away and return</li>
          </ol>
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
        .border-dashed {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .border-dashed:hover {
          border-color: #0d6efd;
          background-color: #f8f9fa;
        }
        
        .progress-bar {
          transition: width 0.5s ease;
        }
        
        @media (max-width: 768px) {
          .btn {
            width: 100%;
            margin-bottom: 10px;
          }
          
          .d-flex.flex-wrap {
            flex-direction: column;
          }
          
          .gap-2 > * {
            margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  );
}
