import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import ImageDetect from "./pages/ImageDetect";
import VideoDetect from "./pages/VideoDetect";
import LiveDetect from "./pages/LiveDetect";

export default function App() {
  return (
    <Router>
      <nav style={styles.nav}>
        <Link style={styles.link} to="/">Home</Link>
        <Link style={styles.link} to="/image">Image Detection</Link>
        <Link style={styles.link} to="/video">Video Detection</Link>
        <Link style={styles.link} to="/live">Live Detection</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image" element={<ImageDetect />} />
        <Route path="/video" element={<VideoDetect />} />
        <Route path="/live" element={<LiveDetect />} />
      </Routes>
    </Router>
  );
}

const styles = {
  nav: {
    display: "flex",
    gap: "20px",
    padding: "15px",
    background: "#222",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
};
