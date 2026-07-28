
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import { Settings, Save, ArrowDownFromLine, Zap, ZapOff, Layers, Trash2, Upload, Download } from 'lucide-react';

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
    const fileInputRef = useRef(null);

    const handleExportConfig = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buttons, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pedal_config.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportConfig = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    setButtons(prev => {
                        const newB = [...prev];
                        importedData.forEach(item => {
                            // Try to match by ID, ensuring we don't break the array structure
                            const idx = newB.findIndex(b => b.id === item.id);
                            if (idx !== -1) {
                                newB[idx] = { ...newB[idx], ...item };
                            }
                        });
                        return newB;
                    });
                    setStatusMsg("Config imported successfully!");
                } else {
                    setStatusMsg("Invalid config file format.");
                }
            } catch (err) {
                setStatusMsg("Error parsing config file.");
            }
        };
        // Reset input so same file can be selected again
        event.target.value = '';
    };

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

    const handleReset = async () => {
        if (!confirm("Are you sure you want to factory reset the device? This will erase all your settings.")) return;

        setIsLoading(true);
        setStatusMsg("Resetting...");
        try {
            await sendCommand("RESET");
            await new Promise(r => setTimeout(r, 1000)); // Wait for flash
            setStatusMsg("Device Reset!");
            await handleLoad();
        } catch (e) {
            setStatusMsg("Reset failed: " + e.message);
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
        <>
            <div class="flex h-screen w-full overflow-hidden select-none"
                style="background-color: rgb(17, 17, 17); font-family: Inter, sans-serif">
                <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-50" style="
      background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E&quot;);
      background-size: 250px 250px;
      opacity: 0.028;
      mix-blend-mode: screen;
    "></div>


                <LeftSidebar />

                <main class="flex-1 flex flex-col overflow-hidden">
                    <header class="flex items-center justify-between px-8 shrink-0"
                        style="height: 64px; border-bottom: 1px solid rgba(255, 255, 255, 0.05)">
                        <div>
                            <h1 class="text-white font-semibold text-lg leading-none tracking-tight">
                                Button Configuration
                            </h1>
                            <p class="text-xs mt-1 leading-none" style="
            color: rgb(68, 68, 68);
            font-family: &quot;JetBrains Mono&quot;, monospace;
          ">
                                10 inputs &nbsp;·&nbsp; 3 layers
                            </p>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-xs mr-2" style="color: rgb(58, 58, 58)">LAYER</span><button
                                class="rounded-lg text-xs font-medium transition-all duration-150" style="
            width: 34px;
            height: 30px;
            background-color: rgb(34, 34, 34);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: rgb(255, 255, 255);
            font-family: &quot;JetBrains Mono&quot;, monospace;
          ">
                                1</button><button class="rounded-lg text-xs font-medium transition-all duration-150" style="
            width: 34px;
            height: 30px;
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: rgb(68, 68, 68);
            font-family: &quot;JetBrains Mono&quot;, monospace;
          ">
                                2</button><button class="rounded-lg text-xs font-medium transition-all duration-150" style="
            width: 34px;
            height: 30px;
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: rgb(68, 68, 68);
            font-family: &quot;JetBrains Mono&quot;, monospace;
          ">
                                3
                            </button>
                        </div>
                    </header>
                    <div class="flex-1 overflow-y-auto px-8 py-6">
                        <div class="grid items-center px-4 pb-3 mb-1" style="grid-template-columns: 56px 80px 1fr 1fr 1fr 1fr 1fr">
                            <span class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">#</span><span
                                class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">Type</span><span
                                    class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">Signal</span><span
                                        class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">ID</span><span
                                            class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">Off</span><span
                                                class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">On</span><span
                                                    class="text-xs font-medium tracking-widest uppercase" style="color: rgb(51, 51, 51)">Mode</span>
                        </div>
                        <div class="flex flex-col gap-1">

                            {/* ROW */}
                            <div class="grid items-center px-4 rounded-xl transition-colors duration-75 group" style="
            grid-template-columns: 56px 80px 1fr 1fr 1fr 1fr 1fr;
            height: 48px;
            background-color: rgb(22, 22, 22);
            border: 1px solid rgba(255, 255, 255, 0.05);
          ">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-semibold tabular-nums" style="
                color: rgb(85, 85, 85);
                font-family: &quot;JetBrains Mono&quot;, monospace;
              ">07</span>
                                </div>
                                <div>
                                    <span class="text-xs px-2 py-0.5 rounded-md font-medium" style="
                background-color: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.18);
                color: rgb(129, 140, 248);
              ">toggle</span>
                                </div>
                                <select class="appearance-none cursor-pointer" style="
              background-color: transparent;
              border: 1px solid transparent;
              color: rgb(160, 160, 160);
              font-family: &quot;JetBrains Mono&quot;, monospace;
              font-size: 12px;
              border-radius: 8px;
              outline: none;
              transition: 0.1s;
              width: 76px;
              padding: 4px 8px;
            ">
                                    <option value="Note" style="
                background-color: rgb(30, 30, 30);
                color: rgb(224, 224, 224);
              ">
                                        Note
                                    </option>
                                    <option value="CC" style="
                background-color: rgb(30, 30, 30);
                color: rgb(224, 224, 224);
              ">
                                        CC
                                    </option>
                                </select><input type="number" min="0" max="127" value="42" style="
              background-color: transparent;
              border: 1px solid transparent;
              color: rgb(160, 160, 160);
              font-family: &quot;JetBrains Mono&quot;, monospace;
              font-size: 12px;
              border-radius: 8px;
              outline: none;
              transition: 0.1s;
              width: 64px;
              padding: 4px 8px;
              text-align: center;
            " /><input type="number" min="0" max="127" value="0" style="
              background-color: transparent;
              border: 1px solid transparent;
              color: rgb(160, 160, 160);
              font-family: &quot;JetBrains Mono&quot;, monospace;
              font-size: 12px;
              border-radius: 8px;
              outline: none;
              transition: 0.1s;
              width: 64px;
              padding: 4px 8px;
              text-align: center;
            " /><input type="number" min="0" max="127" value="127" style="
              background-color: transparent;
              border: 1px solid transparent;
              color: rgb(160, 160, 160);
              font-family: &quot;JetBrains Mono&quot;, monospace;
              font-size: 12px;
              border-radius: 8px;
              outline: none;
              transition: 0.1s;
              width: 64px;
              padding: 4px 8px;
              text-align: center;
            " /><select class="appearance-none cursor-pointer" style="
              background-color: transparent;
              border: 1px solid transparent;
              color: rgb(160, 160, 160);
              font-family: &quot;JetBrains Mono&quot;, monospace;
              font-size: 12px;
              border-radius: 8px;
              outline: none;
              transition: 0.1s;
              width: 112px;
              padding: 4px 8px;
            ">
                                    <option value="Momentary" style="
                background-color: rgb(30, 30, 30);
                color: rgb(224, 224, 224);
              ">
                                        Momentary
                                    </option>
                                    <option value="Toggle" style="
                background-color: rgb(30, 30, 30);
                color: rgb(224, 224, 224);
              ">
                                        Toggle
                                    </option>
                                </select>
                            </div>

                        </div>
                    </div>
                </main>

                <RightSidebar />
            </div>


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

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-primary" />
                                    Button Mapping
                                </h2>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".json"
                                        onChange={handleImportConfig}
                                    />
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-card border border-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg text-slate-200 transition-colors text-xs uppercase font-bold tracking-wider">
                                        <Upload className="w-3 h-3" /> Import
                                    </button>
                                    <button onClick={handleExportConfig} className="flex items-center gap-2 bg-card border border-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg text-slate-200 transition-colors text-xs uppercase font-bold tracking-wider mr-2">
                                        <Download className="w-3 h-3" /> Export
                                    </button>

                                    <button onClick={handleReset} disabled={isLoading} className="flex items-center gap-2 bg-red-400 bg-opacity-10 border border-red-400/20 hover:bg-red-400/20 text-red-400 px-3 py-2 rounded-lg transition-colors text-xs uppercase font-bold tracking-wider">
                                        <Trash2 className="w-3 h-3" /> Reset
                                    </button>
                                    <button onClick={handleLoad} disabled={isLoading} className="flex items-center gap-2 bg-card border border-gray-700 hover:bg-gray-800 px-3 py-2 rounded-lg text-slate-200 transition-colors text-xs uppercase font-bold tracking-wider">
                                        <ArrowDownFromLine className="w-3 h-3" /> Read
                                    </button>
                                    <button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2 bg-primary hover:bg-primary-hover px-3 py-2 rounded-lg text-white transition-colors text-xs uppercase font-bold tracking-wider">
                                        <Save className="w-3 h-3" /> Write
                                    </button>
                                </div>
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
        </>
    )
}

export default App
