/*
Arduino USB MIDI FootSwitch
by Hecsall (https://github.com/Hecsall)
*/

// https://www.arduino.cc/en/Reference/MIDIUSB
#include "MIDIUSB.h"
#include "variables.h"

// Utility functions

// Event type is hard-coded (0x09 = note on, 0x08 = note off).
// First parameter is the MIDI channel, combined with the note-on/note-off.
// Channel can be anything between 0-15. Typically reported to the user as 1-16.
// Second parameter (pitch) is the note number (48 = middle C).
// Third parameter is the velocity (0 -> 127, 0 = no_sound, 64 = normal, 127 = fastest).

void noteOn(byte channel, byte pitch, byte velocity)
{
    midiEventPacket_t noteOn = {0x09, 0x90 | channel, pitch, velocity};
    MidiUSB.sendMIDI(noteOn);
}

void noteOff(byte channel, byte pitch, byte velocity)
{
    midiEventPacket_t noteOff = {0x08, 0x80 | channel, pitch, velocity};
    MidiUSB.sendMIDI(noteOff);
}

// Event type hard-coded (0x0B = control change, aka "MIDI CC").
// First parameter is the channel (0-15), combined with the event type.
// Second parameter is the "control change" number (0-119, see top link to midi.org).
// Third parameter is the control value (0-127).

void controlChange(byte channel, byte control, byte value)
{
    midiEventPacket_t event = {0x0B, 0xB0 | channel, control, value};
    MidiUSB.sendMIDI(event);
}

// BPM Counter
void initBPM()
{
    midiEventPacket_t rx;
    do {
        rx = MidiUSB.read();
        //Count pulses and send note
        if (rx.byte1 == 0xF8)
        {
            ++ppqn;
            if (ppqn == 24)
            {
                digitalWrite(10, HIGH);
                delay(80);
                digitalWrite(10, LOW);
                ppqn = 0;
            };
        }
        //Clock start byte
    } while (rx.header != 0);
}

// Button in "Push" mode
void handlePushButton(byte i)
{
    if (digitalRead(button_pins[i]) == LOW && button_states[i] == false)
    {
        controlChange(0, button_layers[current_layer][i], 127);
        MidiUSB.flush();
        button_states[i] = true;
        digitalWrite(led_pins[i], HIGH); // Turn the LED on
        led_states[i] = true;
        delay(15);
    }
    else if (digitalRead(button_pins[i]) == HIGH && button_states[i] == true)
    {
        controlChange(0, button_layers[current_layer][i], 0);
        MidiUSB.flush();
        button_states[i] = false;
        digitalWrite(led_pins[i], LOW); // Turn the LED off
        led_states[i] = false;
        delay(15);
    }
}

// Button in "Toggle" mode
void handleToggleButton(byte i)
{
    buttonState = digitalRead(button_pins[i]);
    if (buttonState != lastButtonState){
        if (buttonState == LOW && button_states[i] == false)
        {
            controlChange(0, button_layers[current_layer][i], 127);
            MidiUSB.flush();
            button_states[i] = true;
            digitalWrite(led_pins[i], HIGH); // Turn the LED on
            led_states[i] = true;
        }
        else if (buttonState == LOW && button_states[i] == true)
        {
            controlChange(0, button_layers[current_layer][i], 0);
            MidiUSB.flush();
            button_states[i] = false;
            digitalWrite(led_pins[i], LOW); // Turn the LED off
            led_states[i] = false;
        }
        delay(100);
    }
    lastButtonState = buttonState;
}

// Button "Change" mode
void handleChangeMode(byte i)
{
    buttonState = digitalRead(button_pins[i]);
    if (buttonState != lastButtonState){
        // Note: only layer 1 (switch OFF) can be customized
        if (buttonState == LOW && button_modes[1][i] == 0 && millis() - time > debounce)
        {
            button_modes[1][i] = 1;
            digitalWrite(led_pins[i], HIGH); // Turn the LED on
            led_states[i] = true;
            time = millis();
        }
        else if (buttonState == LOW && button_modes[1][i] == 1 && millis() - time > debounce)
        {
            button_modes[1][i] = 0;
            digitalWrite(led_pins[i], LOW); // Turn the LED off
            led_states[i] = false;
            time = millis();
        }
        delay(50);
    }
    lastButtonState = buttonState;
}

// Turn off all LEDs
void poweroffLeds()
{
    for (uint8_t i = 0; i < 5; i++)
    {
        digitalWrite(led_pins[i], LOW);
        led_states[i] = false;
    }
}

// Turn on all the current mode LEDs
void showModeLeds()
{
    for (uint8_t i = 0; i < 5; i++)
    {
        if (button_modes[1][i] == 1)
        {
            digitalWrite(led_pins[i], HIGH);
            led_states[i] = true;
        }
    }
}

// Check and set which layer is active
void setLayer()
{
    if (digitalRead(switch_pins[0]) == LOW && digitalRead(switch_pins[1]) == HIGH && current_layer != 0)
    {
        current_layer = 0; // Switch UP
    }
    else if (digitalRead(switch_pins[0]) == HIGH && digitalRead(switch_pins[1]) == HIGH && current_layer != 1)
    {
        current_layer = 1; // Switch OFF
    }
    else if (digitalRead(switch_pins[0]) == HIGH && digitalRead(switch_pins[1]) == LOW && current_layer != 2)
    {
        current_layer = 2; // Switch DOWN
    }
}

// Actual logic
void setup()
{
    Serial.begin(115200);
    // Button Pins
    for (uint8_t i = 0; i < 5; i++)
    {
        pinMode(button_pins[i], INPUT_PULLUP);
    }
    // LED Pins
    for (uint8_t i = 0; i < 5; i++)
    {
        pinMode(led_pins[i], OUTPUT);
    }
    // Switch Pins
    for (uint8_t i = 0; i < 2; i++)
    {
        pinMode(switch_pins[i], INPUT_PULLUP);
    }
    // Set currently active Layer
    setLayer();
}

void loop()
{
    initBPM(); // Blinking BPM LED - needs to be enabled in your DAW
    setLayer(); // Set which Layer we are using

    // Button operations based on current_layer
    for (uint8_t i = 0; i < 5; i++)
    {
        if (current_layer < 2) // Only layers 0 and 1 are normal operational layers
        {
            poweroffLeds();
            if (button_modes[current_layer][i] == 0)
            {
                handlePushButton(i);
            }
            else if (button_modes[current_layer][i] == 1)
            {
                handleToggleButton(i);
            }
        }
        else if (current_layer == 2) // Layer 2 is the "settings" layer
        {
            showModeLeds();
            handleChangeMode(i);
        }
    }
}
