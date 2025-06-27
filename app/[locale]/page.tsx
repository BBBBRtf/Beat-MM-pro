'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div style={{ padding: '20px', color: 'blue', backgroundColor: 'lightgray', minHeight: '100vh' }}>
      <h1>Test Page</h1>
      <p>If you see this, the basic rendering is working.</p>
      <p>Locale from path should be available if routing works.</p>
    </div>
  );
}
