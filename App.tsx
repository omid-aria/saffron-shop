import React, { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState({
    name: "زعفران فروشی هرات",
    tagline: "عرضه کننده بهترین زعفران قائنات",
    phone: "09123456789",
    website: "saffronherat.com",
    email: "info@saffronherat.com",
    address: "هرات، خیابان اصلی، پلاک ۱۲۳"
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <h1 style={{ color: '#D4AF37', fontSize: '24px', textAlign: 'center' }}>
        {data.name}
      </h1>
      <p style={{ fontSize: '16px', opacity: 0.8, textAlign: 'center' }}>
        {data.tagline}
      </p>
      
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '300px'
      }}>
        <p style={{ marginBottom: '10px' }}>
          <i className="fas fa-phone"></i> {data.phone}
        </p>
        <p style={{ marginBottom: '10px' }}>
          <i className="fas fa-envelope"></i> {data.email}
        </p>
        <p style={{ marginBottom: '10px' }}>
          <i className="fas fa-map-marker-alt"></i> {data.address}
        </p>
        <p>
          <i className="fas fa-globe"></i> {data.website}
        </p>
      </div>
      
      <div style={{ 
        backgroundColor: '#D4AF37', 
        color: '#2e102d',
        padding: '15px 30px',
        borderRadius: '25px',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>
        ذخیره در مخاطبین
      </div>
    </div>
  );
}
