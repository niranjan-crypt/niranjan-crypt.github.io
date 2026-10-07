import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { InteractiveFace } from './components/3d/InteractiveFace';
import { InteractiveBrain } from './components/3d/InteractiveBrain';
import './index.css';

function mountScenes() {
  // 1. Mount Interactive 3D Face into Project 01 container if present
  const faceContainer = document.getElementById('three-face-canvas');
  if (faceContainer && !faceContainer.hasAttribute('data-mounted')) {
    faceContainer.setAttribute('data-mounted', 'true');
    ReactDOM.createRoot(faceContainer).render(
      <React.StrictMode>
        <InteractiveFace />
      </React.StrictMode>
    );
  }

  // 2. Mount Interactive 3D Brain into Project 06 container if present
  const brainContainer = document.getElementById('three-brain-canvas');
  if (brainContainer && !brainContainer.hasAttribute('data-mounted')) {
    brainContainer.setAttribute('data-mounted', 'true');
    ReactDOM.createRoot(brainContainer).render(
      <React.StrictMode>
        <InteractiveBrain />
      </React.StrictMode>
    );
  }

  // 3. Fallback mount for standalone App if #root exists
  const rootContainer = document.getElementById('root');
  if (rootContainer && !rootContainer.hasAttribute('data-mounted')) {
    rootContainer.setAttribute('data-mounted', 'true');
    ReactDOM.createRoot(rootContainer).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountScenes);
} else {
  mountScenes();
}
