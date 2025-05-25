import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { auth } from "../firebase/firebase.config";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("Checking Firebase auth...");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const userId = user.uid;
          console.log("Firebase userId:", userId);
          console.log("Firebase token:", token);

          const newSocket = io("http://localhost:5000", {
            auth: { token },
          });

          newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
            newSocket.emit("register", userId);
            console.log("Registered user:", userId);
          });

          newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
          });

          setSocket(newSocket);

          return () => {
            newSocket.disconnect();
          };
        } catch (error) {
          console.error("Error getting Firebase token:", error);
        }
      } else {
        console.log("No Firebase user, disconnecting socket...");
        if (socket) {
          socket.disconnect();
          setSocket(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);