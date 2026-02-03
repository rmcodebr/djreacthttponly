import axios from "axios";
import { refreshToken, logoutUser } from "./auth";

const API_URL = "http://localhost:8000/api/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // necessário para cookies HttpOnly
});

// Flag para evitar loop infinito
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de resposta
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já estiver tentando atualizar, adiciona à fila
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          await refreshToken(); // chama seu endpoint /refresh/
          isRefreshing = false;
          processQueue(null); // resolve a fila
          resolve(axiosInstance(originalRequest)); // repete a requisição original
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          await logoutUser(); // opcional: desloga se refresh falhar
          reject(err);
        }
      });
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

// // services/axiosInstance.js
// import axios from "axios";
// import { refreshToken as refreshTokenService } from "./auth";

// const API_URL = "http://localhost:8000/api/";

// const axiosInstance = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // necessário para cookies HttpOnly
// });

// // ----- Variáveis de controle -----
// let isRefreshing = false; // controla se já está rolando refresh
// let failedQueue = []; // fila de requisições enquanto refresh acontece
// let isInitializing = false; // flag de inicialização global

// // ----- Função para processar a fila de requisições -----
// const processQueue = (error) => {
//   failedQueue.forEach((p) => {
//     if (error) p.reject(error);
//     else p.resolve();
//   });
//   failedQueue = [];
// };

// // ----- Interceptor de resposta -----
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // se já está tentando refresh, adiciona à fila
//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: () => resolve(axiosInstance(originalRequest)),
//             reject,
//           });
//         });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       return new Promise(async (resolve, reject) => {
//         try {
//           await refreshTokenService(); // tenta atualizar o access token
//           isRefreshing = false;
//           processQueue();
//           resolve(axiosInstance(originalRequest)); // repete a requisição original
//         } catch (err) {
//           isRefreshing = false;
//           processQueue(err);
//           reject(err);
//         }
//       });
//     }

//     return Promise.reject(error);
//   },
// );

// // ----- Inicialização global (refresh antes da primeira requisição) -----
// export const initializeAxios = async () => {
//   if (isInitializing) return;
//   isInitializing = true;

//   try {
//     await refreshTokenService(); // atualiza access token
//   } catch (err) {
//     console.log("Usuário não logado ou refresh falhou");
//   } finally {
//     isInitializing = false;
//   }
// };

// export default axiosInstance;

// No HomePage.jsx como utilizar
// import { initializeAxios } from "@/services/axiosInstance";
// import { getUserInfo, logoutUser } from "@/services/auth";
// import { useState, useEffect } from "react";

// export default function HomePage() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const init = async () => {
//       setLoading(true);
//       await initializeAxios();            // roda silent refresh
//       const userData = await getUserInfo(); // pega dados do usuário
//       setUser(userData);
//       setLoading(false);
//     };
//     init();
//   }, []);

//   if (loading) return <div>Carregando...</div>;

//   return (
//     <div className="space-y-2">
//       {user ? <h2>Olá {user.email}</h2> : <h2>Usuário não logado</h2>}
//       <button onClick={logoutUser}>Logout</button>
//     </div>
//   );
// }
