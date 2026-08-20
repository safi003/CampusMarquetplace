const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);
    throw new Error("Session expirée");
  }

  return res;
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur de connexion");
  }

  return data; // { user, token }
}

export async function registerRequest(name: string, email: string, password: string, carte?: File) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);  

  if (carte) {
    formData.append("imageCarteScolaire", carte);
  }   

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  }); 

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur lors de l'inscription");
  } 

  return data; // { user, token }
}

