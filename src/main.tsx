import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Application bootstrap starting...');

const container = document.getElementById("root");

if (!container) {
  console.error('Failed to find the root element');
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

try {
  console.log('Attempting to render the application...');
  root.render(<App />);
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render the application:', error);
  document.body.innerHTML = `
    <div style="color: white; padding: 20px;">
      <h1>Failed to start the application</h1>
      <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}