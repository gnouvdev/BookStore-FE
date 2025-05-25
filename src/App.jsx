import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Navbar from "./components/Navbar";
import { SocketProvider } from "./context/SocketContext";
import Footer from "./components/Footer";

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="min-h-screen max-w-screen-2xl mx-auto px-4 py-4 font-primary">
              <Outlet />
            </main>
            <Footer />
            <Toaster position="top-center" reverseOrder={false} />
          </div>
        </AuthProvider>
      </SocketProvider>
    </Provider>
  );
}

export default App;
