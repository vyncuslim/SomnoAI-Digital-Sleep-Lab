import React, { useEffect, useRef, useState } from 'react';

interface ProtectedViewProps {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  badge?: string;
  lang?: 'en' | 'zh';
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({ 
  title, 
  subtitle, 
  paragraphs,
  badge,
  lang = 'en'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [sessionText, setSessionText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const defaultBadge = badge || (lang === 'zh' ? '机密数据' : 'CONFIDENTIAL DATA');
  const loginTitle = lang === 'zh' ? '受保护的访问' : 'PROTECTED ACCESS';
  const loginSubtitle = lang === 'zh' ? '此页面包含机密研究数据，需要授权访问密码。' : 'This page contains confidential research data and requires an authorized access password.';
  const passwordPlaceholder = lang === 'zh' ? '请输入访问密码' : 'ENTER ACCESS PASSWORD';
  const enterButton = lang === 'zh' ? '进入系统' : 'ENTER SYSTEM';
  const errorMsg = lang === 'zh' ? '密码错误，访问被拒绝。' : 'Incorrect password. Access denied.';
  const statusText = lang === 'zh' ? '加密连接已建立' : 'ENCRYPTED CONNECTION ESTABLISHED';
  const noticeText = lang === 'zh' 
    ? '注意：此会话正在被监控。严禁未经授权复制、分发或披露此信息，否则可能导致法律诉讼。' 
    : 'NOTICE: This session is being monitored. Unauthorized reproduction, distribution, or disclosure of this information is strictly prohibited and may result in legal action.';
  const securityAlertTitle = lang === 'zh' ? '安全警报' : 'SECURITY ALERT';
  const securityAlertMsg = lang === 'zh' 
    ? '内容保护已激活。此视图仅限于活跃且专注的会话。' 
    : 'Content protection active. This view is restricted to active, focused sessions only.';
  const securityAlertSub = lang === 'zh' 
    ? '请将焦点返回到此窗口以继续查看。' 
    : 'Please return focus to this window to resume viewing.';

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === 'SOMNO2026') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const updateSessionText = () => {
      const now = new Date();
      const text = `PROTECTED · ${window.location.hostname || 'LOCAL'} · ${now.toLocaleString()}`;
      setSessionText(text);
    };

    updateSessionText();
    const interval = setInterval(updateSessionText, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBackground = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < canvas.width; x += 48) {
        ctx.strokeStyle = 'rgba(255,255,255,0.015)';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 48) {
        ctx.strokeStyle = 'rgba(255,255,255,0.015)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawWatermarks = () => {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = '700 52px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.textAlign = 'center';

      for (let y = -900; y <= 900; y += 220) {
        for (let x = -1400; x <= 1400; x += 620) {
          ctx.fillText(sessionText, x, y);
        }
      }
      ctx.restore();
    };

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split('');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n];
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.forEach((l, i) => {
        ctx.fillText(l, x, y + i * lineHeight);
      });

      return y + lines.length * lineHeight;
    };

    const drawContent = () => {
      drawBackground();
      drawWatermarks();

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.font = '700 56px Arial';
      ctx.fillText(title, 80, 110);

      if (subtitle) {
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '400 28px Arial';
        ctx.fillText(subtitle, 80, 170);
      }

      let y = 250;
      ctx.font = '400 31px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.93)';
      const maxWidth = canvas.width - 160;
      const paragraphGap = 45;

      paragraphs.forEach(p => {
        y = wrapText(p, 80, y, maxWidth, 42) + paragraphGap;
      });
    };

