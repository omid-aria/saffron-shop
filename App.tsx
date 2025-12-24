import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#2e102d',
      color: 'white',
      fontFamily: 'Vazirmatn, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#D4AF37', marginBottom: '20px' }}>
          زعفران فروشی هرات
        </h1>
        <p>اپلیکیشن با موفقیت لود شد!</p>
        <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
          اگر این متن رو می‌بینید، React درسته کار می‌کنه
        </p>
      </div>
    </div>
  );
}
