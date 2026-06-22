import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/auth/register', { username, password });
      router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="container">
      <h1>Register</h1>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
