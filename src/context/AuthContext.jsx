import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import {
  setCredentials,
  logout as logoutAction,
} from "../redux/features/auth/authSlice";
import { clearCart } from "../redux/features/cart/cartSlice";
import { useDispatch } from "react-redux";
import { cartApi } from "../redux/features/cart/cartApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //THÊM STATE TOKEN
  const [token, setToken] = useState(localStorage.getItem("token"));

  const dispatch = useDispatch();

  //LUÔN THEO DÕI TOKEN TRONG localStorage
  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken && storedToken !== token) {
        setToken(storedToken);
      }
    };

    // Check ngay lập tức
    checkToken();

    // Listen for storage changes (khi login từ component khác)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event để listen khi token được set từ cùng window
    const handleTokenSet = () => {
      checkToken();
    };

    window.addEventListener("tokenSet", handleTokenSet);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenSet", handleTokenSet);
    };
  }, [token]);

  // ĐỒNG BỘ CONTEXT → REDUX (CHỖ FIX BUG)
  useEffect(() => {
    if (currentUser && token) {
      console.log("Syncing context to Redux:", {
        uid: currentUser.uid,
        hasToken: !!token,
      });
      dispatch(
        setCredentials({
          user: currentUser,
          token: token,
        })
      );
      console.log("Redux state updated with user:", currentUser.uid);
    } else if (!currentUser) {
      // Nếu không có currentUser, clear Redux auth state
      console.log("No currentUser, clearing Redux auth state");
      dispatch(logoutAction());
    }
  }, [currentUser, token, dispatch]);

  // Đăng ký với email/password
  const registerUser = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Đăng nhập với email/password
  const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Đăng nhập với Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      console.log("Logout initiated, clearing all state...");
      // Clear cart và reset RTK Query cache trước khi logout
      dispatch(clearCart());
      dispatch(cartApi.util.resetApiState());
      // Clear Redux auth state
      dispatch(logoutAction());
      // Clear Firebase auth
      await signOut(auth);
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clear local state
      setCurrentUser(null);
      setToken(null);
      // Dispatch event để các component biết đã logout
      window.dispatchEvent(new CustomEvent("userLoggedOut"));
      console.log("Logout completed, all state cleared");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // Lắng nghe sự thay đổi trạng thái đăng nhập
  useEffect(() => {
    let previousUserId = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const currentUserId = user.uid;

        // Nếu user đổi (khác user trước đó), clear cart và reset RTK Query cache
        if (previousUserId && previousUserId !== currentUserId) {
          console.log("User changed, clearing cart and resetting cache...");
          dispatch(clearCart());
          // Reset RTK Query cache để đảm bảo không dùng cache của user cũ
          dispatch(cartApi.util.resetApiState());
          // Dispatch event để các component khác biết user đã đổi
          window.dispatchEvent(
            new CustomEvent("userChanged", {
              detail: { userId: currentUserId },
            })
          );
        }

        previousUserId = currentUserId;

        // Nếu đã có user trong localStorage, sử dụng thông tin đó
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          // Nếu chưa có, tạo user object từ Firebase
          const cleanUser = {
            email: user.email,
            uid: user.uid,
            photoURL:
              user.photoURL ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            displayName: user.displayName || null,
            role: "user", // Mặc định là user
          };
          setCurrentUser(cleanUser);
        }

        // Đợi một chút để đảm bảo state đã được cập nhật trước khi dispatch event
        setTimeout(() => {
          // Dispatch event để refetch cart khi user login
          window.dispatchEvent(
            new CustomEvent("userLoggedIn", {
              detail: { userId: currentUserId },
            })
          );
        }, 100);
      } else {
        // User logout - clear cart và reset RTK Query cache
        if (previousUserId) {
          console.log(
            "User logged out (onAuthStateChanged), clearing cart and resetting cache..."
          );
          dispatch(clearCart());
          // Reset RTK Query cache
          dispatch(cartApi.util.resetApiState());
          // Clear Redux auth state
          dispatch(logoutAction());
          // Clear token
          setToken(null);
          previousUserId = null;
        }
        setCurrentUser(null);
        // Dispatch event để các component biết đã logout
        window.dispatchEvent(new CustomEvent("userLoggedOut"));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const value = {
    currentUser,
    loading,
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
    updateUserProfile,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
