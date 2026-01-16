// src/hooks/useWebSerial.js
import { useState, useRef, useCallback } from 'react';

export function useWebSerial() {
    const [isConnected, setIsConnected] = useState(false);
    const [port, setPort] = useState(null);
    const readerRef = useRef(null);
    const writerRef = useRef(null);

    const connect = useCallback(async () => {
        if (!navigator.serial) {
            alert("WebSerial is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const selectedPort = await navigator.serial.requestPort();
            await selectedPort.open({ baudRate: 115200 });

            setPort(selectedPort);
            setIsConnected(true);
            return selectedPort;
        } catch (error) {
            console.error("Connection failed", error);
            throw error;
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (port) {
            try {
                if (readerRef.current) await readerRef.current.cancel();
                if (writerRef.current) await writerRef.current.close();
                await port.close();
            } catch (e) {
                console.error("Error closing port", e);
            }
            setPort(null);
            setIsConnected(false);
        }
    }, [port]);

    const sendCommand = useCallback(async (cmd) => {
        if (!port || !port.writable) return;
        
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        writerRef.current = writer;
        
        await writer.write(encoder.encode(cmd + '\n'));
        writer.releaseLock();
    }, [port]);

    const readLine = useCallback(async () => {
        if (!port || !port.readable) return [];

        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        readerRef.current = reader;

        let buffer = "";
        const lines = [];
        
        try {
            // Read for a short duration or until we get meaningful data
            // Since we can't easily timeout a reader, we rely on the device sending data quickly
            // For now, let's implement a simple loop that we break internally logic
            
            // Actually, best pattern for request-response:
            // This reader will block until data comes.
            // But we need to define when to STOP reading.
            // For this specific app, we know the device sends a burst of data after GET command.
            // We can read until we don't get data for X ms, or valid lines count.
            
            // NOTE: A robust implementation would keep the reader open in a background effect
            // and push lines to a buffer/state. But for this simple configurator, 
            // we will read continuously in a burst.
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    buffer += value;
                    if (buffer.includes('\n')) {
                        const chunks = buffer.split('\n');
                        buffer = chunks.pop(); // keep incomplete chunk
                        lines.push(...chunks);
                        
                        // Heuristic: if we have 5 parsing lines, we are arguably done
                        if (lines.filter(l => l.startsWith("BTN:")).length >= 5) {
                            break; 
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Read error", error);
        } finally {
            reader.cancel();
            await readableStreamClosed.catch(() => {}); // ignore errors on close
        }
        return lines;
    }, [port]);

    // A specialized read function that opens, reads until satisfied, then cancels
    // This connects the specific logic of the App to the raw stream
    const readResponse = useCallback(async (timeoutMs = 1500) => {
      if (!port || !port.readable) return [];

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      
      let buffer = "";
      let lines = [];
      let lastRead = Date.now();

      try {
        // We poll loosely
        while (Date.now() - lastRead < timeoutMs) {
          // We can't block on read() forever if device is silent, but read() has no timeout natively
          // Workaround: Promise.race with a timeout
          const readPromise = reader.read();
          const timeoutPromise = new Promise(r => setTimeout(() => r({timeout: true}), 200)); 
          
          const result = await Promise.race([readPromise, timeoutPromise]);
          
          if (result.timeout) {
             // no data, continue loop to check full timeoutMs
             continue;
          }

          if (result.done) break;
          
          if (result.value) {
             lastRead = Date.now(); // reset timeout on data
             buffer += result.value;
             if (buffer.includes('\n')) {
                 const chunks = buffer.split('\n');
                 buffer = chunks.pop(); 
                 lines.push(...chunks);
                 
                 // If we find the completion signal, return
                 if (lines.some(l => l.trim() === "OK: GET")) {
                     break; 
                 }
             }
          }
        }
      } catch (e) {
          console.error(e);
      } finally {
          await reader.cancel();
          await readableStreamClosed.catch(() => {}); 
      }
      return lines;
    }, [port]);

    return { isConnected, connect, disconnect, sendCommand, readResponse };
}
