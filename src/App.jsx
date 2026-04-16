import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";
import { SocketProvider } from "./context/SocketContext";
import Footer from "./components/Footer";
import "./styles/bookeco-theme.css";
import "./styles/bookeco-layout.css";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="bookeco-app">
          <Navbar />
          <main className="bookeco-app-main">
            <Outlet />
          </main>
          <Footer />
          <ChatBox />
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
