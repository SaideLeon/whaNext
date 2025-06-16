
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
    console.error("Falha ao carregar whatsapp-web.js:", error);
    // WWebClient will remain null, and connection attempts will fail gracefully.
  }
}


export function WhatsAppConnector({ onMessage, onReady }: { onMessage?: (message: string) => void, onReady?: (isReady: boolean) => void }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Desconectado. Clique em conectar para iniciar.');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const clientRef = useRef<any | null>(null);

  useEffect(() => {
    if (WWebClient && !clientRef.current) {
        const newClient = new WWebClient({
            // puppeteer: {
            //   headless: true,
            //   args: ['--no-sandbox', '--disable-setuid-sandbox']
            // },
        });
        clientRef.current = newClient;

        newClient.on('qr', async (qrData: string) => {
            console.log('QR RECEBIDO:', qrData);
            try {
                const url = await QRCode.toDataURL(qrData, { width: 256, margin: 2 });
                setQrCodeUrl(url);
                setStatus('qr');
                setStatusMessage('Este QR code é para fins de demonstração e não estabelece uma conexão real com o WhatsApp.');
            } catch (err) {
                console.error('Falha ao gerar QR code:', err);
                setStatus('error');
                setStatusMessage('Falha ao gerar a imagem do QR code. Por favor, tente novamente.');
            }
        });

        newClient.on('ready', () => {
            console.log('Cliente pronto!');
            setStatus('connected');
            setIsAuthenticated(true);
            setQrCodeUrl('');
            setStatusMessage('WhatsApp conectado com sucesso.');
            onReady?.(true);
        });

        newClient.on('authenticated', () => {
            console.log('Cliente autenticado!');
            setIsAuthenticated(true);
            setStatusMessage('Autenticação bem-sucedida. Finalizando conexão...');
        });
        
        newClient.on('message', (msg: any) => { 
            if (onMessage && typeof msg.body === 'string') {
                onMessage(msg.body);
            }
        });

        newClient.on('disconnected', (reason: any) => {
            console.log('Cliente foi desconectado:', reason);
            setStatus('disconnected');
            setIsAuthenticated(false);
            setQrCodeUrl('');
            setStatusMessage('WhatsApp desconectado. Por favor, reconecte.');
            onReady?.(false);
        });

        newClient.on('auth_failure', (msg: string) => {
            console.error('Falha na autenticação:', msg);
            setStatus('error');
            setIsAuthenticated(false);
            setStatusMessage(`Falha na autenticação: ${msg}. Por favor, tente reconectar.`);
            onReady?.(false);
        });

        newClient.on('loading_screen', (percent: string, message: string) => {
            setStatus('connecting');
            setStatusMessage(`Carregando WhatsApp: ${message} (${percent}%)`);
        });
    }

    return () => {
        if (clientRef.current) {
            console.log("Tentando destruir o cliente ao desmontar/limpar");
            clientRef.current.destroy().catch((e: any) => console.error("Erro ao destruir o cliente:", e));
            clientRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleConnect = useCallback(() => {
    if (!WWebClient) {
      setStatus('error');
      setStatusMessage('Falha ao carregar a biblioteca WhatsApp. Não é possível conectar.');
      return;
    }
    if (!clientRef.current) {
        console.error("Instância do cliente não disponível para conexão.");
        const newClient = new WWebClient({ /* options */ });
        clientRef.current = newClient;
        setStatus('error');
        setStatusMessage('Cliente não pronto. Por favor, aguarde ou atualize.');
        return;
    }

    if (status === 'connected' || status === 'connecting' || status === 'qr') {
      console.log("Tentativa de conexão já em andamento ou conectado.");
      return;
    }
    
    setStatus('connecting');
    setStatusMessage('Iniciando conexão com o WhatsApp...');
    clientRef.current.initialize()
      .then(() => {
        console.log("Processo de inicialização do cliente iniciado.");
      })
      .catch((err: any) => {
        console.error('Falha na inicialização do cliente:', err);
        setStatus('error');
        setStatusMessage('Falha na inicialização do WhatsApp. Verifique o console para detalhes.');
        onReady?.(false);
      });
  }, [status, onReady]);

  const handleDisconnect = useCallback(async () => {
    if (clientRef.current && isAuthenticated) {
      setStatusMessage('Saindo...');
      try {
        await clientRef.current.logout(); 
        console.log("Comando de logout enviado.");
      } catch (error) {
        console.error('Logout falhou:', error);
        setStatus('error');
        setStatusMessage('Falha no logout. Pode ser necessário atualizar. Forçando estado de desconexão.');
        setIsAuthenticated(false);
        setQrCodeUrl('');
        setStatus('disconnected');
        onReady?.(false);
      }
    } else {
        setStatus('disconnected');
        setIsAuthenticated(false);
        setQrCodeUrl('');
        setStatusMessage('Já desconectado ou cliente não disponível.');
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
          Conexão WhatsApp
        </CardTitle>
        <CardDescription>Conecte-se ao WhatsApp Web para ativar respostas automáticas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!WWebClient && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              A biblioteca WhatsApp (whatsapp-web.js) não pôde ser carregada. Este componente pode não funcionar corretamente.
              Esta biblioteca é normalmente para ambientes Node.js.
            </AlertDescription>
          </Alert>
        )}
        <Alert variant={status === 'error' ? 'destructive' : 'default'} className="shadow-sm">
          <StatusIcon />
          <AlertTitle className={`font-semibold ${getStatusColor()}`}>Status da Conexão</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>

        {status === 'qr' && qrCodeUrl && (
          <div className="flex flex-col items-center p-4 border rounded-md bg-muted/20 shadow-inner">
            <p className="mb-2 text-center text-sm font-medium">QR Code de Demonstração</p>
            <Image src={qrCodeUrl} alt="WhatsApp QR Code" width={256} height={256} className="rounded-md border shadow-md" data-ai-hint="qr code" />
            <p className="mt-2 text-xs text-muted-foreground text-center">
             Este é um QR code de demonstração. Em uma aplicação real, você o escanearia com o WhatsApp no seu celular.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          {!isAuthenticated && status !== 'connecting' && status !== 'qr' && (
            <Button onClick={handleConnect} className="w-full" aria-label="Conectar ao WhatsApp" disabled={!WWebClient}>
              <QrCodeIcon className="mr-2 h-4 w-4" /> Conectar
            </Button>
          )}
          {isAuthenticated && (
            <Button onClick={handleDisconnect} variant="destructive" className="w-full" aria-label="Desconectar do WhatsApp">
              <LogOut className="mr-2 h-4 w-4" /> Desconectar
            </Button>
          )}
          {(status === 'error' || (status === 'disconnected' && !isAuthenticated)) && (
             <Button onClick={handleConnect} variant="outline" className="w-full" aria-label="Tentar Conexão Novamente" disabled={!WWebClient}>
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          )}
        </div>
        {status === 'connecting' && (
           <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Tentando conectar... Isso pode levar um momento.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
