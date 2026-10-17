import React from 'react';
import { createRoot } from 'react-dom/client';
import SandboxSourceEnhancements from './SandboxSourceEnhancements.jsx';
import './styles/sandbox-compact.css';

function SourceEnhancementsApp() {
  return <SandboxSourceEnhancements />;
}

// Keep this React root separate from the legacy app's #root while features migrate gradually.
const host = document.createElement('div');
host.id = 'source-ui-root';
host.hidden = true;
document.body.appendChild(host);

createRoot(host).render(<SourceEnhancementsApp />);
