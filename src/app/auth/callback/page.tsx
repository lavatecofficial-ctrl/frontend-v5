'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularLoader from '@/components/CircularLoader';
import { authService } from '@/services/authService';
import { setCookie } from '@/utils/cookies';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Obtener el token de Google del hash de la URL
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (!accessToken) {
          throw new Error('No se recibió token de Google');
        }

        // Obtener información del usuario de Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Error al obtener información del usuario');
        }

        const googleUser = await userInfoResponse.json();

        // Hacer login social en el backend
        const response = await authService.socialLogin({
          provider: 'google',
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          providerId: googleUser.id,
        });

        // Guardar token en cookie (igual que login normal)
        setCookie('authToken', response.token, 7);

        // Redirigir según el rol
        const userData = response.user;
        if (userData.role === 'admin' || userData.role === 'superadmin') {
          router.push('/dashboard');
        } else {
          const now = new Date();
          const hasActivePlan = userData.planStartDate && userData.planEndDate &&
            new Date(userData.planStartDate) <= now && 
            new Date(userData.planEndDate) >= now;
          
          if (hasActivePlan) {
            router.push('/dashboard');
          } else {
            router.push('/no-plan');
          }
        }
      } catch (error) {
        console.error('Error en callback de Google:', error);
        setError('Error al procesar el login con Google');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [router]);

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return null;
}
