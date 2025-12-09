import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ImageDetect() {
  // Load state from localStorage on component mount
  const loadState = () => {
    const savedState = localStorage.getItem('imageDetectState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      selectedFile: null,
      originalImage: null,
      annotatedImage: null,
      fire: false,
      smoke: false,
      detections: [],
      loading: false,
      error: "",
      fileName: "",
      fileSize: ""
    };
  };

  const [state, setState] = useState(loadState);
  const fileInputRef = useRef(null);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('imageDetectState', JSON.stringify(state));
  }, [state]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset previous results but keep error state if any
    const currentError = state.error;
    setState(prev => ({
      ...prev,
      selectedFile: file,
      originalImage: null,
      annotatedImage: null,
      fire: false,
      smoke: false,
      detections: [],
      loading: false,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + " KB",
      error: currentError // Keep error if it exists
    }));
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setState(prev => ({
        ...prev,
        error: "Please select an image file (JPEG, PNG, etc.)"
      }));
      return;
    }
    
    // Create preview of original image
    const reader = new FileReader();
    reader.onload = (event) => {
      setState(prev => ({
        ...prev,
        originalImage: event.target.result,
        error: ""
      }));
    };
    reader.readAsDataURL(file);
  };

  // Run detection
  const handleDetect = async () => {
    if (!state.selectedFile) {
      setState(prev => ({ ...prev, error: "Please select an image first" }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: "" }));

    try {
      const formData = new FormData();
      formData.append("file", state.selectedFile);

      // Call the combined endpoint
      const response = await axios.post(
        "http://localhost:8000/api/image/upload/combined",
        formData,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
          }
        }
      );

      // Set detection results
      setState(prev => ({
        ...prev,
        fire: response.data.fire_detected,
        smoke: response.data.smoke_detected,
        detections: response.data.detections || [],
        annotatedImage: response.data.annotated_image,
        loading: false
      }));
      
      console.log(`Detection complete: ${response.data.detection_count || response.data.detections?.length || 0} objects found`);
      
    } catch (err) {
      console.error("Detection error:", err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.detail || "Failed to process image",
        loading: false
      }));
    }
  };

  // Reset all states
  const resetResults = () => {
    setState(prev => ({
      ...prev,
      originalImage: null,
      annotatedImage: null,
      fire: false,
      smoke: false,
      detections: [],
      error: ""
    }));
  };

  // Clear everything including file selection
  const handleClearAll = () => {
    setState({
      selectedFile: null,
      originalImage: null,
      annotatedImage: null,
      fire: false,
      smoke: false,
      detections: [],
      loading: false,
      error: "",
      fileName: "",
      fileSize: ""
    });
    
    localStorage.removeItem('imageDetectState');
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download image
  const downloadImage = (imageData, filename) => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger file input click
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Resume detection on component mount if we have an image but no results
  useEffect(() => {
    if (state.originalImage && !state.annotatedImage && state.selectedFile) {
      console.log("Resuming detection session...");
    }
  }, []);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">🔥 Image Fire & Smoke Detection</h1>

      {/* Resume Notification */}
      {state.originalImage && !state.annotatedImage && !state.loading && (
        <div className="alert alert-info mb-4">
          <i className="fas fa-info-circle me-2"></i>
          You have an uploaded image ready for detection.
          <button 
            className="btn btn-sm btn-info ms-3"
            onClick={handleDetect}
          >
            <i className="fas fa-play me-1"></i>Detect Now
          </button>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {state.error}
        </div>
      )}

      {/* Loading Indicator */}
      {state.loading && (
        <div className="card shadow-sm mb-4">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="card-title">Processing Image...</h5>
            <p className="text-muted mb-0">Analyzing for fire and smoke detection</p>
          </div>
        </div>
      )}

      {/* File Selection Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-4">
            <i className="fas fa-image me-2 text-primary"></i>
            1. Select & Analyze Image
          </h4>
          
          <div className="border-dashed p-4 text-center mb-3 rounded bg-light">
            <button 
              onClick={handleSelectClick}
              className="btn btn-primary btn-lg mb-3"
              disabled={state.loading}
            >
              <i className="fas fa-folder-open me-2"></i>
              Choose Image File (png and jpeg )
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="d-none"
            />
            
            {state.fileName && (
              <div className="mt-3">
                <div className="fw-bold">
                  <i className="fas fa-file-image me-2"></i>
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
              onClick={handleDetect}
              disabled={!state.selectedFile || state.loading}
              className="btn btn-success"
            >
              {state.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-2"></i>
                  Detect Objects
                </>
              )}
            </button>
            
            <button 
              onClick={handleClearAll}
              className="btn btn-danger"
            >
              <i className="fas fa-redo me-2"></i>
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Detection Results */}
      {(state.fire || state.smoke || state.detections.length > 0) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-4">
              <i className="fas fa-chart-bar me-2 text-info"></i>
              Detection Results
            </h4>
            
            {/* Fire/Smoke Alerts */}
            {(state.fire || state.smoke) && (
              <div className="row mb-4">
                {state.fire && (
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-danger d-flex align-items-center">
                      <i className="fas fa-fire fa-2x me-3"></i>
                      <div>
                        <h5 className="alert-heading mb-1">🔥 FIRE DETECTED!</h5>
                        <p className="mb-0">Potential fire hazard identified</p>
                      </div>
                    </div>
                  </div>
                )}
                {state.smoke && (
                  <div className="col-md-6 mb-3">
                    <div className="alert alert-warning d-flex align-items-center">
                      <i className="fas fa-smog fa-2x me-3"></i>
                      <div>
                        <h5 className="alert-heading mb-1">💨 SMOKE DETECTED!</h5>
                        <p className="mb-0">Smoke detected which may indicate fire</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detection List */}
            {state.detections.length > 0 && (
              <div>
                <h5 className="mb-3">
                  <i className="fas fa-list me-2"></i>
                  Detected Objects ({state.detections.length})
                </h5>
                <div className="row">
                  {state.detections.map((det, idx) => (
                    <div key={idx} className="col-lg-4 col-md-6 mb-3">
                      <div className="card border h-100">
                        <div className="card-body">
                          <div className={`fw-bold fs-5 mb-2 ${det.label.toLowerCase() === 'fire' ? 'text-danger' : 'text-success'}`}>
                            <i className={`fas fa-${det.label.toLowerCase() === 'fire' ? 'fire' : 'smog'} me-2`}></i>
                            {det.label}
                          </div>
                          <div className="mb-2">
                            <span className="text-muted">Confidence:</span>{' '}
                            <span className="fw-bold text-primary">
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <small className="text-muted">
                              <i className="fas fa-square me-1"></i>
                              Bounding Box: [{det.box.join(", ")}]
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Comparison */}
      {(state.originalImage || state.annotatedImage) && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title mb-0">
                <i className="fas fa-images me-2 text-success"></i>
                Image Comparison
              </h4>
              <div className="badge bg-primary">
                {state.detections.length} detections
              </div>
            </div>
            
            <div className="row">
              {/* Original Image */}
              {state.originalImage && (
                <div className="col-lg-6 mb-4 mb-lg-0">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h5 className="card-title text-center mb-3">
                        <i className="fas fa-upload me-2"></i>
                        Original Image
                      </h5>
                      
                      <div className="text-center mb-3">
                        <img 
                          src={state.originalImage} 
                          alt="Original" 
                          className="img-fluid rounded shadow-sm border"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => downloadImage(state.originalImage, `original_${state.fileName || 'image'}.jpg`)}
                        >
                          <i className="fas fa-download me-2"></i>
                          Download Original
                        </button>
                        <small className="text-muted text-center">
                          Original uploaded image without processing
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Annotated Image */}
              {state.annotatedImage && (
                <div className="col-lg-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h5 className="card-title text-center mb-3">
                        <i className="fas fa-search me-2"></i>
                        Detection Results
                      </h5>
                      
                      <div className="text-center mb-3 position-relative">
                        <img 
                          src={state.annotatedImage} 
                          alt="Detection Results" 
                          className="img-fluid rounded shadow-sm border"
                          style={{ maxHeight: '400px' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-dark bg-opacity-75">
                            <i className="fas fa-box me-1"></i>
                            Detected Objects
                          </span>
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-success"
                          onClick={() => downloadImage(state.annotatedImage, `detected_${state.fileName || 'image'}.jpg`)}
                        >
                          <i className="fas fa-download me-2"></i>
                          Download Processed Image
                        </button>
                        <small className="text-muted text-center">
                          Image with bounding boxes around detected objects
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Side-by-side comparison info */}
            <div className="mt-4 pt-3 border-top">
              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <i className="fas fa-id-card me-1"></i>
                    File: {state.fileName}
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
            How to use Image Detection:
          </h5>
          <ol className="mb-0">
            <li>Select an image file (JPEG, PNG, etc.)</li>
            <li>Click "Detect Objects" to analyze for fire/smoke</li>
            <li>View detection results and alerts</li>
            <li>Compare original vs processed images side-by-side</li>
            <li>Download either original or processed image</li>
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
          
          .col-lg-6 {
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}