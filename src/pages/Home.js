import React from 'react';
import { Link } from "react-router-dom";

export default function Home() {
  const yolov8Models = [
    {
      size: 'Nano (n)',
      params: '3.2M',
      GFLOPs: '8.7',
      speed: 'Fastest',
      accuracy: 'Lowest',
      bestFor: 'Mobile & Edge devices',
      color: 'primary'
    },
    {
      size: 'Small (s)',
      params: '11.2M',
      GFLOPs: '28.6',
      speed: 'Fast',
      accuracy: 'Medium',
      bestFor: 'Balanced performance',
      color: 'success'
    },
    {
      size: 'Medium (m)',
      params: '25.9M',
      GFLOPs: '78.9',
      speed: 'Medium',
      accuracy: 'Good',
      bestFor: 'General purpose',
      color: 'warning'
    },
    {
      size: 'Large (l)',
      params: '43.7M',
      GFLOPs: '165.2',
      speed: 'Slow',
      accuracy: 'High',
      bestFor: 'High accuracy needs',
      color: 'danger'
    },
    {
      size: 'Extra Large (x)',
      params: '68.2M',
      GFLOPs: '257.8',
      speed: 'Slowest',
      accuracy: 'Highest',
      bestFor: 'Research & Maximum accuracy',
      color: 'dark'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section with Background */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 col-md-12 text-center">
                <h1 className="hero-title display-3 fw-bold text-white mb-4">
                  🔥 Advanced Fire & Smoke Detection
                </h1>
                <p className="hero-subtitle lead text-white mb-5">
                  Real-time detection system powered by YOLOv8 – protecting lives and property through AI vision technology
                </p>
                <div className="hero-buttons">
                  <Link to="/image" className="btn btn-danger btn-lg mx-2 mb-2">
                    <i className="fas fa-image me-2"></i>Image Detection
                  </Link>
                  <Link to="/video" className="btn btn-warning btn-lg mx-2 mb-2">
                    <i className="fas fa-video me-2"></i>Video Detection
                  </Link>
                  <Link to="/live" className="btn btn-success btn-lg mx-2 mb-2">
                    <i className="fas fa-camera me-2"></i>Live Detection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YOLOv8 Introduction */}
      <section className="yolo-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="section-title mb-4">
                <span className="text-danger">YOLOv8</span> – You Only Look Once
              </h2>
              <p className="lead mb-4">
                YOLOv8 is the latest version of the YOLO (You Only Look Once) object detection algorithm, 
                designed to be faster, more accurate, and easier to use than its predecessors.
              </p>
              <div className="features-list">
                <div className="d-flex mb-3">
                  <div className="feature-icon bg-danger text-white rounded-circle p-2 me-3">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Real-time Detection</h5>
                    <p className="mb-0 text-muted">Processes images at lightning speed for instant results</p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="feature-icon bg-warning text-white rounded-circle p-2 me-3">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Mobile Optimized</h5>
                    <p className="mb-0 text-muted">Lightweight models perfect for mobile deployment</p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="feature-icon bg-success text-white rounded-circle p-2 me-3">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">High Accuracy</h5>
                    <p className="mb-0 text-muted">State-of-the-art precision in fire and smoke detection</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <h4 className="card-title text-center mb-4">Why YOLOv8 for Fire Detection?</h4>
                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Single-pass detection:</strong> Processes entire image in one pass
                    </li>
                    <li className="mb-3">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Speed & Accuracy balance:</strong> Optimized for real-time applications
                    </li>
                    <li className="mb-3">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Mobile compatibility:</strong> Runs efficiently on smartphones
                    </li>
                    <li className="mb-3">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Low latency:</strong> Perfect for early warning systems
                    </li>
                    <li className="mb-3">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Easy deployment:</strong> Simple integration with various platforms
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>Continuous learning:</strong> Can be fine-tuned for specific scenarios
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YOLOv8 Model Comparison */}
<section className="model-section py-5 bg-light">
  <div className="container">
    <div className="row mb-5">
      <div className="col-12 text-center">
        <h2 className="section-title mb-3">YOLOv8 Model Variants</h2>
        <p className="lead text-muted">
          Choose the right model for your deployment needs
        </p>
      </div>
    </div>
    
    <div className="row justify-content-center">
      {yolov8Models.map((model, index) => (
        <div key={index} className="col-xxl col-xl-3 col-lg-4 col-md-6 mb-4">
          <div className={`card h-100 border-0 shadow-sm hover-card model-card-${model.color}`}
               style={{minHeight: '350px'}}>
            <div className="card-body text-center p-3 d-flex flex-column">
              {/* Model Badge */}
              <div className={`model-badge bg-${model.color} text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center`}
                   style={{width: '65px', height: '65px', fontSize: '1.2rem'}}>
                <span className="fw-bold">{model.size.split(' ')[0]}</span>
              </div>
              
              {/* Model Title */}
              <h5 className="card-title mb-3 fw-bold" style={{fontSize: '1rem', minHeight: '48px'}}>
                {model.size}
              </h5>
              
              {/* Model Specifications */}
              <div className="model-specs flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted" style={{fontSize: '0.85rem'}}>Params:</span>
                  <strong style={{fontSize: '0.9rem', minWidth: '60px', textAlign: 'right'}}>
                    {model.params}
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted" style={{fontSize: '0.85rem'}}>GFLOPs:</span>
                  <strong style={{fontSize: '0.9rem', minWidth: '60px', textAlign: 'right'}}>
                    {model.GFLOPs}
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted" style={{fontSize: '0.85rem'}}>Speed:</span>
                  <strong className={`text-${model.color}`} 
                          style={{fontSize: '0.9rem', minWidth: '60px', textAlign: 'right'}}>
                    {model.speed}
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted" style={{fontSize: '0.85rem'}}>Accuracy:</span>
                  <strong style={{fontSize: '0.9rem', minWidth: '60px', textAlign: 'right'}}>
                    {model.accuracy}
                  </strong>
                </div>
              </div>
              
              {/* Best For */}
              <div className="model-best-for mt-auto pt-2 border-top">
                <small className="text-muted" style={{fontSize: '0.8rem', lineHeight: '1.2'}}>
                  {model.bestFor}
                </small>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Best Model Recommendation */}
<div className="row mt-5">
  <div className="col-12">
    <div className="card border-0 shadow-lg bg-primary text-white">
      <div className="card-body p-4">
        <div className="row align-items-center">
          
          {/* Text Section */}
          <div className="col-lg-8 col-md-7">
            <h4 className="card-title mb-3">
              <i className="fas fa-bolt me-2"></i>
              Recommended for Real-time Camera & Mobile Detection
            </h4>

            <p className="card-text mb-2">
              <strong>YOLOv8-Nano (n)</strong> to <strong>YOLOv8-Medium (m)</strong> is ideal for:
            </p>

            <ul className="mb-3">
              <li>Smartphone cameras</li>
              <li>Live webcam fire detection (PC/Laptop)</li>
              <li>Low-power CPUs & Raspberry Pi</li>
              <li>Drone or CCTV real-time inference</li>
            </ul>

            <p className="card-text mb-0">
              With only <strong>3.2M parameters</strong> and <strong>8.7 GFLOPs</strong>,
              it delivers **high FPS**, low latency, and stable detection even on devices without GPU.
            </p>
          </div>

          {/* Parameters Box */}
          <div className="col-lg-4 col-md-5 text-center mt-3 mt-md-0">
            <div className="display-4 fw-bold mb-2">8.7</div>
            <p className="mb-0">GFLOPs</p>

            <div className="mt-3">
              <span className="badge bg-light text-dark fs-6 p-2">
                Best for Real-time
              </span>
            </div>



          </div>

        </div>
      </div>
    </div>
  </div>
</div>

  </div>
</section>


      {/* Mobile Detection Features */}
     {/* Device & Integration Section */}
<section className="devices-section py-5">
  <div className="container">
    <div className="row">
      <div className="col-lg-8 mx-auto text-center">
        <h2 className="section-title mb-4">Multi-Device & Camera Integration</h2>
        <p className="lead mb-5">
          Our system supports a wide range of devices and camera systems for comprehensive 
          fire detection coverage across different environments.
        </p>
      </div>
    </div>
    
    <div className="row">
      {/* Smartphones & Tablets */}
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body text-center p-4">
            <div className="device-icon bg-primary text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                 style={{width: '80px', height: '80px'}}>
              <i className="fas fa-mobile-alt fa-2x"></i>
            </div>
            <h5 className="card-title mb-3">Smartphones & Tablets</h5>
            <p className="card-text text-muted mb-3">
              • iOS & Android devices<br/>
              • Native camera integration<br/>
              • 4K resolution support<br/>
              • Real-time processing<br/>
              • Push notifications
            </p>
            <div className="mt-3">
              <small className="text-primary fw-bold">Resolution: Up to 8K</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* IP Cameras */}
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body text-center p-4">
            <div className="device-icon bg-success text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                 style={{width: '80px', height: '80px'}}>
              <i className="fas fa-video fa-2x"></i>
            </div>
            <h5 className="card-title mb-3">IP & CCTV Cameras</h5>
            <p className="card-text text-muted mb-3">
              • 4MP+ cameras supported<br/>
              • RTSP/RTMP stream support<br/>
              • 1440p/4K resolution<br/>
              • ONVIF compatibility<br/>
              • 24/7 monitoring
            </p>
            <div className="mt-3">
              <small className="text-success fw-bold">Stream: RTSP URLs</small>
            </div>
          </div>
        </div>
      </div>
      
      {/* Webcams & USB Cameras */}
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body text-center p-4">
            <div className="device-icon bg-warning text-white rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                 style={{width: '80px', height: '80px'}}>
              <i className="fas fa-desktop fa-2x"></i>
            </div>
            <h5 className="card-title mb-3">Webcams & USB Cameras</h5>
            <p className="card-text text-muted mb-3">
              • USB 2.0/3.0 cameras<br/>
              • HD/Full HD webcams<br/>
              • Laptop built-in cameras<br/>
              • Browser-based access<br/>
              • Plug-and-play setup
            </p>
            <div className="mt-3">
              <small className="text-warning fw-bold">Browser: WebRTC Support</small>
            </div>
          </div>
        </div>
      </div>
    </div>




  </div>
</section>

{/* CTA Section */}
<section className="cta-section py-5 bg-dark text-white">
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-lg-8 text-center">
        <h2 className="mb-4">Ready to Detect?</h2>
        <p className="lead mb-5">
          Start using our advanced fire and smoke detection system today. 
          Connect any camera device or choose your preferred detection method below.
        </p>

      </div>
    </div>
  </div>
</section>

      {/* Bootstrap CSS */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      {/* Font Awesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      
      <style jsx>{`
        .home-container {
          overflow-x: hidden;
        }
        
        .hero-section {
          background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
            url('https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: 90vh;
          display: flex;
          align-items: center;
          position: relative;
        }
        
        .hero-overlay {
          background: rgba(0, 0, 0, 0.5);
          width: 100%;
          padding: 80px 0;
        }
        
        .hero-title {
          font-size: 3.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          animation: fadeInDown 1s ease;
        }
        
        .hero-subtitle {
          font-size: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          animation: fadeInUp 1s ease 0.3s both;
        }
        
        .hero-buttons {
          animation: fadeIn 1s ease 0.6s both;
        }
        
        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          position: relative;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        
        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 80px;
          height: 4px;
          background: linear-gradient(to right, #ff4500, #ff8c00);
          border-radius: 2px;
        }
        
        .section-title.text-center::after {
          left: 50%;
          transform: translateX(-50%);
        }
        
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        }
        
        .model-badge {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .model-card-primary:hover {
          border-color: #0d6efd !important;
        }
        
        .model-card-success:hover {
          border-color: #198754 !important;
        }
        
        .model-card-warning:hover {
          border-color: #ffc107 !important;
        }
        
        .model-card-danger:hover {
          border-color: #dc3545 !important;
        }
        
        .model-card-dark:hover {
          border-color: #212529 !important;
        }
        
        .feature-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .mobile-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #2c3e50, #1a1a2e);
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.2rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .hero-buttons .btn {
            display: block;
            width: 100%;
            margin-bottom: 10px;
          }
          
          .model-badge {
            width: 50px;
            height: 50px;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-overlay {
            padding: 40px 20px;
          }
          
          .section-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}