#include "MIDIUSB.h"
#include <EEPROM.h>

/*
  MIDI Footswitch Firmware

               /
  ,--------------,
  |  O    |    O |
  |--------------|
  |  O |  O |  O |
  `--------------`
*/

// --- Configuration ---
const int NUM_BUTTONS = 5;
const int NUM_LAYERS = 3; // L, Center, R
const int BTN_PINS[NUM_BUTTONS] = {5, 6, 7, 8, 9};
const int LED_PINS[NUM_BUTTONS] = {10, 16, 14, 15, 18};

// Switch Pins (3-way toggle: ON-OFF-ON)
// Pos 1: L=GND, R=FLOAT -> Layer 0
// Pos 2: L=FLOAT, R=FLOAT -> Layer 1 (Center)
// Pos 3: L=FLOAT, R=GND -> Layer 2
const int SWITCH_PIN_L = 1;
const int SWITCH_PIN_R = 0;

// Protocol Constants
const int TYPE_NOTE = 0;
const int TYPE_CC = 1;
const int MODE_MOMENTARY = 0;
const int MODE_TOGGLE = 1;

// EEPROM Storage Address
const int EEPROM_START_ADDR = 0;

// Struct for Button Settings
struct ButtonConfig {
  uint8_t type;    // TYPE_NOTE or TYPE_CC
  uint8_t value;   // Note number or CC number
  uint8_t mode;    // MODE_MOMENTARY or MODE_TOGGLE
  uint8_t channel; // MIDI Channel (default 1)
};

// Storage for all layers [Layer][Button]
ButtonConfig buttonConfigs[NUM_LAYERS][NUM_BUTTONS];

// State tracking
bool lastButtonState[NUM_BUTTONS] = {HIGH, HIGH, HIGH, HIGH, HIGH}; // HIGH = Released
bool toggleState[NUM_LAYERS][NUM_BUTTONS]; // Toggle state per layer
int activeLayer[NUM_BUTTONS]; // Tracks which layer was active when button was pressed
unsigned long lastDebounceTime[NUM_BUTTONS] = {0};
// Debounce to prevent accidental excessive button readings.
// I tried lower than 10 but sometimes triggers fake readings, 10ms seems acceptable.
unsigned long debounceDelay = 10; 
int ppqn = 0;
unsigned long beatLedOffTime = 0;

void setup() {
  Serial.begin(115200);

  // Setup Button Pins
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(BTN_PINS[i], INPUT_PULLUP);
    pinMode(LED_PINS[i], OUTPUT);
    digitalWrite(LED_PINS[i], LOW);
    
    // Init state
    activeLayer[i] = 1; // Default to center
  }

  // Setup Switch Pins
  pinMode(SWITCH_PIN_L, INPUT_PULLUP);
  pinMode(SWITCH_PIN_R, INPUT_PULLUP);

  // Init toggle states
  for (int l = 0; l < NUM_LAYERS; l++) {
    for (int b = 0; b < NUM_BUTTONS; b++) {
      toggleState[l][b] = false;
    }
  }

  // Load Config from EEPROM
  loadConfig();
}

void loop() {
  handleSerial();
  handleMidi();
  readButtons();
  updateLEDs();
}

// --- Helpers ---

int getCurrentLayer() {
  if (digitalRead(SWITCH_PIN_L) == LOW) return 0;
  if (digitalRead(SWITCH_PIN_R) == LOW) return 2;
  return 1; // Center
}

// --- MIDI Handling ---

void handleMidi() {
  midiEventPacket_t rx;
  do {
    rx = MidiUSB.read();
    if (rx.byte1 == 0xF8) {
      ppqn++;
      if (ppqn == 24) {
        beatLedOffTime = millis() + 80;
        ppqn = 0;
      }
    }
  } while (rx.header != 0);
}

