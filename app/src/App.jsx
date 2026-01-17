
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Settings, Save, Download, Zap, ZapOff, Layers } from 'lucide-react';

import { useWebSerial } from './hooks/useWebSerial';

function App() {
  const { isConnected, connect, disconnect, sendCommand, readResponse } = useWebSerial();
  const LAYERS = 3;
  
  // Default to 5, but will adjust if device sends more
  const [controlsPerLayer, setControlsPerLayer] = useState(5);
  const [slotTypes, setSlotTypes] = useState({});

  // Auto-detect hardware config on connection
  useEffect(() => {
    if (isConnected) {
        const fetchInfo = async () => {
            // Small delay to ensure port is ready
            await new Promise(r => setTimeout(r, 100));
            
            try {
                await sendCommand("INFO");
                const lines = await readResponse(1000);
                
                const newSlotTypes = {};
                lines.forEach(line => {
                    if (line.startsWith("SYS:CONTROLS:")) {
                        const val = parseInt(line.split(":")[2]);
                        if (!isNaN(val) && val > 0) {
                            setControlsPerLayer(val);
                        }
                    } else if (line.startsWith("SYS:TYPE:")) {
                        // SYS:TYPE:index:type
                        const parts = line.split(":");
                        if (parts.length >= 4) {
                            newSlotTypes[parseInt(parts[2])] = parts[3].trim();
                        }
                    }
                });
                setSlotTypes(newSlotTypes);
            } catch (e) {
                console.error("Info fetch failed", e);
            }
        };
        fetchInfo();
    }
  }, [isConnected]);
  
  // Initialize state
  const [buttons, setButtons] = useState(
      Array.from({ length: LAYERS * 5 }, (_, i) => ({
          id: i,
          type: 'Note',
          value: 60 + i,
          mode: 'Momentary',
          min: 0,
          max: 127
      }))
  );

  // Resize buttons array when controlsPerLayer changes
  useEffect(() => {
     setButtons(prev => {
         const newSize = LAYERS * controlsPerLayer;
         if (prev.length === newSize) return prev;
         
         const newArr = Array.from({ length: newSize }, (_, i) => ({
            id: i,
            type: 'Note',
            value: 60 + i,
            mode: 'Momentary',
            min: 0,
            max: 127
         }));
         
         // Preserve existing data where possible
         prev.forEach((p, i) => {
             if (i < newArr.length) newArr[i] = p;
         });
         return newArr;
     });
  }, [controlsPerLayer]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeLayer, setActiveLayer] = useState(1); // Default to Center (Layer 1)

  const handleLoad = async () => {
      setIsLoading(true);
      setStatusMsg("Loading...");
      try {
          await sendCommand("GET");
          // Give it a moment to process command
          const lines = await readResponse(2000); // 2s timeout for more data
          
          let maxIndex = 0;
          const parsedData = [];

          lines.forEach(line => {
              line = line.trim();
              if (line.startsWith("BTN:")) {
                  // BTN:idx:type:val:mode:min:max
                  const parts = line.split(":");
                  if (parts.length >= 5) {
                      const idx = parseInt(parts[1]);
                      if (idx > maxIndex) maxIndex = idx;
                      
                      const type = parts[2] === '1' ? 'CC' : 'Note';
                      const val = parseInt(parts[3]);
                      const mode = parts[4] === '1' ? 'Toggle' : 'Momentary';
                      const min = parts.length >= 7 ? parseInt(parts[5]) : 0;
                      const max = parts.length >= 7 ? parseInt(parts[6]) : 127;

                      parsedData.push({ idx, type, value: val, mode, min, max });
                  }
              }
          });

          // Infer layout from data
          const detectedTotal = maxIndex + 1;
          const detectedPerLayer = Math.ceil(detectedTotal / LAYERS);
          
          if (detectedPerLayer !== controlsPerLayer) {
             setControlsPerLayer(detectedPerLayer);
          }

          // Rebuild array
          const newButtons = Array.from({ length: LAYERS * detectedPerLayer }, (_, i) => ({
              id: i,
              type: 'Note', // defaults
              value: 60 + i,
              mode: 'Momentary',
              min: 0,
              max: 127
          }));

          parsedData.forEach(d => {
             if (newButtons[d.idx]) {
                 newButtons[d.idx] = { 
                    id: d.idx, 
                    type: d.type, 
                    value: d.value, 
                    mode: d.mode,
                    min: d.min,
                    max: d.max
                 };
             }
          });

          setButtons(newButtons);
          setStatusMsg("Loaded successfully");
      } catch (e) {
          setStatusMsg("Error loading: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSave = async () => {
      if (!confirm("Overwrite device settings?")) return;
      
      setIsLoading(true);
      setStatusMsg("Saving...");
      try {
          // Send SET commands for ALL buttons
          for (const btn of buttons) {
              const typeInt = btn.type === 'CC' ? 1 : 0;
              const modeInt = btn.mode === 'Toggle' ? 1 : 0;
              const minVal = btn.min ?? 0;
              const maxVal = btn.max ?? 127;
              
              const cmd = `SET ${btn.id} ${typeInt} ${btn.value} ${modeInt} ${minVal} ${maxVal}`;
              await sendCommand(cmd);
              // tiny delay to prevent buffer overflow
              await new Promise(r => setTimeout(r, 30));
          }
          
          await sendCommand("SAVE");
          setStatusMsg("Saved to EEPROM!");
      } catch (e) {
           setStatusMsg("Error saving: " + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  const updateButton = (globalIndex, field, value) => {
      const newButtons = [...buttons];
      newButtons[globalIndex] = { ...newButtons[globalIndex], [field]: value };
      setButtons(newButtons);
  };

  const renderLayerTab = (layerIndex, label) => (
      <button
          onClick={() => setActiveLayer(layerIndex)}
          className={clsx(
              "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
              activeLayer === layerIndex 
                  ? "border-primary text-primary bg-primary/5" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          )}
      >
          {label}
      </button>
  );

  return (
    <div className="flex justify-center p-8 min-h-screen">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-8 h-8 text-primary" />
                MIDI Pedal Configurator
            </h1>
            
            <div className={clsx("px-3 py-1 rounded-full text-sm font-medium", 
                isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                {isConnected ? "Connected" : "Disconnected"}
            </div>
        </div>

        {/* Connection Panel */}
        <div className="bg-card rounded-xl p-6 border border-gray-800 flex items-center justify-between">
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Device Connection</h2>
                <p className="text-slate-400 text-sm">{isConnected ? "Ready to configure" : "Select your Web Serial device"}</p>
            </div>
            
            {!isConnected ? (
                <button 
                    onClick={connect}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <Zap className="w-4 h-4" /> Connect Device
                </button>
            ) : (
                <button 
                    onClick={disconnect}
                    className="flex items-center gap-2 bg-transparent border border-gray-700 hover:bg-gray-800 text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    <ZapOff className="w-4 h-4" /> Disconnect
                </button>
            )}
        </div>

        {/* Status Bar */}
        {statusMsg && (
            <div className="bg-input p-3 rounded-lg text-sm text-slate-400 text-center border border-gray-800">
                {statusMsg}
            </div>
        )}

        {/* Configuration Area */}
        <div className={clsx("transition-opacity duration-300 space-y-4", !isConnected && "opacity-50 pointer-events-none")}>
            
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Button Mapping
                </h2>
                <div className="flex gap-3">
                    <button onClick={handleLoad} disabled={isLoading} className="flex items-center gap-2 bg-card border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-slate-200 transition-colors">
                        <Download className="w-4 h-4" /> Load from Pedal
                    </button>
                    <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 bg-primary hover:bg-primary-hover px-4 py-2 rounded-lg text-white transition-colors">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-card border border-gray-800 rounded-xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    {renderLayerTab(0, "Left Position (Layer 1)")}
                    {renderLayerTab(1, "Center Position (Layer 2)")}
                    {renderLayerTab(2, "Right Position (Layer 3)")}
                </div>

                {/* Table */}
                <table className="w-full text-left">
                    <thead className="bg-[#162032] text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-4 font-semibold">Slot</th>
                            <th className="px-4 py-4 font-semibold">Type</th>
                            <th className="px-4 py-4 font-semibold">ID #</th>
                            <th className="px-4 py-4 font-semibold">OFF Val</th>
                            <th className="px-4 py-4 font-semibold">ON Val</th>
                            <th className="px-4 py-4 font-semibold">Mode</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {buttons.slice(activeLayer * controlsPerLayer, (activeLayer + 1) * controlsPerLayer).map((btn, localIndex) => {
                            const globalIndex = activeLayer * controlsPerLayer + localIndex;
                            const isPot = slotTypes[localIndex] === 'POT';
                            
                            return (
                                <tr key={globalIndex} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-200">

                                        <span className="flex items-center gap-2">
                                            {isPot ? (
                                                <>Slot {localIndex} <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">POT</span></>
                                            ) : (
                                                <>Slot {localIndex} <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">BTN</span></>
                                            )}
                                        </span>
                                      
                                    </td>
                                    <td className="px-4 py-4">
                                        <select 
                                            value={btn.type}
                                            onChange={(e) => updateButton(globalIndex, 'type', e.target.value)}
                                            className="bg-input border border-gray-700 rounded px-2 py-2 text-slate-200 outline-none focus:border-primary w-24 appearance-none cursor-pointer"
                                        >
                                            <option value="Note">Note</option>
                                            <option value="CC">CC</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4">
                                        <input 
                                            type="number" 
                                            min="0" max="127"
                                            value={btn.value}
                                            onChange={(e) => updateButton(globalIndex, 'value', parseInt(e.target.value))}
                                            className="bg-input border border-gray-700 rounded px-2 py-2 text-slate-200 outline-none focus:border-primary w-20"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        {!isPot && (
                                            <input 
                                                type="number" 
                                                min="0" max="127"
                                                value={btn.min ?? 0}
                                                onChange={(e) => updateButton(globalIndex, 'min', parseInt(e.target.value))}
                                                className="bg-input border border-gray-700 rounded px-2 py-2 text-slate-200 outline-none focus:border-primary w-20"
                                                title="Value sent when released (OFF)"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {!isPot && (
                                            <input 
                                                type="number" 
                                                min="0" max="127"
                                                value={btn.max ?? 127}
                                                onChange={(e) => updateButton(globalIndex, 'max', parseInt(e.target.value))}
                                                className="bg-input border border-gray-700 rounded px-2 py-2 text-slate-200 outline-none focus:border-primary w-20"
                                                title="Value sent when pressed (ON)"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {isPot ? (
                                            <span className="text-slate-500 text-sm italic">Linear</span>
                                        ) : (
                                            <select 
                                                value={btn.mode}
                                                onChange={(e) => updateButton(globalIndex, 'mode', e.target.value)}
                                                className="bg-input border border-gray-700 rounded px-2 py-2 text-slate-200 outline-none focus:border-primary w-28 appearance-none cursor-pointer"
                                            >
                                                <option value="Momentary">Momentary</option>
                                                <option value="Toggle">Toggle</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <p className="text-xs text-slate-500 text-center pt-2">
                * Layer 2 (Center) is the default if switch is disconnected.
            </p>
        </div>

      </div>
    </div>
  )
}

export default App
