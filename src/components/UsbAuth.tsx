import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HardwareButton as Button } from './ui/Components';
import { toast } from 'react-hot-toast';
import { Usb, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

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
      const device = await usb.requestDevice({
        filters: [{ classCode: 0x08 }] // Mass Storage
      });

      const payload = {
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || "",
        productName: device.productName || "",
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
      const { error } = await supabase
        .from('user_usb_keys')
        .delete()
        .eq('id', id);
      
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
      const devices = await usb.getDevices();
      
      if (devices.length === 0) {
        toast.error("No paired U-disks found. Please ensure it's plugged in and was previously bound.");
        setLoading(false);
        return;
      }

      const candidates = devices.map((d: any) => ({
        vendorId: d.vendorId,
        productId: d.productId,
        serialNumber: d.serialNumber || "",
        productName: d.productName || "",
        manufacturerName: d.manufacturerName || ""
      }));

      const res = await fetch("/api/usb/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devices: candidates, userId, email })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("U-disk verified successfully");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "U-disk verification failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-sm text-rose-500 bg-rose-500/10 p-3 rounded-lg">
        <ShieldAlert className="w-4 h-4" />
        <span>WebUSB is not supported in this browser.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {mode === 'bind' ? (
        <div className="space-y-4">
          <Button 
            onClick={handleBind} 
            disabled={loading}
            variant="outline"
            className="w-full flex items-center gap-2 bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
            Bind New U-disk
          </Button>

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
        <Button 
          onClick={handleUnlock} 
          disabled={loading}
          className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Verify U-disk to Unlock
        </Button>
      )}
    </div>
  );
};
