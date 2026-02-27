import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/supabaseService.ts';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAnalytics = async () => {
      if (initialized) return;

      try {
        const { data } = await adminApi.getSettings();
        if (!data) return;

        const settings: Record<string, string> = {};
        data.forEach((s: any) => settings[s.key] = s.value);

        // Google Analytics
        if (settings.ga_measurement_id) {
          const scriptId = 'ga-script';
          if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga_measurement_id}`;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga_measurement_id}');
            `;
            document.head.appendChild(inlineScript);
          }
        }

        // Google Search Console
        if (settings.google_site_verification) {
          const metaId = 'gsc-meta';
          if (!document.getElementById(metaId)) {
            const meta = document.createElement('meta');
            meta.id = metaId;
            meta.name = 'google-site-verification';
            meta.content = settings.google_site_verification;
            document.head.appendChild(meta);
          }
        }

        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize analytics:", error);
      }
    };

    initAnalytics();
  }, [initialized]);

  return <>{children}</>;
};
