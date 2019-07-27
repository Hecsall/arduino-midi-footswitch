/*
Arduino USB MIDI FootSwitch
by Hecsall (https://github.com/Hecsall)
*/

// https://www.arduino.cc/en/Reference/MIDIUSB
#include "MIDIUSB.h"


// Buttons setup
int  button_pins[5] = {2, 3, 4, 5, 6}; // Arduino pins where buttons are connected


/*
Layer Switch
This switch is used to select the button layer to use
*/
int  layer_switch_pins[2] = {8, 9}; // Arduino pins where the switch is connected
bool layer_switch_states[2] = {false, false};
int current_layer = 0;


// CC values are the numbers in the decimal column of this table
// https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2

int button_layers[3][5] = { 
  /*
  Layer 0
  (Switch Up)
  ,-----------------,
  |  49    |     50 |
  |-----------------|
  |  51 |  80 |  81 |
  `-----------------`
  */
  {
    49,     50,
    51, 80, 81
  },

  /*
  Layer 1
  (Switch Off)
  ,-----------------,
  |  16    |     17 |
  |-----------------|
  |  18 |  19 |  48 |
  `-----------------`
  */
  {
    16,     17,
    18, 19, 48
  },

  /*
  Layer 2
  (Switch Down)
  ,-----------------,
  |  68    |     65 |
  |-----------------|
  |  67 |  66 |  64 |
  `-----------------`
  */
  {
    68,     65,
    67, 66, 64
  }
};


int button_layers_states[3][5] = { 
  /*
  Layer 0
  (Switch Up)
  */
  {false, false, false, false, false},

  /*
  Layer 1
  (Switch Off)
  */
  {false, false, false, false, false},

  /*
  Layer 2
  (Switch Down)
  */
  {false, false, false, false, false}
};


/*
LEDs
One for each button
*/
int  led_pins[5] = {10, 16, 14, 15, 18}; // Arduino pins
bool led_states[5] = {false, false, false, false, false};


int ppqn = 0; // "Pulse Per Quarter Note"


/*
Utility functions
*/

// Event type is hard-coded (0x09 = note on, 0x08 = note off).
// First parameter is the MIDI channel, combined with the note-on/note-off.
// Channel can be anything between 0-15. Typically reported to the user as 1-16.
// Second parameter (pitch) is the note number (48 = middle C).
// Third parameter is the velocity (0 -> 127, 0 = no_sound, 64 = normal, 127 = fastest).

void noteOn(byte channel, byte pitch, byte velocity) {
  midiEventPacket_t noteOn = {0x09, 0x90 | channel, pitch, velocity};
  MidiUSB.sendMIDI(noteOn);
}

void noteOff(byte channel, byte pitch, byte velocity) {
  midiEventPacket_t noteOff = {0x08, 0x80 | channel, pitch, velocity};
  MidiUSB.sendMIDI(noteOff);
}


// Event type hard-coded (0x0B = control change, aka "MIDI CC").
// First parameter is the channel (0-15), combined with the event type.
// Second parameter is the "control change" number (0-119, see top link to midi.org).
// Third parameter is the control value (0-127).

void controlChange(byte channel, byte control, byte value) {
  midiEventPacket_t event = {0x0B, 0xB0 | channel, control, value};
  MidiUSB.sendMIDI(event);
}




/*
Actual logic
*/

void setup() {
  Serial.begin(115200);
  // Button Pins
  for (uint8_t i=0; i < 5; i++) {
    pinMode(button_pins[i], INPUT_PULLUP);
  }
  // LED Pins
  for (uint8_t i=0; i < 5; i++) {
    pinMode(led_pins[i], OUTPUT);
  }
  // Switch Pins
  for (uint8_t i=0; i < 2; i++) {
    pinMode(layer_switch_pins[i], INPUT_PULLUP);
  }
}


void loop() {

  // Blinking BPM LED
  // Enable BPM counter in Ableton to see it blink
  // You will probably need to adjust ms delay in your DAW to keep it in sync
  midiEventPacket_t rx;
  do {
    rx = MidiUSB.read();
    //Count pulses and send note 
    if(rx.byte1 == 0xF8){
      ++ppqn;
      if(ppqn == 24){
        digitalWrite(10, HIGH);   
        delay(80);
        digitalWrite(10, LOW);
        ppqn = 0;
      };
    }
    //Clock start byte
  } while (rx.header != 0);


  // Set which Layer we are using
  if (digitalRead(layer_switch_pins[0]) == LOW && digitalRead(layer_switch_pins[1]) == HIGH && current_layer != 0) {
    current_layer = 0;
  }
  else if (digitalRead(layer_switch_pins[0]) == HIGH && digitalRead(layer_switch_pins[1]) == HIGH && current_layer != 1) {
    current_layer = 1;
  }
  else if (digitalRead(layer_switch_pins[0]) == HIGH && digitalRead(layer_switch_pins[1]) == LOW && current_layer != 2) {
    current_layer = 2;
  }


  // Button operations based on current_layer
  for (uint8_t i=0; i < 5; i++) {
    if (digitalRead(button_pins[i]) == LOW && button_layers_states[current_layer][i] == false) {
      controlChange(0, button_layers[current_layer][i], 127);
      MidiUSB.flush();
      button_layers_states[current_layer][i] = true;
      digitalWrite(led_pins[i], HIGH); // Turn the LED on
      led_states[i] = true;
      delay(15);
    }
    else if (digitalRead(button_pins[i]) == HIGH && button_layers_states[current_layer][i] == true) {
      controlChange(0, button_layers[current_layer][i], 0);
      MidiUSB.flush();
      button_layers_states[current_layer][i] = false;
      digitalWrite(led_pins[i], LOW); // Turn the LED off
      led_states[i] = false;
      delay(15);
    }
  }

}
