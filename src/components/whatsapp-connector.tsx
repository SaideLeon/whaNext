
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, QrCode, LogOut, RefreshCw } from 'lucide-react';
import type { ConnectionStatus } from '@/types';
import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";

// Simulating whatsapp-web.js client events and states
// In a real app, this logic would be driven by events from a backend whatsapp-web.js instance.

export function WhatsAppConnector({ onMessage, onReady }: { onMessage?: (message: string) => void, onReady?: (isReady: boolean) => void }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Not connected. Click connect to start.');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const generateQrCode = useCallback(async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, { width: 256, margin: 2 });
      setQrCodeUrl(url);
      setStatus('qr');
      setStatusMessage('Scan the QR code with your WhatsApp app.');
    } catch (err) {
      console.error('Failed to generate QR code', err);
      setStatus('error');
      setStatusMessage('Failed to generate QR code. Please try again.');
    }
  }, []);
  
  const simulateConnection = useCallback(() => {
    if (isAuthenticated) {
      setStatus('connected');
      setStatusMessage('WhatsApp connected successfully.');
      onReady?.(true);
      return;
    }

    setStatus('connecting');
    setStatusMessage('Attempting to connect to WhatsApp...');
    
    // Simulate QR code generation
    setTimeout(() => {
      // In a real app, whatsapp-web.js would emit a 'qr' event with QR data.
      const pseudoQrData = `SIMULATED_QR_DATA_${Date.now()}`;
      generateQrCode(pseudoQrData);
    }, 2000);

    // Simulate successful scan and ready event
    setTimeout(() => {
      if (status === 'qr') { // Only proceed if QR was shown (user "scanned")
        setIsAuthenticated(true);
        setStatus('connected');
        setQrCodeUrl('');
        setStatusMessage('WhatsApp connected successfully.');
        onReady?.(true);
        // Simulate receiving a message after connection
        setTimeout(() => {
          onMessage?.("Hello from simulated WhatsApp!");
        }, 2000);
      }
    }, 10000); // User has 8 seconds to "scan" after QR appears
  }, [isAuthenticated, generateQrCode, onMessage, onReady, status]);

  const disconnect = () => {
    setIsAuthenticated(false);
    setStatus('disconnected');
    setQrCodeUrl('');
    setStatusMessage('Disconnected. Click connect to start again.');
    onReady?.(false);
  };

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
      case 'qr': return <QrCode className={`mr-2 h-5 w-5 ${getStatusColor()}`} />;
      default: return null;
    }
  };
  
  // Effect to load stored authentication state (e.g. from localStorage)
  useEffect(() => {
    const storedAuth = localStorage.getItem('whatsappAutoreplyAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setStatus('connected');
      setStatusMessage('WhatsApp connected successfully.');
      onReady?.(true);
    }
  }, [onReady]);

  // Store auth state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('whatsappAutoreplyAuth', 'true');
    } else {
      localStorage.removeItem('whatsappAutoreplyAuth');
    }
  }, [isAuthenticated]);


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
        <Alert variant={status === 'error' ? 'destructive' : 'default'} className="shadow-sm">
          <StatusIcon />
          <AlertTitle className={`font-semibold ${getStatusColor()}`}>Connection Status</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>

        {status === 'qr' && qrCodeUrl && (
          <div className="flex flex-col items-center p-4 border rounded-md bg-muted/20 shadow-inner">
            <p className="mb-2 text-center text-sm">Scan this QR code with WhatsApp on your phone.</p>
            <Image src={qrCodeUrl} alt="WhatsApp QR Code" width={256} height={256} className="rounded-md border shadow-md" data-ai-hint="qr code" />
          </div>
        )}

        <div className="flex gap-4">
          {!isAuthenticated && status !== 'connecting' && status !== 'qr' && (
            <Button onClick={simulateConnection} className="w-full" aria-label="Connect to WhatsApp">
              <QrCode className="mr-2 h-4 w-4" /> Connect
            </Button>
          )}
          {isAuthenticated && (
            <Button onClick={disconnect} variant="destructive" className="w-full" aria-label="Disconnect from WhatsApp">
              <LogOut className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          )}
          {(status === 'error' || status === 'disconnected') && !isAuthenticated && (
             <Button onClick={simulateConnection} variant="outline" className="w-full" aria-label="Retry Connection">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
