import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const useScanner = ({ onScan, onError }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    try {
      setScanning(true);
      const html5QrCode = new Html5Qrcode('reader');
      html5QrCodeRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length) {
        const cameraId = cameras[0].id; // Usamos la primera cámara (normalmente la trasera)
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Éxito al decodificar
            if (onScan) onScan(decodedText);
            // Detener el scanner después de escanear
            stopScanner();
          },
          (errorMessage) => {
            // Error de lectura (no mostrar en consola para no saturar)
            if (onError) onError(errorMessage);
          }
        );
      }
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      setScanning(false);
      if (onError) onError(err.toString());
    }
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setScanning(false);
      }).catch(err => console.error('Error al detener scanner:', err));
    }
  };

  const cleanup = () => {
    stopScanner();
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    scanning,
    startScanner,
    stopScanner,
    scannerRef
  };
};

export default useScanner;