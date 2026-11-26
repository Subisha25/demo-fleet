import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

export default function DemoViewPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const initDemo = async () => {
      try {
        const res = await axiosInstance.get('/public/demo-session');
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('role', 'demo');
          localStorage.setItem('tenantId', 'demo-tenant');
          localStorage.setItem('isDemoMode', 'true');
          localStorage.setItem('isDemoView', 'true');
        } else {
          fallbackDemoSession();
        }
      } catch (e) {
        fallbackDemoSession();
      }
      navigate('/dashboard', { replace: true });
    };

    const fallbackDemoSession = () => {
      // Safe client-side fallback demo payload
      const mockPayload = {
        userId: 'demo-user-001',
        username: 'Demo Fleet Admin',
        email: 'demo@cabz.com',
        role: 'demo',
        isDemo: true,
        tenantId: 'demo-tenant',
        tenantName: 'CABZ Smart Fleet Demo',
      };
      // Simple signed-like representation or base64 token for client
      const b64Header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const b64Payload = btoa(JSON.stringify(mockPayload));
      const mockToken = `${b64Header}.${b64Payload}.mockSignature`;

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockPayload));
      localStorage.setItem('role', 'demo');
      localStorage.setItem('tenantId', 'demo-tenant');
      localStorage.setItem('isDemoMode', 'true');
      localStorage.setItem('isDemoView', 'true');
    };

    initDemo();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-[#5B3DF5] border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-xl font-bold text-[#17171D]">Loading CABZ Fleet Operations Demo Preview...</h2>
      <p className="text-sm text-[#5C5752] mt-1 max-w-md">
        Preparing a secure, read-only preview environment of the Fleet Admin application.
      </p>
    </div>
  );
}
