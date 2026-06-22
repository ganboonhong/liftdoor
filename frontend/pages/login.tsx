import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      router.push('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div style={{ color: 'red' }}>{error}</div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
