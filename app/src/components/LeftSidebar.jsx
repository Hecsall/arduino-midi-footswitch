 const LeftSidebar = () => {
    return <aside class="flex flex-col items-center py-5 gap-1 shrink-0 z-10" style="
      width: 64px;
      background-color: rgb(14, 14, 14);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
    ">
    <div class="mb-6 mt-1">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="
          background: linear-gradient(
            145deg,
            rgb(42, 42, 42) 0%,
            rgb(26, 26, 26) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: rgba(0, 0, 0, 0.5) 0px 2px 8px;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-usb w-4 h-4 text-white">
                <circle cx="10" cy="7" r="1"></circle>
                <circle cx="4" cy="20" r="1"></circle>
                <path d="M4.7 19.3 19 5"></path>
                <path d="m21 3-3 1 2 2Z"></path>
                <path d="M9.26 7.68 5 12l2 5"></path>
                <path d="m10 14 5 2 3.5-3.5"></path>
                <path d="m18 12 1-1 1 1-1 1Z"></path>
            </svg>
        </div>
    </div>
    <button title="Config" class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
        style="
        background-color: rgba(255, 255, 255, 0.08);
        color: rgb(255, 255, 255);
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-sliders-vertical w-4 h-4">
            <line x1="4" x2="4" y1="21" y2="14"></line>
            <line x1="4" x2="4" y1="10" y2="3"></line>
            <line x1="12" x2="12" y1="21" y2="12"></line>
            <line x1="12" x2="12" y1="8" y2="3"></line>
            <line x1="20" x2="20" y1="21" y2="16"></line>
            <line x1="20" x2="20" y1="12" y2="3"></line>
            <line x1="2" x2="6" y1="14" y2="14"></line>
            <line x1="10" x2="14" y1="8" y2="8"></line>
            <line x1="18" x2="22" y1="16" y2="16"></line>
        </svg></button><button title="Layers"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150" style="
        background-color: transparent;
        color: rgb(68, 68, 68);
        border: 1px solid transparent;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-layers w-4 h-4">
            <path
                d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z">
            </path>
            <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
            <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
        </svg></button><button title="Settings"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150" style="
        background-color: transparent;
        color: rgb(68, 68, 68);
        border: 1px solid transparent;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-settings w-4 h-4">
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z">
            </path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    </button>
    <div class="flex-1"></div>
    <div class="w-2 h-2 rounded-full mb-2" title="No device" style="
        background-color: rgb(58, 58, 58);
        box-shadow: none;
        transition: 0.3s;
      "></div>
</aside>
}

export default LeftSidebar