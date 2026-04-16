/* eslint-disable no-unused-vars */
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
import { recommendationsv2Api } from "../redux/features/recommendationv2/recommendationsv2Api";

const AuthContext = createContext(null);
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const normalizeUser = (firebaseUser, profileUser, roleOverride) => ({
  email: profileUser?.email || firebaseUser?.email || null,
  uid: firebaseUser?.uid || profileUser?.firebaseId || profileUser?._id || null,
  photoURL:
    profileUser?.photoURL ||
    firebaseUser?.photoURL ||
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  displayName:
    profileUser?.fullName ||
    profileUser?.displayName ||
    firebaseUser?.displayName ||
    null,
  fullName: profileUser?.fullName || firebaseUser?.displayName || null,
  role: roleOverride || profileUser?.role || "user",
  address: profileUser?.address || null,
  phone: profileUser?.phone || null,
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing initial user:", error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const dispatch = useDispatch();

  const persistSession = (sessionToken, user) => {
    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(sessionToken);
    setCurrentUser(user);
    dispatch(
      setCredentials({
        user,
        token: sessionToken,
      })
    );
    window.dispatchEvent(new CustomEvent("tokenSet"));
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
    dispatch(logoutAction());
  };

  const fetchUserProfile = async (sessionToken) => {
    if (!sessionToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const requestBackendSession = async (firebaseUser, overrides = {}) => {
    const idToken = await firebaseUser.getIdToken();
    const loginPayload = {
      idToken,
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      displayName: overrides.fullName || firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };

    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(loginPayload),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      if (loginData?.token) {
        return loginData;
      }
    }

    if (loginResponse.status !== 401 && loginResponse.status !== 404) {
      const errorData = await loginResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Backend authentication failed");
    }

    const registerResponse = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        idToken: firebaseUser.uid,
        email: firebaseUser.email,
        fullName:
          overrides.fullName || firebaseUser.displayName || firebaseUser.email?.split("@")[0],
      }),
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Backend registration failed");
    }

    const registerData = await registerResponse.json();
    if (registerData?.token) {
      return registerData;
    }

    const retryResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(loginPayload),
    });

    if (!retryResponse.ok) {
      const errorData = await retryResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Backend authentication retry failed");
    }

    return retryResponse.json();
  };

  const completeFirebaseAuth = async (firebaseUser, overrides = {}) => {
    const backendSession = await requestBackendSession(firebaseUser, overrides);
    if (!backendSession?.token) {
      throw new Error("No backend token returned");
    }

    const profileUser = await fetchUserProfile(backendSession.token);
    const cleanUser = normalizeUser(firebaseUser, profileUser, backendSession.role);
    persistSession(backendSession.token, cleanUser);
    return cleanUser;
  };

  useEffect(() => {
    if (currentUser && token) {
      dispatch(
        setCredentials({
          user: currentUser,
          token,
        })
      );
    }
  }, [currentUser, token, dispatch]);

  const registerUser = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    try {
      dispatch(clearCart());
      dispatch(cartApi.util.resetApiState());
      dispatch(recommendationsv2Api.util.resetApiState());
      clearSession();
      await signOut(auth);
      window.dispatchEvent(new CustomEvent("userLoggedOut"));
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

  useEffect(() => {
    let previousUserId = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      try {
        if (user) {
          const currentUserId = user.uid;

          if (previousUserId && previousUserId !== currentUserId) {
            dispatch(clearCart());
            dispatch(cartApi.util.resetApiState());
            dispatch(
              recommendationsv2Api.util.invalidateTags([
                "CollaborativeRecommendations",
                "ContextualRecommendations",
              ])
            );
            window.dispatchEvent(
              new CustomEvent("userChanged", {
                detail: { userId: currentUserId },
              })
            );
          }

          previousUserId = currentUserId;

          const storedToken = localStorage.getItem("token");
          let profileUser = await fetchUserProfile(storedToken);
          let sessionToken = storedToken;

          if (!profileUser) {
            const backendSession = await requestBackendSession(user);
            sessionToken = backendSession.token;
            profileUser = await fetchUserProfile(sessionToken);
          }

          const normalizedUser = normalizeUser(user, profileUser);
          persistSession(sessionToken, normalizedUser);

          window.dispatchEvent(
            new CustomEvent("userLoggedIn", {
              detail: { userId: currentUserId },
            })
          );
        } else {
          previousUserId = null;
          clearSession();
          window.dispatchEvent(new CustomEvent("userLoggedOut"));
        }
      } catch (error) {
        console.error("Auth state sync error:", error);
        clearSession();
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const value = {
    currentUser,
    loading,
    token,
    registerUser,
    loginUser,
    signInWithGoogle,
    logout,
    updateUserProfile,
    setCurrentUser,
    completeFirebaseAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
