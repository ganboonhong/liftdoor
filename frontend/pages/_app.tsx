import '../styles/globals.css';
import type { AppProps } from 'next/app';
import axios from 'axios';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  return <Component {...pageProps} />
}
