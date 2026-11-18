import React, { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './ThemeContext';

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark
              ? 'rgba(26, 32, 44, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            color: isDark ? '#f7fafc' : '#1a202c',
            border: isDark
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.06)',
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '0.95rem',
            fontWeight: 500,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0 12px 40px rgba(0,0,0,0.5)'
              : '0 12px 40px rgba(102,126,234,0.18)',
            maxWidth: '420px',
          },
          success: {
            iconTheme: {
              primary: '#48bb78',
              secondary: isDark ? '#1a202c' : '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f56565',
              secondary: isDark ? '#1a202c' : '#ffffff',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;