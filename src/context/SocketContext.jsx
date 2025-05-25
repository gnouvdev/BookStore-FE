import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: currentUser.token,
        },
      });

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      newSocket.on("orderStatusUpdate", (data) => {
        toast.success(
          `Đơn hàng #${data.orderId} đã được cập nhật: ${data.status}`
        );
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
