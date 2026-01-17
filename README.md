# Arduino MIDI Footswitch

A USB MIDI footswitch built with Arduino, configurable via a Web UI

> **Disclaimer:**  
> Just a heads-up: I’m not a C developer.  
> This project came together thanks to lots of online resources, documentation, trial and error, and modern tools like GitHub Copilot.  
> I don’t plan to actively maintain or support this project, but it might still be useful as a small reference or starting point for others.  
> Hopefully it helps someone out 😄

---

## Features

### Multiple Layers

This MIDI footswitch changes its behavior based on the position of a rear switch.  
With a 3-way switch, you get **3 different “layers”** of MIDI commands you can send.

### Modularity

The firmware is designed to let you easily add or remove **Buttons**, **LEDs**, and **Potentiometers** (the latter not fully tested yet) with minimal configuration.

At the top of the `firmware.ino` file, you’ll find the  
`--- USER HARDWARE DEFINITION --` section:

```c
// Layers (usually 3 with a 3-way switch)
const int NUM_LAYERS = 3;

// Format:
// {hardware_type, arduino_pin, numerical_id}
HardwareComponent hardware[] = {
  // Buttons
  { COMP_BUTTON, 5, 0 },
  { COMP_BUTTON, 6, 1 },
  { COMP_BUTTON, 7, 2 },
  { COMP_BUTTON, 8, 3 },
  { COMP_BUTTON, 9, 4 },

  // LEDs (not configurable, just match the same button IDs)
  { COMP_LED, 10, 0 },
  { COMP_LED, 16, 1 },
  { COMP_LED, 14, 2 },
  { COMP_LED, 15, 3 },
  { COMP_LED, 18, 4 },

  // Potentiometers
  // { COMP_POT, A1, 5 }
};
```

Also, a `MAX_CONTROLS` variable statically sets the maximum number of controls you can have to **20**.\
This is used to generate a fixed configuration object inside Arduino's memory to avoid filling too much memory and to avoid other issues.

### Configurator App

Using the web app included in this repo (under `app/`), you can connect to the footswitch via **Web Serial** and customize each control.

When connected, the configurator reads your pedal’s hardware definition and automatically adjusts the UI to match it.

You can:

- Load the configuration stored on the Arduino
- Save a configuration to the Arduino
- Change which **Note** or **CC** MIDI message is sent
- Set **ON/OFF** values for buttons (0-127)
- Choose between **Momentary** or **Toggle** button behavior

All settings are stored in the Arduino’s **EEPROM**, so they persist even after disconnecting power.

