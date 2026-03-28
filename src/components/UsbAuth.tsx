import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HardwareButton as Button } from './ui/Components';
import { toast } from 'react-hot-toast';
import { Usb, ShieldCheck, ShieldAlert, Loader2, ChevronDown, Activity } from 'lucide-react';
import { testUdiskAccess } from '../lib/testUsbAuth';

interface UsbAuthProps {
  mode: 'bind' | 'unlock';
  userId?: string;
  email?: string;
  onSuccess?: () => void;
}

export const UsbAuth: React.FC<UsbAuthProps> = ({ mode, userId, email, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [boundDevices, setBoundDevices] = useState<any[]>([]);

  const [showAll, setShowAll] = useState(false);

  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!('usb' in navigator)) {
      setSupported(false);
    }
    if (mode === 'bind') {
      fetchBoundDevices();
    }
  }, [mode]);

  const fetchBoundDevices = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_usb_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active');
      
      if (data) setBoundDevices(data);
    } catch (error) {
      console.error("Failed to fetch bound devices", error);
    }
  };

  const handleBind = async () => {
    setLoading(true);
    try {
      const usb = (navigator as any).usb;
      
      // Use a more specific filter for Mass Storage (Class 8)
      // Note: Browsers still often block these for security.
      const device = await usb.requestDevice({ 
        filters: showAll ? [] : [{ classCode: 8 }] 
      });

      const payload = {
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || "",
        productName: device.productName || "Standard U-disk",
        manufacturerName: device.manufacturerName || ""
      };

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/usb/bind", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success("U-disk bound successfully");
        fetchBoundDevices();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Binding failed");
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        toast.success("Device selection cancelled");
      } else {
        console.error(error);
        toast.error("An error occurred during binding");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_usb_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      toast.success("U-disk unbound");
      fetchBoundDevices();
    } catch (error: any) {
      toast.error(error.message || "Failed to unbind device");
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const usb = (navigator as any).usb;
      
      // 1. Fetch filters for this user first (if email provided)
      let filters: any[] = showAll ? [] : [{ classCode: 8 }];
      if (email) {
        const res = await fetch(`/api/usb/get-filters?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.success && data.filters.length > 0 && !showAll) {
          filters = data.filters;
        }
      }

      // 2. Try to find a match among ALREADY paired devices (seamless)
      let pairedDevices = await usb.getDevices();
      let candidates = pairedDevices.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        serialNumber: d.serialNumber || "",
        productName: d.productName || "",
        manufacturerName: d.manufacturerName || ""
      }));

      // 3. Send paired devices to backend to see if any match
      let matched = false;
      if (candidates.length > 0) {
        const res = await fetch("/api/usb/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devices: candidates, userId, email })
        });
        const data = await res.json();
        if (data.success) {
          matched = true;
          toast.success("U-disk verified (auto-detected)");
          if (data.action_link) window.location.href = data.action_link;
          else if (onSuccess) onSuccess();
          return;
        }
      }

      // 4. If no paired device matched, FORCE a popup selection
      if (!matched) {
        const device = await usb.requestDevice({ filters });
        const manualCandidate = [{
          vendorId: device.vendorId,
          productId: device.productId,
          serialNumber: device.serialNumber || "",
          productName: device.productName || "",
          manufacturerName: device.manufacturerName || ""
        }];

        const res = await fetch("/api/usb/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devices: manualCandidate, userId, email })
        });

        const data = await res.json();
        if (data.success) {
          toast.success("U-disk verified successfully");
          if (data.action_link) window.location.href = data.action_link;
          else if (onSuccess) onSuccess();
        } else {
          toast.error(data.message || "U-disk verification failed");
        }
      }
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        toast.success("Verification cancelled");
      } else {
        console.error(error);
        toast.error("An error occurred during verification");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-rose-500 font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>Browser Not Supported</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          WebUSB is required for hardware authentication. Please use <span className="text-white font-bold">Google Chrome</span> or <span className="text-white font-bold">Microsoft Edge</span>. Firefox and Safari are currently not supported.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl overflow-hidden transition-all">
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between p-3 hover:bg-indigo-500/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Usb className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Troubleshooting Guide</span>
          </div>
          <ChevronDown className={`w-3 h-3 text-indigo-400 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
        </button>
        
        {showGuide && (
          <div className="p-3 pt-0 border-t border-indigo-500/10">
            <div className="text-[10px] text-indigo-200/80 space-y-2 leading-relaxed">
              <p>Browsers often hide standard U-disks for security. If your device is not listed:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li><span className="text-white font-bold underline">"Eject"</span> the U-disk in your OS (Windows/macOS) but <span className="text-indigo-300">keep it plugged in</span>. This often releases the lock and allows the browser to see it.</li>
                <li>Ensure no other applications (like File Explorer or Disk Utility) are actively using the drive.</li>
                <li>Enable the <span className="text-white font-bold">"Show all devices"</span> option below to bypass strict filtering.</li>
              </ul>
              
              <div className="pt-2 border-t border-indigo-500/10 mt-2">
                <button 
                  onClick={async () => {
                    const result = await testUdiskAccess();
                    if (result.success) {
                      toast.success(result.message);
                    } else {
                      toast.error(result.message);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest"
                >
                  <Activity className="w-3 h-3" />
                  Run Deep Diagnostic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'bind' ? (
        <div className="space-y-4">

          <div className="flex items-center gap-2 px-1 py-1">
            <input 
              type="checkbox" 
              id="showAll" 
              checked={showAll} 
              onChange={(e) => setShowAll(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
            />
            <label htmlFor="showAll" className="text-xs text-slate-400 cursor-pointer select-none hover:text-slate-300 font-medium">
              Show all devices <span className="text-[10px] opacity-60 font-normal">(Use if U-disk is not detected)</span>
            </label>
          </div>

          <Button 
            onClick={handleBind} 
            disabled={loading}
            variant="outline"
            className="w-full flex items-center gap-2 bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 py-6 rounded-2xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
            Bind Optional Hardware Key
          </Button>
          
          <div className="space-y-2 px-1">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              <span className="text-amber-500 font-bold italic">Note:</span> Only bind devices you trust.
            </p>
          </div>

          {boundDevices.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Bound Devices</p>
              {boundDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {device.product_name || "Unknown Device"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {device.vendor_id.toString(16).padStart(4, '0')}:{device.product_id.toString(16).padStart(4, '0')}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(device.id)}
                    className="text-[10px] text-rose-500 hover:text-rose-400 font-bold uppercase tracking-wider"
                  >
                    Unbind
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1 py-1">
            <input 
              type="checkbox" 
              id="showAllUnlock" 
              checked={showAll} 
              onChange={(e) => setShowAll(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
            />
            <label htmlFor="showAllUnlock" className="text-xs text-slate-400 cursor-pointer select-none hover:text-slate-300 font-medium">
              Show all devices <span className="text-[10px] opacity-60 font-normal">(Use if U-disk is not detected)</span>
            </label>
          </div>

          <Button 
            onClick={handleUnlock} 
            disabled={loading}
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verify U-disk (Optional)
          </Button>

          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Verification failed? Use your <span className="text-indigo-400">PIN</span> or <span className="text-indigo-400">Magic Link</span> instead.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
