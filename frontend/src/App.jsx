import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Customize from "./pages/Customize";
import Home from "./pages/Home";
import { userDataContext } from "./context/userContext";
import Customize2 from "./pages/Customize2";

const App = () => {
  const { userData } = useContext(userDataContext);

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData && userData.assistantImage && userData.assistantName ? (
            <Home />
          ) : (
            <Navigate to="/Customize" />
          )
        }
      />

      {/* Signup route */}
      <Route
        path="/Signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />

      {/* Signin route */}
      <Route
        path="/SignIn"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />

      {/* Customize route */}
      <Route
        path="/Customize"
        element={userData ? <Customize /> : <Navigate to="/Signup" />}
      />

      {/* Customize2 route */}
      <Route
        path="/Customize2"
        element={userData ? <Customize2 /> : <Navigate to="/Signup" />}
      />
    </Routes>
  );
};

export default App;
