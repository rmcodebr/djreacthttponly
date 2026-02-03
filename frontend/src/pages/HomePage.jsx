import React, { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const { user, logout, refresh } = useAuthStore();

  return (
    <div className="space-y-2">
      {user ? <h2> Olá {user.email}</h2> : <h2>Usuário não logado</h2>}
      <div className="space-x-2">
        <Link to="/accounts/login">Login</Link>
        <Link to="/accounts/register">Register</Link>
      </div>
      <div className="space-x-2">
        <button onClick={logout}>Logout</button>
        <button onClick={refresh}>Refresh</button>
      </div>
      <div>HomePage</div>
    </div>
  );
}
