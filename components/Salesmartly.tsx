import { useEffect } from 'react';

export const Salesmartly = () => {
  useEffect(() => {
    // Salesmartly Script Integration
    const scriptId = 'salesmartly-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://plugin-code.salesmartly.com/js/project_445539_520520_1761223371.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
};
