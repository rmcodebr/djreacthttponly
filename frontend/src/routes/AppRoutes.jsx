import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/accounts/LoginPage";
import RegisterPage from "../pages/accounts/RegisterPage";
import ProfilePage from "../pages/accounts/ProfilePage";
import PrivateRoute from "./PrivateRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/accounts/login" element={<LoginPage />} />
      <Route path="/accounts/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/accounts/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
