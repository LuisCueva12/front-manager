// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/login';

export async function login(correo, password) {
  try {
    const { data } = await axios.post(
      API_URL,
      { correo, password },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
    );

    const token =
      data?.token ??
      data?.access_token ??
      data?.data?.token ??
      null;

    const usuario =
      data?.usuario ??
      data?.user ??
      data?.data?.user ??
      null;

    if (!token) throw new Error('Credenciales inválidas');

    return { token, usuario, raw: data };
  } catch (err) {
    const d = err?.response?.data;
    const msg =
      d?.message ||
      d?.error ||
      (d?.errors && Object.values(d.errors)[0]?.[0]) ||
      'Error al iniciar sesión';
    throw new Error(msg);
  }
}
