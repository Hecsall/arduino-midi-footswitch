# Arduino MIDI Footswitch
USB MIDI Pedal built with Arduino.


>Disclaimer:<br>
>Please note, i'm not a C developer, so if the code looks ugly/poorly optimized you know why.<br>
>Everything i made was possible thanks to many info on the web, documentation and trial and error.<br>
>I'm not planning to actively support this project, i just thought it could be useful to have a small guide on how i made this, since i didn't found anything really straightforward at that point of time.<br>
>Hope this could come in handy for someone.


## Sections:
1. [Materials](#materials)
2. [Hardware setup](#hardware-setup)
3. [Software setup](#software-setup)



## Materials:
- SparkFun Pro Micro 16MHz (or another similar Arduino)

  <img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/sparkfun_pro_micro.jpg"
    alt="SparkFun Pro Micro"
    style="max-width: 300px;">

- [10 KΩ 1/2W resistors](https://www.amazon.com/uxcell-10KOhm-Resistors-Tolerances-100Pcs/dp/B07LGK9153/ref=sr_1_5?keywords=10kohm+resistor+0.5w&qid=1564134058&s=gateway&sr=8-5), depending on which LEDs you use (mine were blue)

  <img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/10kohm_resistor.jpg"
    alt="10 KΩ resistor"
    style="max-width: 300px;">

- [Push buttons](https://www.amazon.com/Etopars-Guitar-Effects-Momentary-Button/dp/B076V2QYSJ/ref=sr_1_18?keywords=push+button+pedal&qid=1564133684&s=gateway&sr=8-18)
  
  <img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/push_button.jpg"
    alt="Push Button"
    style="max-width: 300px;">

- [Switch ON-OFF-ON](https://www.amazon.com/SALECOM-Position-Guitar-Toggle-Switches/dp/B01JDUBBJQ/ref=sr_1_35?keywords=switch+on+off+on&qid=1564133908&s=gateway&sr=8-35)

  <img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/switch_on_off_on.jpg"
    alt="Switch ON-OFF-ON"
    style="max-width: 300px;">
  
- [LEDs](https://www.amazon.com/Lights-Emitting-Assortment-Arduino-300-Pack/dp/B00UWBJM0Q/ref=sr_1_7?keywords=blue+led&qid=1564134346&s=gateway&sr=8-7) - *optional*

- Something to use as a Case, i used an [Aluminium Box](https://www.amazon.com/s?k=aluminium+stompbox&ref=nb_sb_noss)

  <img 
    src="https://github.com/Hecsall/arduino-midi-footswitch/raw/readme-assets/img/aluminium_box.jpg"
    alt="Aluminium Box"
    style="max-width: 300px;">



## Hardware setup:
Going straight to the point, this footswitch will have:
- 5 push buttons
- 5 leds (one for each button), each one with a 10 KΩ 1/2W resistor
- 1 Switch on the back, to select 3 different button "Layers" (like what the "Shift" key on your PC keyboard does, more or less)

Here is how i wired everything up on my SparkFun Pro Micro (click to open the larger image), if you use something different just remember to adjust pin numbers in the code later. (Black is GND, every other colors are Data pins)

[![Arduino MIDI Footswitch Wiring](https://i.imgur.com/1ezxqnMm.png)](https://i.imgur.com/1ezxqnM.png)

First i soldered everything in place, i used a small breadboard and some male plugs just to make everything cleaner and detachable, but you can solder directly on the SparkFun if you want.

[![Soldered SparkFun](https://i.imgur.com/bsws77xm.jpg)](https://i.imgur.com/bsws77x.jpg)

Then i put everything in an Aluminium Box with some holes for Buttons, LEDs, the switch and the USB port of the SparkFun.

![Aluminium Box](https://i.imgur.com/HdCAXwlm.jpg)

Fix the SparkFun to the enclosure (screws, hot glue, or both lol), connect some wires and you are done with the hardware part!

[![Wires](https://i.imgur.com/UuAzZ0pm.jpg)](https://i.imgur.com/UuAzZ0p.jpg)
[![Aluminium Box with buttons](https://i.imgur.com/BC8NdJsm.jpg)](https://i.imgur.com/BC8NdJs.jpg)



## Software setup:
For the software part i'm assuming you already have Arduino IDE installed (mine is version 1.8.9).<br>
In the Arduino IDE go to Sketch > Include Library > Manage Libraries.<br>
Here search for **MIDIUSB**, a library from Gary Grewal, and install the latest version.

**Only if you are using a SparkFun Pro Micro as i do**<br>
you will have to install the board in your Arduino IDE, to do so, follow this link and follow the instructions under "Installing the Arduino Addon"
https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon

Ok, now we are ready to upload your code, finally.<br>
Open the arduino_midi_footswitch.ino file, and if you made changes on pin wiring, be sure to edit the **button_pins**, **led_pins** or **layer_switch_pins** variables according to your wiring.<br>
Plug the USB cable from your Arduino/SparkFun to your PC, under Tools select the proper board and, if needed, select the proper CPU (SparkFun Pro Micro comes in 2 versions, 8MHz and 16Mhz, flashing the wrong one will cause the board to "soft brick", and you will need to reset it manually, *learned this the hard way*).<br>
Now select the proper port and we can upload the code!

If everything is correct, it should be working. When you push a button the relative led should light up. For testing the midi messages i used a lightweight free software called [Midi Tools](https://mountainutilities.eu/miditools), or you can directly use your DAW.

![Arduino Footswitch](https://i.imgur.com/CxibkpCm.jpg)


## Useful links:
- SparkFun Pro Micro setup for Arduino IDE: https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon
- MIDIUSB Arduino library: https://www.arduino.cc/en/Reference/MIDIUSB
- MIDI CC table: https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2


In the future i could update this readme to add even more info.<br>
If you encounter spelling errors forgive me, english is not my main language :P