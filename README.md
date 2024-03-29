# Arduino MIDI Footswitch
USB MIDI Pedal built with Arduino.


>**Disclaimer:**<br>
>Please note, I'm not a C developer, so if the code looks ugly/poorly optimized you know why.<br>
>Everything I made was possible thanks to many info on the web, documentation and trial and error.<br>
>I'm not planning to actively support this project, I just thought it could be useful to have a small guide on how I made this, since I didn't find anything really straightforward at that point of time.<br>
>Hope this could come in handy for someone.

> **Update November 2019:**\
I've refactored the code to add a new "settings layer", read the Usage section for more info.

> **Update December 2021:**\
Changed pin numbers, also added a panel mount USB.
Apparently, the Pro Micro USB is quite fragile and mine came off, so I bought another but this time I added a USB panel connector to relieve the stress off the Pro Micro plug. I highly suggest to do so.


## Sections:
1. [Materials](#materials)
2. [Hardware setup](#hardware-setup)
3. [Software setup](#software-setup)
4. [Rename the device](#rename-the-device)
5. [Usage](#usage)


## Materials:
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

- [10 KΩ 1/2W resistors](https://www.amazon.com/uxcell-10KOhm-Resistors-Tolerances-100Pcs/dp/B07LGK9153/ref=sr_1_5?keywords=10kohm+resistor+0.5w&qid=1564134058&s=gateway&sr=8-5) - *optional*, depending on which LEDs you use (mine were blue)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/10kohm_resistor.jpg"
        alt="10 KΩ resistor"
        width="300">

- [USB Panel Mount](https://www.amazon.com/s?k=usb+b+to+micro+usb+panel+mount&crid=GAMSOA367SI2&sprefix=usb+to+micro+usb+panel+mou%2Caps%2C153&ref=nb_sb_noss_2) - *optional but highly suggested*, since the Pro Micro USB can break pretty easily.

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/usb_panel_mount.jpg"
        alt="USB Panel Mount"
        width="300">



## Hardware setup:
Going straight to the point, this footswitch will have:
- 5 push buttons
- 5 leds (one for each button), each one with a 10 KΩ 1/2W resistor
- 1 Switch on the back, to select 3 different button "Layers" (like what the "Shift" key on your PC keyboard does, more or less)

Here is how I wired everything up on my SparkFun Pro Micro (click to open the larger image), if you use something different just remember to adjust pin numbers in the code later. (Black is GND, all the other colors are Data pins)

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

Be sure to mask the bottom of the box (if made with metal) to avoid potential shorts, I used some electrical tape.

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




## Software setup:
For the software part I'm assuming you already have Arduino IDE installed (mine is version 1.8.19).<br>
In the Arduino IDE go to Sketch > Include Library > Manage Libraries.<br>
Here search for the **MIDIUSB** library from Arduino, and install the latest version.

**Only if you are using a SparkFun Pro Micro as I do**<br>
you will have to install the board in your Arduino IDE, to do so, follow this link and follow the instructions under "Installing the Arduino Addon"
https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon

Ok, now we are ready to upload your code, finally.<br>
Open the variables.h file, and if you made changes on pin wiring, be sure to edit the **button_pins**, **led_pins** or **switch_pins** variables according to your wiring.<br>
Plug the USB cable from your Arduino/SparkFun to your PC, under Tools select the proper board and, if needed, select the proper CPU (SparkFun Pro Micro comes in 2 versions, 8MHz and 16Mhz, flashing the wrong one will cause the board to "soft brick", and you will need to reset it manually, *learned this the hard way*).<br>
Now select the proper port and we can upload the code!

If everything is correct, it should be working. When you push a button the relative led should light up. To test the MIDI messages I used a lightweight free software called [MIDI Tools](https://mountainutilities.eu/miditools), or you can directly use your DAW.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181009_235056.jpg"
    alt="Arduino Footswitch"
    width="300">



## Rename the device:
This is an optional step. Normally, when you plug your footswitch, it will appear as "SparkFun Pro Micro" (or the name of the board you are using), so I decided to rename it.
It's a very simple and fast step.

Follow the instructions created by nebhead at this link:
[https://gist.github.com/nebhead/c92da8f1a8b476f7c36c032a0ac2592a](https://gist.github.com/nebhead/c92da8f1a8b476f7c36c032a0ac2592a)

I'll leave my own board file inside the `other/` folder in this repo as an example.\
In my case I named my folder `footswitch` and the device name is **MIDI Footswitch**.

After doing everything, restart your Arduino IDE and under Tools > Boards you should find a new "subcategory" with your newly created board inside.



## Usage:
The MIDI footswitch changes his operational mode based on which position the rear switch is on.\
So you have 2 "layers" of MIDI commands you can send, 5 on one layer and 5 on the other.\
The **first layer** (switch up) have 5 static commands that all act as push buttons.\
The **second layer** have 5 commands which behaviour *can be customized using the third layer*.\
The **third layer**, is only a "settings" layer, pressing a button on this layer will turn on or off it's LED, changing the button behaviour. \
LED OFF = the button acts as push button\
LED ON = the button acts as Switch button



## Useful links:
- SparkFun Pro Micro setup for Arduino IDE: https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon
- MIDIUSB Arduino library: https://www.arduino.cc/en/Reference/MIDIUSB
- MIDI CC table: https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2
