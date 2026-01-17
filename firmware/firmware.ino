#include "MIDIUSB.h"
#include <EEPROM.h>

/*
  MIDI Footswitch Firmware
*/

enum ComponentType {
  COMP_BUTTON,
  COMP_LED,
  COMP_POT
};

struct HardwareComponent {
  ComponentType type;
  int pin;
  int logicalId; // Maps to Config index (0..NUM_CONTROLS-1)
};

// --- USER HARDWARE DEFINITION --

// Define how many logical control slots exist per layer.
// This matches the number of Inputs (Buttons/Potentiometers).
// LEDs DO NOT COUNT towards this limit as they share the logical ID of a button.
// Example:
// 5 Buttons? = 5 Controls
// 4 Buttons + 2 Potentiometers? = 6 Controls
const int NUM_CONTROLS = 5; 
const int NUM_LAYERS = 3; // L, Center, R

HardwareComponent hardware[] = {
  // Buttons
  { COMP_BUTTON, 5, 0 },
  { COMP_BUTTON, 6, 1 },
  { COMP_BUTTON, 7, 2 },
  { COMP_BUTTON, 8, 3 },
  { COMP_BUTTON, 9, 4 },
  
  // LEDs (not configurable, just match the same button ids)
  { COMP_LED, 10, 0 },
  { COMP_LED, 16, 1 },
  { COMP_LED, 14, 2 },
  { COMP_LED, 15, 3 },
  { COMP_LED, 18, 4 },

  // Potentiometers
  // { COMP_POT, A1, 5 }
};
// --- End USER HARDWARE DEFINITION --

const int HW_COUNT = sizeof(hardware) / sizeof(hardware[0]);

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

// Header signature. Change to force EEPROM reset when structure changes.
const char EEPROM_SIG[2] = {'M', 'F'};

// Struct for Control Settings
struct ControlConfig {
  uint8_t type;    // TYPE_NOTE or TYPE_CC
  uint8_t value;   // Note number or CC number
  uint8_t mode;    // MODE_MOMENTARY or MODE_TOGGLE
  uint8_t channel; // MIDI Channel (default 1)
  uint8_t minValue; // Value for OFF/Release
  uint8_t maxValue; // Value for ON/Press
};

// Storage for all layers [Layer][Control]
ControlConfig controlConfigs[NUM_LAYERS][NUM_CONTROLS];

// State tracking
bool lastButtonState[NUM_CONTROLS]; // HIGH = Released
int lastPotValue[NUM_CONTROLS]; // 0-127
bool toggleState[NUM_LAYERS][NUM_CONTROLS]; // Toggle state per layer
int activeLayer[NUM_CONTROLS]; // Tracks which layer was active when button was pressed
unsigned long lastDebounceTime[NUM_CONTROLS];
// Debounce to prevent accidental excessive button readings.
unsigned long debounceDelay = 10; 
int ppqn = 0;
unsigned long beatLedOffTime = 0;

// Forward declarations
void setDefaults();
int getCurrentLayer();
void handleSerial();
void handleMidi();
void readHardware();
void updateLEDs();
void parseCommand(String cmd);
void saveConfig();
void loadConfig();
void handlePress(int idx, int layer);
void handleRelease(int idx, int layer);
void sendNoteOn(byte channel, byte pitch, byte velocity);
void sendNoteOff(byte channel, byte pitch, byte velocity);
void sendCC(byte channel, byte control, byte value);


void setup() {
  Serial.begin(115200);

  // Init State Arrays
  for(int i=0; i<NUM_CONTROLS; i++) {
    lastButtonState[i] = HIGH;
    lastPotValue[i] = -1;
    activeLayer[i] = 1; // Default Center
    lastDebounceTime[i] = 0;
  }

  // Setup Hardware Pins
  for (int i = 0; i < HW_COUNT; i++) {
    if (hardware[i].type == COMP_BUTTON) {
      pinMode(hardware[i].pin, INPUT_PULLUP);
    } else if (hardware[i].type == COMP_LED) {
      pinMode(hardware[i].pin, OUTPUT);
      digitalWrite(hardware[i].pin, LOW);
    } 
  }

  // Setup Switch Pins
  pinMode(SWITCH_PIN_L, INPUT_PULLUP);
  pinMode(SWITCH_PIN_R, INPUT_PULLUP);

  // Init toggle states
  for (int l = 0; l < NUM_LAYERS; l++) {
    for (int b = 0; b < NUM_CONTROLS; b++) {
      toggleState[l][b] = false;
    }
  }

  // Load Config from EEPROM
  loadConfig();
}

