# Arduino MIDI Footswitch
USB MIDI Pedal built with Arduino.


>**Disclaimer:**<br>
>Please note, i'm not a C developer, so if the code looks ugly/poorly optimized you know why.<br>
>Everything i made was possible thanks to many info on the web, documentation and trial and error.<br>
>I'm not planning to actively support this project, i just thought it could be useful to have a small guide on how i made this, since i didn't found anything really straightforward at that point of time.<br>
>Hope this could come in handy for someone.

> **Update November 2019:**\
I've refactored the code to add a new "settings layer", read the Usage section for more info.\
It's still a "beta" version but i'm planning to change how the footswitch operates as soon i have some free time, see the Roadmap.

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

- [10 KΩ 1/2W resistors](https://www.amazon.com/uxcell-10KOhm-Resistors-Tolerances-100Pcs/dp/B07LGK9153/ref=sr_1_5?keywords=10kohm+resistor+0.5w&qid=1564134058&s=gateway&sr=8-5), depending on which LEDs you use (mine were blue)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/10kohm_resistor.jpg"
        alt="10 KΩ resistor"
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
  
- [LEDs](https://www.amazon.com/Lights-Emitting-Assortment-Arduino-300-Pack/dp/B00UWBJM0Q/ref=sr_1_7?keywords=blue+led&qid=1564134346&s=gateway&sr=8-7) - *optional*

- Something to use as a Case, i used an [Aluminium Box](https://www.amazon.com/s?k=aluminium+stompbox&ref=nb_sb_noss)

    <img 
        src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/aluminium_box.jpg"
        alt="Aluminium Box"
        width="300">



## Hardware setup:
Going straight to the point, this footswitch will have:
- 5 push buttons
- 5 leds (one for each button), each one with a 10 KΩ 1/2W resistor
- 1 Switch on the back, to select 3 different button "Layers" (like what the "Shift" key on your PC keyboard does, more or less)

Here is how i wired everything up on my SparkFun Pro Micro (click to open the larger image), if you use something different just remember to adjust pin numbers in the code later. (Black is GND, every other colors are Data pins)

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/wiring_scheme.png"
    alt="Arduino MIDI Footswitch Wiring"
    width="300">

First i soldered everything in place, i used a small breadboard and some male plugs just to make everything cleaner and detachable, but you can solder directly on the SparkFun if you want.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181005_231610.jpg"
    alt="Soldered SparkFun"
    width="300">

Then i put everything in an Aluminium Box with some holes for Buttons, LEDs, the switch and the USB port of the SparkFun.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181005_192354.jpg"
    alt="Aluminium Box"
    width="300">

Fix the SparkFun to the enclosure (screws, hot glue, or both lol), connect some wires and you are done with the hardware part!

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181007_170214.jpg"
    alt="Wires"
    width="300">

<img 
    src="https://raw.githubusercontent.com/Hecsall/arduino-midi-footswitch/readme-assets/img/photos/IMG_20181006_005124.jpg"
    alt="Aluminium Box with buttons"
    width="300">

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181006_005138.jpg"
    alt="Aluminium Box with buttons - back"
    width="300">




## Software setup:
For the software part i'm assuming you already have Arduino IDE installed (mine is version 1.8.15).<br>
In the Arduino IDE go to Sketch > Include Library > Manage Libraries.<br>
Here search for the **MIDIUSB** library from Arduino, and install the latest version.

**Only if you are using a SparkFun Pro Micro as i do**<br>
you will have to install the board in your Arduino IDE, to do so, follow this link and follow the instructions under "Installing the Arduino Addon"
https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon

Ok, now we are ready to upload your code, finally.<br>
Open the variables.h file, and if you made changes on pin wiring, be sure to edit the **button_pins**, **led_pins** or **switch_pins** variables according to your wiring.<br>
Plug the USB cable from your Arduino/SparkFun to your PC, under Tools select the proper board and, if needed, select the proper CPU (SparkFun Pro Micro comes in 2 versions, 8MHz and 16Mhz, flashing the wrong one will cause the board to "soft brick", and you will need to reset it manually, *learned this the hard way*).<br>
Now select the proper port and we can upload the code!

If everything is correct, it should be working. When you push a button the relative led should light up. For testing the midi messages i used a lightweight free software called [Midi Tools](https://mountainutilities.eu/miditools), or you can directly use your DAW.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/photos/IMG_20181009_235056.jpg"
    alt="Arduino Footswitch"
    width="300">



## Rename the device:
This is an optional step. Normally, when you plug your footswitch, it will appear as "SparkFun Pro Micro" (or the name of the board you are using), and it triggers my OCD, so i decided to rename it.
It's a very simple and fast step. Go to<br>
```C:\Program Files (x86)\Arduino\hardware\arduino\avr```<br>
(in my case ```C:\Users\<username>\AppData\Local\Arduino15\packages\SparkFun\hardware\avr\1.1.12``` because i'm using a SparkFun board and not an Arduino)<br>
and open the boards.txt file. Here search for your board name (i.e "pro micro") and you should find the definition of your board.


Copy the entire definition block of code (including eventual 8/16 MHz definitions) and paste it at the end of the file.<br> 
Now change every "left side" occurrence of your board name with something else (see image below, click to open the large version).<br> On the "right side" change only the board names and PID (the PID should be a different number from other boards), my suggestion is to take the original number, for example "0x9203", and edit the first 3 numbers after the "0x", something like "0x6663" so you keep the last number consistent.

<img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/boards_txt.jpg"
    alt="boards.txt"
    width="300">

After doing this, restart your Arduino IDE and under Tools > Boards you should find your newly created board with the name you have set.



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


In the future i could update this readme to add even more info.<br>
If you encounter spelling errors forgive me, english is not my main language :P
