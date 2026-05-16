'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Processando...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setMessage(`Erro: ${error}`);
      setIsSuccess(false);
      return;
    }

    if (code) {
      // Armazenar código no localStorage
      localStorage.setItem('googleAuthCode', code);
      setMessage('Login bem sucedido!');
      setIsSuccess(true);
    } else {
      setMessage('Nenhum código recebido');
      setIsSuccess(false);
    }
  }, [searchParams]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontSize: '24px',
      fontWeight: 'bold',
      color: isSuccess ? '#22c55e' : '#ef4444',
      textAlign: 'center',
      padding: '20px',
    }}>
      {message}
    </div>
  );
}