void loop() {
  handleSerial();
  handleMidi();
  readHardware();
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

  if (cmd.equals("INFO")) {
    Serial.print("SYS:LAYERS:");
    Serial.println(NUM_LAYERS);
    Serial.print("SYS:CONTROLS:");
    Serial.println(NUM_CONTROLS);
    
    // Dump Hardware Layout
    for (int i = 0; i < NUM_CONTROLS; i++) {
      int type = -1; 
      for (int h = 0; h < HW_COUNT; h++) {
        if (hardware[h].logicalId == i) {
          if (hardware[h].type == COMP_POT) { 
             type = 1; 
             break; // Found Pot, wins
          }
          if (hardware[h].type == COMP_BUTTON) { 
             type = 0; 
          }
        }
      }
      if (type != -1) {
        Serial.print("SYS:TYPE:");
        Serial.print(i);
        Serial.print(":");
        Serial.println(type == 1 ? "POT" : "BTN");
      }
    }
    
    Serial.println("OK: INFO");
  } else if (cmd.startsWith("SET")) {
    int firstSpace = cmd.indexOf(' ');
    int secondSpace = cmd.indexOf(' ', firstSpace + 1);
    int thirdSpace = cmd.indexOf(' ', secondSpace + 1);
    int fourthSpace = cmd.indexOf(' ', thirdSpace + 1);
    int fifthSpace = cmd.indexOf(' ', fourthSpace + 1);
    int sixthSpace = cmd.indexOf(' ', fifthSpace + 1);

    if (firstSpace > 0 && secondSpace > 0 && thirdSpace > 0 && fourthSpace > 0 && fifthSpace > 0 && sixthSpace > 0) {
      int idx = cmd.substring(firstSpace + 1, secondSpace).toInt();
      int type = cmd.substring(secondSpace + 1, thirdSpace).toInt();
      int val = cmd.substring(thirdSpace + 1, fourthSpace).toInt();
      int mode = cmd.substring(fourthSpace + 1, fifthSpace).toInt();
      int minV = cmd.substring(fifthSpace + 1, sixthSpace).toInt();
      int maxV = cmd.substring(sixthSpace + 1).toInt();

      int totalItems = NUM_CONTROLS * NUM_LAYERS;
      if (idx >= 0 && idx < totalItems) {
        int layer = idx / NUM_CONTROLS;
        int btn = idx % NUM_CONTROLS;
        
        controlConfigs[layer][btn].type = type;
        controlConfigs[layer][btn].value = val;
        controlConfigs[layer][btn].mode = mode;
        controlConfigs[layer][btn].minValue = minV;
        controlConfigs[layer][btn].maxValue = maxV;
        Serial.println("OK: SET " + String(idx));
      }
    }
  } else if (cmd.equals("GET")) {
    int totalItems = NUM_CONTROLS * NUM_LAYERS;
    for (int i = 0; i < totalItems; i++) {
      int layer = i / NUM_CONTROLS;
      int btn = i % NUM_CONTROLS;
      
      Serial.print("BTN:");
      Serial.print(i);
      Serial.print(":");
      Serial.print(controlConfigs[layer][btn].type);
      Serial.print(":");
      Serial.print(controlConfigs[layer][btn].value);
      Serial.print(":");
      Serial.print(controlConfigs[layer][btn].mode);
      Serial.print(":");
      Serial.print(controlConfigs[layer][btn].minValue);
      Serial.print(":");
      Serial.println(controlConfigs[layer][btn].maxValue);
    }
    Serial.println("OK: GET");
  } else if (cmd.equals("SAVE")) {
    saveConfig();
    Serial.println("OK: SAVE");
  } else if (cmd.equals("RESET")) {
    setDefaults();
    saveConfig();
    Serial.println("OK: RESET");
  } else {
    Serial.println("ERR: Unknown Command");
  }
}

// --- Logic ---

void readHardware() {
  int currentLayer = getCurrentLayer();

  for (int i = 0; i < HW_COUNT; i++) {
    int idx = hardware[i].logicalId;
    if (idx < 0 || idx >= NUM_CONTROLS) continue;

    if (hardware[i].type == COMP_BUTTON) {
        int reading = digitalRead(hardware[i].pin);
        
        if (reading != lastButtonState[idx]) {
          lastDebounceTime[idx] = millis();
        }
        
        static int stableState[NUM_CONTROLS];
        static bool initialized = false;
        if (!initialized) {
           for(int k=0; k<NUM_CONTROLS; k++) stableState[k] = HIGH;
           initialized = true;
        }

        if ((millis() - lastDebounceTime[idx]) > debounceDelay) {
          if (reading != stableState[idx]) {
              stableState[idx] = reading;

              if (stableState[idx] == LOW) { // Pressed
                activeLayer[idx] = currentLayer;
                handlePress(idx, currentLayer);
              } else { // Released
                handleRelease(idx, activeLayer[idx]);
              }
          }
        }
        lastButtonState[idx] = reading;

    } else if (hardware[i].type == COMP_POT) {
        int raw = analogRead(hardware[i].pin);
        int midiVal = raw >> 3; // 0-1023 -> 0-127
        
        // Simple hysteresis
        if (lastPotValue[idx] == -1 || abs(midiVal - lastPotValue[idx]) > 1) { 
           lastPotValue[idx] = midiVal;
           ControlConfig cfg = controlConfigs[currentLayer][idx];
           // Usually Pots are CC.
           if (cfg.type == TYPE_CC) { 
              sendCC(cfg.channel, cfg.value, midiVal);
           } else {
              // If configured as Note, send Note On with velocity = value
               if (midiVal > 0) sendNoteOn(cfg.channel, cfg.value, midiVal);
               else sendNoteOff(cfg.channel, cfg.value, 0);
           }
        }
    }
  }
}

