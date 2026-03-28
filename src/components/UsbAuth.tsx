import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HardwareButton as Button } from './ui/Components';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, Loader2, Fingerprint, Trash2 } from 'lucide-react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface UsbAuthProps {
  mode: 'bind' | 'unlock';
  userId?: string;
  email?: string;
  onSuccess?: () => void;
}

export const UsbAuth: React.FC<UsbAuthProps> = ({ mode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [boundDevices, setBoundDevices] = useState<any[]>([]);

  useEffect(() => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
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
        .from('user_passkeys')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (data) setBoundDevices(data);
    } catch (error) {
      console.error("Failed to fetch bound devices", error);
    }
  };

  const handleBind = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 1. Get registration options from server
      const optionsRes = await fetch("/api/webauthn/generate-registration-options", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      
      const optionsData = await optionsRes.json();
      if (!optionsData.success) throw new Error(optionsData.message);

      // 2. Start WebAuthn registration in browser
      const attResp = await startRegistration({ optionsJSON: optionsData.options });

      // 3. Send response to server for verification
      const verifyRes = await fetch("/api/webauthn/verify-registration", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          response: attResp,
          challengeId: optionsData.challengeId
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        toast.success("Passkey registered successfully!");
        fetchBoundDevices();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(verifyData.message || "Verification failed");
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        toast.error("Registration cancelled or blocked by browser.");
      } else {
        toast.error(error.message || "An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    try {
      // 1. Get authentication options from server
      const optionsRes = await fetch("/api/webauthn/generate-authentication-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const optionsData = await optionsRes.json();
      if (!optionsData.success) throw new Error(optionsData.message);

      // 2. Start WebAuthn authentication in browser
      const asseResp = await startAuthentication({ optionsJSON: optionsData.options });

      // 3. Send response to server for verification
      const verifyRes = await fetch("/api/webauthn/verify-authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: asseResp,
          challengeId: optionsData.challengeId
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.action_link) {
        toast.success("Authentication successful! Redirecting...");
        window.location.href = verifyData.action_link;
      } else {
        throw new Error(verifyData.message || "Verification failed");
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        toast.error("Authentication cancelled or blocked by browser.");
      } else {
        toast.error(error.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('user_passkeys').delete().eq('id', id);
      if (error) throw error;
      toast.success("Passkey removed");
      fetchBoundDevices();
    } catch (error: any) {
      toast.error("Failed to remove passkey");
    }
  };

  if (!supported) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-red-400">WebAuthn Not Supported</h4>
          <p className="text-xs text-red-400/80 mt-1">
            Your browser or device does not support Passkeys/WebAuthn. Please use a modern browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === 'bind' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Passkeys & Hardware Keys
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Use your device's biometric sensor (Touch ID, Face ID) or a dedicated security key (YubiKey) for passwordless login.
              </p>
            </div>
            <Button 
              onClick={handleBind} 
              disabled={loading}
              className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Register Passkey
            </Button>
          </div>

          {boundDevices.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Registered Keys</h4>
              {boundDevices.map((device, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Fingerprint className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        Passkey {idx + 1}
                      </p>
                      <p className="text-xs text-zinc-500 font-mono">
                        Added: {new Date(device.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(device.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    title="Remove Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Sign in with Passkey
            </h4>
            <p className="text-xs text-emerald-400/80 mt-1 mb-4">
              Use your registered device biometrics or security key to sign in instantly.
            </p>
            <Button 
              onClick={handleUnlock} 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-transparent"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Fingerprint className="w-4 h-4 mr-2" />}
              Verify Passkey
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