// --- Serial Command Handling ---
// CMD index maps to Layer * 5 + ButtonIndex
// 0-4: Layer 0, 5-9: Layer 1, 10-14: Layer 2

String inputBuffer = "";

void handleSerial() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\n') {
      parseCommand(inputBuffer);
      inputBuffer = "";
    } else {
      inputBuffer += c;
    }
  }
}

void parseCommand(String cmd) {
  cmd.trim();
  if (cmd.length() == 0) return;

  if (cmd.startsWith("SET")) {
    int firstSpace = cmd.indexOf(' ');
    int secondSpace = cmd.indexOf(' ', firstSpace + 1);
    int thirdSpace = cmd.indexOf(' ', secondSpace + 1);
    int fourthSpace = cmd.indexOf(' ', thirdSpace + 1);

    if (firstSpace > 0 && secondSpace > 0 && thirdSpace > 0 && fourthSpace > 0) {
      int idx = cmd.substring(firstSpace + 1, secondSpace).toInt();
      int type = cmd.substring(secondSpace + 1, thirdSpace).toInt();
      int val = cmd.substring(thirdSpace + 1, fourthSpace).toInt();
      int mode = cmd.substring(fourthSpace + 1).toInt();

      int totalButtons = NUM_BUTTONS * NUM_LAYERS;
      if (idx >= 0 && idx < totalButtons) {
        int layer = idx / NUM_BUTTONS;
        int btn = idx % NUM_BUTTONS;
        
        buttonConfigs[layer][btn].type = type;
        buttonConfigs[layer][btn].value = val;
        buttonConfigs[layer][btn].mode = mode;
        Serial.println("OK: SET " + String(idx));
      }
    }
  } else if (cmd.equals("GET")) {
    int totalButtons = NUM_BUTTONS * NUM_LAYERS;
    for (int i = 0; i < totalButtons; i++) {
      int layer = i / NUM_BUTTONS;
      int btn = i % NUM_BUTTONS;
      
      Serial.print("BTN:");
      Serial.print(i);
      Serial.print(":");
      Serial.print(buttonConfigs[layer][btn].type);
      Serial.print(":");
      Serial.print(buttonConfigs[layer][btn].value);
      Serial.print(":");
      Serial.println(buttonConfigs[layer][btn].mode);
    }
    Serial.println("OK: GET");
  } else if (cmd.equals("SAVE")) {
    saveConfig();
    Serial.println("OK: SAVE");
  } else {
    Serial.println("ERR: Unknown Command");
  }
}

// --- Logic ---

void readButtons() {
  int currentLayer = getCurrentLayer();

  for (int i = 0; i < NUM_BUTTONS; i++) {
    int reading = digitalRead(BTN_PINS[i]);

    if (reading != lastButtonState[i]) {
      lastDebounceTime[i] = millis();
    }
    
    static int stableState[NUM_BUTTONS] = {HIGH, HIGH, HIGH, HIGH, HIGH};

    if ((millis() - lastDebounceTime[i]) > debounceDelay) {
      if (reading != stableState[i]) {
        stableState[i] = reading;

        if (stableState[i] == LOW) {
           // Pressed: Lock in the current layer for this button
           activeLayer[i] = currentLayer;
           handlePress(i, currentLayer);
        } else {
           // Released: Use the locked layer
           handleRelease(i, activeLayer[i]);
        }
      }
    }
    
    lastButtonState[i] = reading;
  }
}

void handlePress(int idx, int layer) {
  ButtonConfig cfg = buttonConfigs[layer][idx];
  
  if (cfg.mode == MODE_MOMENTARY) {
    if (cfg.type == TYPE_NOTE) sendNoteOn(0, cfg.value, 127);
    else sendCC(0, cfg.value, 127);
    
  } else if (cfg.mode == MODE_TOGGLE) {
    toggleState[layer][idx] = !toggleState[layer][idx];
    
    if (toggleState[layer][idx]) {
       if (cfg.type == TYPE_NOTE) sendNoteOn(0, cfg.value, 127);
       else sendCC(0, cfg.value, 127);
    } else {
       if (cfg.type == TYPE_NOTE) sendNoteOff(0, cfg.value, 0);
       else sendCC(0, cfg.value, 0);
    }
  }
}