void handlePress(int idx, int layer) {
  ControlConfig cfg = controlConfigs[layer][idx];
  
  if (cfg.mode == MODE_MOMENTARY) {
    if (cfg.type == TYPE_NOTE) sendNoteOn(0, cfg.value, cfg.maxValue);
    else sendCC(0, cfg.value, cfg.maxValue);
    
  } else if (cfg.mode == MODE_TOGGLE) {
    toggleState[layer][idx] = !toggleState[layer][idx];
    
    if (toggleState[layer][idx]) {
       if (cfg.type == TYPE_NOTE) sendNoteOn(0, cfg.value, cfg.maxValue);
       else sendCC(0, cfg.value, cfg.maxValue);
    } else {
       if (cfg.type == TYPE_NOTE) sendNoteOff(0, cfg.value, cfg.minValue);
       else sendCC(0, cfg.value, cfg.minValue);
    }
  }
}

void handleRelease(int idx, int layer) {
  ControlConfig cfg = controlConfigs[layer][idx];
  
  if (cfg.mode == MODE_MOMENTARY) {
    if (cfg.type == TYPE_NOTE) sendNoteOff(0, cfg.value, cfg.minValue);
    else sendCC(0, cfg.value, cfg.minValue);
  }
}

void updateLEDs() {
  int layer = getCurrentLayer();
  
  for (int i = 0; i < HW_COUNT; i++) {
    if (hardware[i].type == COMP_LED) {
       int idx = hardware[i].logicalId;
       if (idx < 0 || idx >= NUM_CONTROLS) continue;
       
       bool ledOn = false;
       ControlConfig cfg = controlConfigs[layer][idx];

       if (cfg.mode == MODE_MOMENTARY) {
           ledOn = (lastButtonState[idx] == LOW);
       } else {
           ledOn = toggleState[layer][idx];
       }

       // Override first LED (logical 0) for BPM
       if (idx == 0 && millis() < beatLedOffTime) {
           ledOn = true;
       }
       
       digitalWrite(hardware[i].pin, ledOn ? HIGH : LOW);
    }
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
  EEPROM.update(addr++, EEPROM_SIG[0]);
  EEPROM.update(addr++, EEPROM_SIG[1]);
  
  for (int l = 0; l < NUM_LAYERS; l++) {
    for (int b = 0; b < NUM_CONTROLS; b++) {
      EEPROM.update(addr++, controlConfigs[l][b].type);
      EEPROM.update(addr++, controlConfigs[l][b].value);
      EEPROM.update(addr++, controlConfigs[l][b].mode);
      EEPROM.update(addr++, controlConfigs[l][b].channel);
      EEPROM.update(addr++, controlConfigs[l][b].minValue);
      EEPROM.update(addr++, controlConfigs[l][b].maxValue);
    }
  }
}

void setDefaults() {
  for (int l = 0; l < NUM_LAYERS; l++) {
    for (int b = 0; b < NUM_CONTROLS; b++) {
      controlConfigs[l][b].type = TYPE_NOTE;
      int baseNote = 60 + (l * 12); 
      controlConfigs[l][b].value = baseNote + b;
      controlConfigs[l][b].mode = MODE_MOMENTARY;
      controlConfigs[l][b].channel = 0;
      controlConfigs[l][b].minValue = 0;
      controlConfigs[l][b].maxValue = 127;
    }
  }
}

void loadConfig() {
  int addr = EEPROM_START_ADDR;
  char m1 = EEPROM.read(addr++);
  char m2 = EEPROM.read(addr++);
  
  if (m1 == EEPROM_SIG[0] && m2 == EEPROM_SIG[1]) {
    for (int l = 0; l < NUM_LAYERS; l++) {
      for (int b = 0; b < NUM_CONTROLS; b++) {
        controlConfigs[l][b].type = EEPROM.read(addr++);
        controlConfigs[l][b].value = EEPROM.read(addr++);
        controlConfigs[l][b].mode = EEPROM.read(addr++);
        controlConfigs[l][b].channel = EEPROM.read(addr++);
        controlConfigs[l][b].minValue = EEPROM.read(addr++);
        controlConfigs[l][b].maxValue = EEPROM.read(addr++);
      }
    }
  } else {
    setDefaults();
  }
}
