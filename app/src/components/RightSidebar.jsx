
const RightSidebar = () => {
    return <aside class="flex flex-col shrink-0 z-10" style="
      width: 272px;
      border-left: 1px solid rgba(255, 255, 255, 0.05);
      background-color: rgb(14, 14, 14);
    ">
    <div class="p-5" style="border-bottom: 1px solid rgba(255, 255, 255, 0.05)">
        <p class="text-xs font-semibold tracking-widest uppercase mb-4" style="color: rgb(51, 51, 51)">
            Device
        </p>
        <div class="rounded-xl p-4 mb-3" style="
          background-color: rgb(20, 20, 20);
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: rgba(0, 0, 0, 0.4) 0px 4px 16px;
        ">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full" style="
                background-color: rgb(239, 68, 68);
                box-shadow: rgba(239, 68, 68, 0.4) 0px 0px 6px;
                transition: 0.3s;
              "></div>
                    <span class="text-xs font-semibold tracking-wide" style="
                color: rgb(248, 113, 113);
                font-family: &quot;JetBrains Mono&quot;, monospace;
              ">Disconnected</span>
                </div>
            </div>
            <div class="text-xs mb-4 leading-relaxed" style="
            color: rgb(64, 64, 64);
            font-family: &quot;JetBrains Mono&quot;, monospace;
          ">
                Connect your USB MIDI pedal to begin.
            </div>
            <button class="w-full rounded-lg text-sm font-medium transition-all duration-150 py-2" style="
            background-color: rgb(255, 255, 255);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgb(17, 17, 17);
          ">
                Connect Device
            </button>
        </div>
    </div>
    <div class="p-5 flex flex-col gap-2">
        <p class="text-xs font-semibold tracking-widest uppercase mb-2" style="color: rgb(51, 51, 51)">
            Actions
        </p>
        <div class="flex flex-col gap-1.5">
            <button disabled=""
                class="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
                style="
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
          ">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="
              background-color: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.08);
            ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-hard-drive-download w-3.5 h-3.5" style="color: rgb(68, 68, 68)">
                        <path d="M12 2v8"></path>
                        <path d="m16 6-4 4-4-4"></path>
                        <rect width="20" height="8" x="2" y="14" rx="2"></rect>
                        <path d="M6 18h.01"></path>
                        <path d="M10 18h.01"></path>
                    </svg>
                </div>
                <div>
                    <div class="text-xs font-medium leading-none mb-0.5" style="color: rgb(85, 85, 85)">
                        Read from Device
                    </div>
                    <div class="text-xs leading-none" style="color: rgb(46, 46, 46); font-size: 10px">
                        Load device configuration
                    </div>
                </div>
            </button><button disabled=""
                class="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
                style="
            background-color: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.12);
          ">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="
              background-color: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.08);
            ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-hard-drive-upload w-3.5 h-3.5" style="color: rgb(208, 208, 208)">
                        <path d="m16 6-4-4-4 4"></path>
                        <path d="M12 2v8"></path>
                        <rect width="20" height="8" x="2" y="14" rx="2"></rect>
                        <path d="M6 18h.01"></path>
                        <path d="M10 18h.01"></path>
                    </svg>
                </div>
                <div>
                    <div class="text-xs font-medium leading-none mb-0.5" style="color: rgb(208, 208, 208)">
                        Write to Device
                    </div>
                    <div class="text-xs leading-none" style="color: rgb(46, 46, 46); font-size: 10px">
                        Save current configuration
                    </div>
                </div>
            </button>
        </div>
        <div class="my-2" style="height: 1px; background-color: rgba(255, 255, 255, 0.05)"></div>
        <div class="flex flex-col gap-1.5">
            <button
                class="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
                style="
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
          ">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="
              background-color: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.08);
            ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-file-up w-3.5 h-3.5" style="color: rgb(68, 68, 68)">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M12 12v6"></path>
                        <path d="m15 15-3-3-3 3"></path>
                    </svg>
                </div>
                <div>
                    <div class="text-xs font-medium leading-none mb-0.5" style="color: rgb(85, 85, 85)">
                        Import
                    </div>
                    <div class="text-xs leading-none" style="color: rgb(46, 46, 46); font-size: 10px">
                        Load from .json file
                    </div>
                </div>
            </button><button
                class="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
                style="
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
          ">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="
              background-color: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.08);
            ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-file-down w-3.5 h-3.5" style="color: rgb(68, 68, 68)">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                        <path d="M12 18v-6"></path>
                        <path d="m9 15 3 3 3-3"></path>
                    </svg>
                </div>
                <div>
                    <div class="text-xs font-medium leading-none mb-0.5" style="color: rgb(85, 85, 85)">
                        Export
                    </div>
                    <div class="text-xs leading-none" style="color: rgb(46, 46, 46); font-size: 10px">
                        Save backup to file
                    </div>
                </div>
            </button><button
                class="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all duration-100 disabled:opacity-25 disabled:cursor-not-allowed"
                style="
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.05);
          ">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="
              background-color: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.08);
            ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-rotate-ccw w-3.5 h-3.5" style="color: rgb(68, 68, 68)">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                    </svg>
                </div>
                <div>
                    <div class="text-xs font-medium leading-none mb-0.5" style="color: rgb(85, 85, 85)">
                        Reset
                    </div>
                    <div class="text-xs leading-none" style="color: rgb(46, 46, 46); font-size: 10px">
                        Restore UI defaults
                    </div>
                </div>
            </button>
        </div>
    </div>
    <div class="mt-auto p-5" style="border-top: 1px solid rgba(255, 255, 255, 0.04)">
        <p class="text-xs leading-relaxed" style="
          color: rgb(42, 42, 42);
          font-family: &quot;JetBrains Mono&quot;, monospace;
        ">
            MIDI Pedal Configurator<br />v1.0.0
        </p>
    </div>
</aside>

}
export default RightSidebar