void handleRelease(int idx, int layer) {
  ButtonConfig cfg = buttonConfigs[layer][idx];
  
  if (cfg.mode == MODE_MOMENTARY) {
    if (cfg.type == TYPE_NOTE) sendNoteOff(0, cfg.value, 0);
    else sendCC(0, cfg.value, 0);
  }
}

void updateLEDs() {
  int layer = getCurrentLayer();
  
  for(int i=0; i<NUM_BUTTONS; i++) {
    bool ledOn = false;
    ButtonConfig cfg = buttonConfigs[layer][i];
    
    if (cfg.mode == MODE_MOMENTARY) {
        ledOn = (digitalRead(BTN_PINS[i]) == LOW); 
    } else {
        // Toggle mode: Light if state is true for CURRENT layer
        ledOn = toggleState[layer][i];
    }

    // Override first LED for BPM blink
    if (i == 0 && millis() < beatLedOffTime) {
        ledOn = true;
    }

    digitalWrite(LED_PINS[i], ledOn ? HIGH : LOW);
  }
}

// --- MIDI Helpers ---

void sendNoteOn(byte channel, byte pitch, byte velocity) {
  midiEventPacket_t noteOn = {0x09, 0x90 | channel, pitch, velocity};
  MidiUSB.sendMIDI(noteOn);
  MidiUSB.flush();
}

void sendNoteOff(byte channel, byte pitch, byte velocity) {
  midiEventPacket_t noteOff = {0x08, 0x80 | channel, pitch, velocity};
  MidiUSB.sendMIDI(noteOff);
  MidiUSB.flush();
}

void sendCC(byte channel, byte control, byte value) {
  midiEventPacket_t event = {0x0B, 0xB0 | channel, control, value};
  MidiUSB.sendMIDI(event);
  MidiUSB.flush();
}

// --- EEPROM ---

void saveConfig() {
  int addr = EEPROM_START_ADDR;
  EEPROM.update(addr++, 'M');
  EEPROM.update(addr++, 'C');
  
  for (int l = 0; l < NUM_LAYERS; l++) {
    for (int b = 0; b < NUM_BUTTONS; b++) {
      EEPROM.update(addr++, buttonConfigs[l][b].type);
      EEPROM.update(addr++, buttonConfigs[l][b].value);
      EEPROM.update(addr++, buttonConfigs[l][b].mode);
      EEPROM.update(addr++, buttonConfigs[l][b].channel);
    }
  }
}

void loadConfig() {
  int addr = EEPROM_START_ADDR;
  char m1 = EEPROM.read(addr++);
  char m2 = EEPROM.read(addr++);
  
  if (m1 == 'M' && m2 == 'C') {
    for (int l = 0; l < NUM_LAYERS; l++) {
      for (int b = 0; b < NUM_BUTTONS; b++) {
        buttonConfigs[l][b].type = EEPROM.read(addr++);
        buttonConfigs[l][b].value = EEPROM.read(addr++);
        buttonConfigs[l][b].mode = EEPROM.read(addr++);
        buttonConfigs[l][b].channel = EEPROM.read(addr++);
      }
    }
  } else {
    // Defaults
    for (int l = 0; l < NUM_LAYERS; l++) {
      for (int b = 0; b < NUM_BUTTONS; b++) {
        buttonConfigs[l][b].type = TYPE_NOTE;
        int baseNote = 60 + (l * 12); 
        buttonConfigs[l][b].value = baseNote + b;
        buttonConfigs[l][b].mode = MODE_MOMENTARY;
        buttonConfigs[l][b].channel = 0;
      }
    }
  }
}