    drawContent();
  }, [title, subtitle, paragraphs, sessionText, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleSecurity = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && ['c', 'x', 'v', 's', 'u', 'p', 'a'].includes(key)) {
        e.preventDefault();
        return false;
      }

      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      if (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        return false;
      }
    };

    const events = ['copy', 'cut', 'paste', 'selectstart', 'dragstart', 'contextmenu'];
    events.forEach(evt => document.addEventListener(evt, handleSecurity));
    document.addEventListener('keydown', handleKeyDown);

    const showOverlay = () => setIsOverlayVisible(true);
    const hideOverlay = () => setIsOverlayVisible(false);

    window.addEventListener('blur', showOverlay);
    window.addEventListener('focus', hideOverlay);
    window.addEventListener('beforeprint', showOverlay);

    const handleVisibilityChange = () => {
      if (document.hidden) showOverlay();
      else hideOverlay();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const devtoolsInterval = setInterval(() => {
      const threshold = 160;
      const devtoolsOpen = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
      if (devtoolsOpen) showOverlay();
    }, 1000);

    return () => {
      events.forEach(evt => document.removeEventListener(evt, handleSecurity));
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', showOverlay);
      window.removeEventListener('focus', hideOverlay);
      window.removeEventListener('beforeprint', showOverlay);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devtoolsInterval);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-white/10">
        <div className="fixed inset-0 z-0 bg-black pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 w-full max-w-[980px] bg-black/96 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
            <div className="text-xl font-black italic tracking-tighter text-white">SOMNO AI</div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/40 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              {statusText}
            </div>
          </div>

          <div className="p-12 md:p-20 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight uppercase">{loginTitle}</h1>
            <p className="text-white/50 text-lg mb-12 max-w-md leading-relaxed">{loginSubtitle}</p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-8">
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordPlaceholder}
                  autoComplete="new-password"
                  className="w-full bg-transparent border-none text-white text-2xl text-center py-4 focus:outline-none placeholder:text-white/10 tracking-[0.5em]"
                  autoFocus
                />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 group-focus-within:bg-white/40 transition-colors duration-500" />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] rounded-full hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
              >
                {enterButton}
              </button>

              {error && (
                <div className="text-red-500 text-sm font-medium animate-pulse">
                  {errorMsg}
                </div>
              )}
            </form>

            <div className="mt-20 flex justify-between items-center w-full text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">
              <div>© 2026 SomnoAI Digital Sleep Lab. All Rights Reserved.</div>
              <div>{lang === 'zh' ? '仅限授权访问' : 'AUTHORIZED ACCESS ONLY'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none" />

      <div className="relative z-10 w-full max-w-[980px] bg-black/96 border border-white/10 backdrop-blur-[18px] rounded-[24px] p-[28px] shadow-2xl">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/20 text-sm font-medium text-white/80 tracking-wider">
          {defaultBadge}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight uppercase">{title}</h1>
        {subtitle && <p className="text-white/70 text-lg mb-6 leading-relaxed">{subtitle}</p>}

        <div className="relative rounded-[20px] overflow-hidden border border-white/10 bg-black min-h-[420px]">
          <canvas 
            ref={canvasRef} 
            width={1600} 
            height={900} 
            className="block w-full h-auto pointer-events-none"
            aria-label="protected content"
          />
          
          {/* Watermark Layer */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.14]" 
               style={{ backgroundImage: 'repeating-linear-gradient(-28deg, transparent 0, transparent 160px, rgba(255,255,255,0.18) 160px, rgba(255,255,255,0.18) 162px)' }} />
          
          {/* Corner Mark */}
          <div className="absolute right-4 bottom-3 z-30 text-[12px] px-[10px] py-[8px] rounded-full bg-black/88 border border-white/18 text-white/90 font-mono pointer-events-none">
            {sessionText}
          </div>
        </div>

        <div className="mt-6 text-white/76 text-[0.95rem] leading-relaxed border-t border-white/5 pt-4">
          {noticeText}
        </div>
      </div>

      {/* Overlay */}
      {isOverlayVisible && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md p-8 rounded-2xl bg-black border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">{securityAlertTitle}</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              {securityAlertMsg}
            </p>
            <p className="text-white/50 text-xs">
              {securityAlertSub}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
