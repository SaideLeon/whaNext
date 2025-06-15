
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, QrCode as QrCodeIcon, LogOut, RefreshCw } from 'lucide-react';
import type { ConnectionStatus } from '@/types';
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";

// Dynamically import whatsapp-web.js client-side
let WWebClient: any = null;
if (typeof window !== 'undefined') {
  try {
    WWebClient = require('whatsapp-web.js').Client;
  } catch (error) {
    console.error("Failed to load whatsapp-web.js:", error);
    // WWebClient will remain null, and connection attempts will fail gracefully.
  }
}


export function WhatsAppConnector({ onMessage, onReady }: { onMessage?: (message: string) => void, onReady?: (isReady: boolean) => void }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Not connected. Click connect to start.');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const clientRef = useRef<any | null>(null); // Using 'any' for WWebClient instance

  useEffect(() => {
    if (WWebClient && !clientRef.current) {
        const newClient = new WWebClient({
            // puppeteer: {
            //   headless: true,
            //   args: ['--no-sandbox', '--disable-setuid-sandbox'] // May be needed in some environments
            // },
            // authStrategy: new LocalAuth() // For session persistence - LocalAuth would need to be required too.
        });
        clientRef.current = newClient;

        newClient.on('qr', async (qrData: string) => {
            console.log('QR RECEIVED:', qrData);
            try {
                const url = await QRCode.toDataURL(qrData, { width: 256, margin: 2 });
                setQrCodeUrl(url);
                setStatus('qr');
                setStatusMessage('Scan this QR code with WhatsApp on your phone.');
            } catch (err) {
                console.error('Failed to generate QR code:', err);
                setStatus('error');
                setStatusMessage('Failed to generate QR code image. Please try again.');
            }
        });

        newClient.on('ready', () => {
            console.log('Client is ready!');
            setStatus('connected');
            setIsAuthenticated(true);
            setQrCodeUrl('');
            setStatusMessage('WhatsApp connected successfully.');
            onReady?.(true);
        });

        newClient.on('authenticated', () => {
            console.log('Client authenticated!');
            // 'ready' usually follows. This confirms auth.
            setIsAuthenticated(true);
            setStatusMessage('Authentication successful. Finalizing connection...');
        });
        
        newClient.on('message', (msg: any) => { // msg is of type Message from whatsapp-web.js
            if (onMessage && typeof msg.body === 'string') {
                onMessage(msg.body);
            }
        });

        newClient.on('disconnected', (reason: any) => {
            console.log('Client was logged out or disconnected:', reason);
            setStatus('disconnected');
            setIsAuthenticated(false);
            setQrCodeUrl('');
            setStatusMessage('WhatsApp disconnected. Please reconnect.');
            onReady?.(false);
        });

        newClient.on('auth_failure', (msg: string) => {
            console.error('Authentication failure:', msg);
            setStatus('error');
            setIsAuthenticated(false);
            setStatusMessage(`Authentication failed: ${msg}. Please try reconnecting.`);
            onReady?.(false);
        });

        newClient.on('loading_screen', (percent: string, message: string) => {
            setStatus('connecting');
            setStatusMessage(`Loading WhatsApp: ${message} (${percent}%)`);
        });
    }

    return () => {
        if (clientRef.current) {
            console.log("Attempting to destroy client on unmount/cleanup");
            clientRef.current.destroy().catch((e: any) => console.error("Error destroying client:", e));
            clientRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount to initialize clientRef and listeners

  const handleConnect = useCallback(() => {
    if (!WWebClient) {
      setStatus('error');
      setStatusMessage('WhatsApp library failed to load. Cannot connect.');
      return;
    }
    if (!clientRef.current) {
        // This might happen if the initial client setup in useEffect failed or is delayed
        console.error("Client instance not available for connection.");
        // Attempt to re-initialize it here if necessary, or guide user
        const newClient = new WWebClient({ /* options */ });
        clientRef.current = newClient;
        // Re-attach listeners if creating new instance here, or ensure useEffect handles this.
        // For simplicity, assuming useEffect's single run sets it up.
        setStatus('error');
        setStatusMessage('Client not ready. Please wait or refresh.');
        return;
    }

    if (status === 'connected' || status === 'connecting' || status === 'qr') {
      console.log("Connection attempt already in progress or connected.");
      return;
    }
    
    setStatus('connecting');
    setStatusMessage('Initializing WhatsApp connection...');
    clientRef.current.initialize()
      .then(() => {
        console.log("Client initialization process started.");
        // 'ready' or 'qr' events will follow
      })
      .catch((err: any) => {
        console.error('Client initialization failed:', err);
        setStatus('error');
        setStatusMessage('WhatsApp initialization failed. Check console for details.');
        onReady?.(false);
      });
  }, [status, onReady]);

  const handleDisconnect = useCallback(async () => {
    if (clientRef.current && isAuthenticated) {
      setStatusMessage('Logging out...');
      try {
        await clientRef.current.logout(); // This should trigger the 'disconnected' event
        console.log("Logout command sent.");
      } catch (error) {
        console.error('Logout failed:', error);
        setStatus('error');
        setStatusMessage('Logout failed. You might need to refresh. Forcing disconnect state.');
        // Force state update if 'disconnected' event doesn't fire
        setIsAuthenticated(false);
        setQrCodeUrl('');
        setStatus('disconnected');
        onReady?.(false);
      }
    } else {
        // Already disconnected or client not initialized properly
        setStatus('disconnected');
        setIsAuthenticated(false);
        setQrCodeUrl('');
        setStatusMessage('Already disconnected or client not available.');
        onReady?.(false);
    }
  }, [isAuthenticated, onReady]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'connecting': case 'qr': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const StatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className={`mr-2 h-5 w-5 ${getStatusColor()}`} />;
      case 'error': return <XCircle className={`mr-2 h-5 w-5 ${getStatusColor()}`} />;
      case 'connecting': return <Loader2 className={`mr-2 h-5 w-5 animate-spin ${getStatusColor()}`} />;
      case 'qr': return <QrCodeIcon className={`mr-2 h-5 w-5 ${getStatusColor()}`} />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-headline">
          <WhatsAppLogo className="w-7 h-7 mr-2 text-primary" />
          WhatsApp Connection
        </CardTitle>
        <CardDescription>Connect to WhatsApp Web to enable auto-replies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!WWebClient && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              The WhatsApp library (whatsapp-web.js) could not be loaded. This component may not function correctly.
              This library is typically for Node.js environments.
            </AlertDescription>
          </Alert>
        )}
        <Alert variant={status === 'error' ? 'destructive' : 'default'} className="shadow-sm">
          <StatusIcon />
          <AlertTitle className={`font-semibold ${getStatusColor()}`}>Connection Status</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>

        {status === 'qr' && qrCodeUrl && (
          <div className="flex flex-col items-center p-4 border rounded-md bg-muted/20 shadow-inner">
            <p className="mb-2 text-center text-sm font-medium">Scan QR with WhatsApp</p>
            <Image src={qrCodeUrl} alt="WhatsApp QR Code" width={256} height={256} className="rounded-md border shadow-md" data-ai-hint="qr code" />
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Open WhatsApp on your phone, go to Linked Devices and scan this code.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          {!isAuthenticated && status !== 'connecting' && status !== 'qr' && (
            <Button onClick={handleConnect} className="w-full" aria-label="Connect to WhatsApp" disabled={!WWebClient}>
              <QrCodeIcon className="mr-2 h-4 w-4" /> Connect
            </Button>
          )}
          {isAuthenticated && (
            <Button onClick={handleDisconnect} variant="destructive" className="w-full" aria-label="Disconnect from WhatsApp">
              <LogOut className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          )}
          {(status === 'error' || (status === 'disconnected' && !isAuthenticated)) && (
             <Button onClick={handleConnect} variant="outline" className="w-full" aria-label="Retry Connection" disabled={!WWebClient}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          )}
        </div>
        {status === 'connecting' && (
           <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Attempting to connect... This might take a moment.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    