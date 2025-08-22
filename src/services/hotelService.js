const token = localStorage.getItem('token');

axios.get(`${API_URL}/hoteles`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
