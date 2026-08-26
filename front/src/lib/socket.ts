"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function redirectToLogin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href =
    "/login?redirect=" + encodeURIComponent(window.location.pathname);
}

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "", {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    socket.on("connect_error", () => {
      redirectToLogin();
      resetSocket();
    });
  }
  return socket;
}

export function updateSocketToken() {
  if (!socket) return;
  const token = localStorage.getItem("token");
  if (token) {
    socket.auth = { token };
  }
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}