> [!NOTE]  
> Live demo: [https://hecsall.github.io/arduino-midi-footswitch/](https://hecsall.github.io/arduino-midi-footswitch/)

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/web-ui.png"
    alt="Web Configurator"
    width="600">

---

## Running the Web Configurator

See the `README.md` inside the `app/` folder.

---

## How to Build

1. [Materials](#materials)
2. [Hardware setup](#hardware-setup)
3. [Software setup](#software-setup)
4. [Rename the device](#rename-the-device)
5. [Usage](#usage)

---

## Materials

- SparkFun Pro Micro 16MHz (or another similar Arduino)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/sparkfun_pro_micro.jpg"
        alt="SparkFun Pro Micro"
        width="300">

- [Push buttons](https://www.amazon.com/Etopars-Guitar-Effects-Momentary-Button/dp/B076V2QYSJ/ref=sr_1_18?keywords=push+button+pedal&qid=1564133684&s=gateway&sr=8-18)
  
    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/push_button.jpg"
        alt="Push Button"
        width="300">

- [Switch ON-OFF-ON](https://www.amazon.com/SALECOM-Position-Guitar-Toggle-Switches/dp/B01JDUBBJQ/ref=sr_1_35?keywords=switch+on+off+on&qid=1564133908&s=gateway&sr=8-35)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/switch_on_off_on.jpg"
        alt="Switch ON-OFF-ON"
        width="300">

- Something to use as a Case, I used an [Aluminium Box](https://www.amazon.com/s?k=aluminium+stompbox&ref=nb_sb_noss)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/aluminium_box.jpg"
        alt="Aluminium Box"
        width="300">

- [LEDs](https://www.amazon.com/Lights-Emitting-Assortment-Arduino-300-Pack/dp/B00UWBJM0Q/ref=sr_1_7?keywords=blue+led&qid=1564134346&s=gateway&sr=8-7) - *optional*

- [10 KΩ 1/2W resistors](https://www.amazon.com/uxcell-10KOhm-Resistors-Tolerances-100Pcs/dp/B07LGK9153/ref=sr_1_5?keywords=10kohm+resistor+0.5w&qid=1564134058&s=gateway&sr=8-5) - *optional*, depending on which LEDs you use

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/10kohm_resistor.jpg"
        alt="10 KΩ resistor"
        width="300">

- [USB Panel Mount](https://www.amazon.com/s?k=usb+b+to+micro+usb+panel+mount&crid=GAMSOA367SI2&sprefix=usb+to+micro+usb+panel+mou%2Caps%2C153&ref=nb_sb_noss_2) - *optional but highly suggested*, since the Pro Micro USB can break pretty easily.

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/usb_panel_mount.jpg"
        alt="USB Panel Mount"
        width="300">

---

## Hardware Setup

This build uses:
- 5 push buttons  
- 5 LEDs (one per button, each with a 10 kΩ resistor)  
- 1 rear ON-OFF-ON switch for selecting layers  

If you use different pins or a different board, remember to update the pin numbers in the firmware accordingly.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/wiring_scheme.png"
    alt="Arduino MIDI Footswitch Wiring"
    width="300">

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/wiring_scheme.png"
    alt="Arduino MIDI Footswitch Wiring"
    width="300">

First I soldered everything in place, I used a small breadboard and some male plugs just to make everything cleaner and detachable, but you can solder directly on the SparkFun if you want to.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181005_231610.jpg"
    alt="Soldered SparkFun"
    width="300">

Then I put everything in an Aluminium Box with some holes for Buttons, LEDs, the switch, and the USB port.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181005_192354.jpg"
    alt="Aluminium Box"
    width="300">

⚠️ If your enclosure is metal, insulate the bottom to avoid short circuits.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/bottom_tape.JPG"
    alt="Aluminium Box"
    width="300">

Connect some wires, put the SparkFun into the enclosure, and you are done with the hardware part!

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/fitted_usb.JPG"
    alt="Wires"
    width="300">
<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/rear_usb.JPG"
    alt="Wires"
    width="300">
<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/internal_final_view.JPG"
    alt="Wires"
    width="300">
<img 
    src="https://raw.githubusercontent.com/Hecsall/arduino-midi-footswitch/readme-assets/img/photos/IMG_20181006_005124.jpg"
    alt="Aluminium Box with buttons"
    width="300">

---

## Software Setup

Assuming you already have the **Arduino IDE** installed:

1. Open **Sketch → Include Library → Manage Libraries**
2. _If you are using a SparkFun Pro Micro_:
  - Install the board in your Arduino IDE following this guide the "Installing the Arduino Addon" section:
[https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon](https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon)
3. Install **MIDIUSB** by Arduino
4. Open `firmware/firmware.ino` and customize pin numbers if changed
5. Select the correct board and CPU frequency
6. Upload the firmware

If everything is correct, you should see incoming MIDI messages when pressing buttons, using an app like [MIDI Tools](https://mountainutilities.eu/miditools) or directly using your DAW.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181009_235056.jpg"
    alt="Arduino Footswitch"
    width="300">

---

## Rename the Device (Optional)

By default, the board will appear using its stock name (e.g. *SparkFun Pro Micro*).

To rename it, follow this guide by **nebhead**:  
https://gist.github.com/nebhead/c92da8f1a8b476f7c36c032a0ac2592a

An example board definition is included in the `other/` folder.

---

## Useful Links

- SparkFun Pro Micro setup:  
  [https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon](https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon)
- MIDIUSB library:  
  [https://www.arduino.cc/en/Reference/MIDIUSB](https://www.arduino.cc/en/Reference/MIDIUSB)
- MIDI CC table:  
  [https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2)
