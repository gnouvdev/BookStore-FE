import { createContext, useContext, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { auth } from "../firebase/firebase.config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);

  useEffect(() => {
    console.log("Checking Firebase auth...");

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // Cleanup socket cũ trước khi tạo socket mới
      if (socketRef.current) {
        console.log("Disconnecting old socket...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }

      // Clear token refresh interval nếu có
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }

      if (user) {
        try {
          // Force refresh token để đảm bảo token mới nhất
          const token = await user.getIdToken(true);
          const userId = user.uid;
          console.log("Firebase userId:", userId);
          console.log("Firebase token obtained");

          const newSocket = io("http://localhost:5000", {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            timeout: 20000,
          });

          // Xử lý kết nối thành công
          newSocket.on("connect", async () => {
            console.log("Socket connected:", newSocket.id);

            // Refresh token trước khi register để đảm bảo token còn hiệu lực
            try {
              // eslint-disable-next-line no-unused-vars
              const freshToken = await user.getIdToken(true);
              newSocket.emit("register", userId);
              console.log("Registered user:", userId);
            } catch (tokenError) {
              console.error("Error refreshing token on connect:", tokenError);
            }
          });

          // Xử lý lỗi kết nối
          newSocket.on("connect_error", async (err) => {
            console.error("Socket connection error:", err.message);

            // Nếu lỗi do authentication, thử refresh token và reconnect
            if (
              err.message.includes("Authentication error") ||
              err.message.includes("token")
            ) {
              try {
                const freshToken = await user.getIdToken(true);
                newSocket.auth.token = freshToken;
                newSocket.connect();
              } catch (tokenError) {
                console.error(
                  "Error refreshing token on connect_error:",
                  tokenError
                );
              }
            }
          });

          // Xử lý ngắt kết nối
          newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);

            // Nếu disconnect do server hoặc transport close, thử reconnect
            if (
              reason === "io server disconnect" ||
              reason === "transport close"
            ) {
              console.log("Attempting to reconnect...");
            }
          });

          // Xử lý reconnect
          newSocket.on("reconnect", async (attemptNumber) => {
            console.log("Socket reconnected after", attemptNumber, "attempts");

            // Refresh token và register lại sau khi reconnect
            try {
              // eslint-disable-next-line no-unused-vars
              const freshToken = await user.getIdToken(true);
              newSocket.emit("register", userId);
            } catch (tokenError) {
              console.error("Error refreshing token on reconnect:", tokenError);
            }
          });

          // Xử lý lỗi
          newSocket.on("error", (error) => {
            console.error("Socket error:", error);
          });

          socketRef.current = newSocket;
          setSocket(newSocket);

          // Thiết lập token refresh interval (mỗi 50 phút, token Firebase thường hết hạn sau 1 giờ)
          tokenRefreshIntervalRef.current = setInterval(async () => {
            try {
              // eslint-disable-next-line no-unused-vars
              const freshToken = await user.getIdToken(true);
              if (newSocket && newSocket.connected) {
                newSocket.auth.token = freshToken;
                console.log("Token refreshed for socket");
              }
            } catch (tokenError) {
              console.error("Error refreshing token in interval:", tokenError);
            }
          }, 50 * 60 * 1000); // 50 phút
        } catch (error) {
          console.error("Error getting Firebase token:", error);
          setSocket(null);
        }
      } else {
        console.log("No Firebase user, socket should be disconnected");
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();

      // Cleanup socket
      if (socketRef.current) {
        console.log("Cleaning up socket on unmount...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Cleanup token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
