# Arduino MIDI Footswitch
USB MIDI Pedal built with Arduino.

I will update this readme as soon as possible, for now i'm writing some basic things before i forget them lol


## Sections:
1. [Materials](#materials)
2. [Hardware setup](#hardware-setup)
3. [Software setup](#software-setup)


## Materials:
- SparkFun Pro Micro 16mhz (or another similar Arduino)

  [![SparkFun Pro Micro](https://i.imgur.com/tws3UZOm.jpg)](https://i.imgur.com/tws3UZO.jpg)

- [10 Kohm 1/2W resistors](https://www.amazon.com/uxcell-10KOhm-Resistors-Tolerances-100Pcs/dp/B07LGK9153/ref=sr_1_5?keywords=10kohm+resistor+0.5w&qid=1564134058&s=gateway&sr=8-5), depending on which LEDs you use (mine were blue)

  ![10 Kohm resistor](https://i.imgur.com/XF687wEm.jpg)

- [Push buttons](https://www.amazon.com/Etopars-Guitar-Effects-Momentary-Button/dp/B076V2QYSJ/ref=sr_1_18?keywords=push+button+pedal&qid=1564133684&s=gateway&sr=8-18)
  
  ![Push Button](https://i.imgur.com/ZlDxFZMm.jpg)

- [Switch ON-OFF-ON](https://www.amazon.com/SALECOM-Position-Guitar-Toggle-Switches/dp/B01JDUBBJQ/ref=sr_1_35?keywords=switch+on+off+on&qid=1564133908&s=gateway&sr=8-35)

  ![Switch ON-OFF-ON](https://i.imgur.com/3DO6V0fm.jpg)
  
- [LEDs](https://www.amazon.com/Lights-Emitting-Assortment-Arduino-300-Pack/dp/B00UWBJM0Q/ref=sr_1_7?keywords=blue+led&qid=1564134346&s=gateway&sr=8-7)

- Something to use as a Case, i used an [Aluminium Box](https://www.amazon.com/s?k=aluminium+stompbox&ref=nb_sb_noss)

  ![Aluminium Box](https://i.imgur.com/KTMlPKjm.jpg)


## Hardware setup:
Going straight to the point, this footswitch will have:
- 5 push buttons
- 5 leds (one for each button), each one with a 10 Kohm 1/2W resistor
- 1 Switch on the back, to select 3 different button "Layers" (like what the "Shift" key on your PC keyboard does, more or less)

Here is how i wired everything up on my SparkFun Pro Micro (click to open the larger image), if you use something different just remember to adjust pin numbers in the code later. (Black is GND, every other colors are Data pins)

[![Arduino MIDI Footswitch Wiring](https://i.imgur.com/1ezxqnMm.png)](https://i.imgur.com/1ezxqnM.png)



## Software setup:
To do...


## Useful links:
- SparkFun Pro Micro setup for Arduino IDE: https://learn.sparkfun.com/tutorials/pro-micro--fio-v3-hookup-guide/installing-windows#windows_boardaddon
- MIDIUSB Arduino library: https://www.arduino.cc/en/Reference/MIDIUSB
- MIDI CC table: https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2
