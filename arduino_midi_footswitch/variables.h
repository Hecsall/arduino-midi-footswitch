
// Arduino Pins
const byte button_pins[5] = {5, 6, 7, 8, 9};   // Pins where buttons are connected
const byte switch_pins[2] = {1, 0};            // Pins where the switch is connected
const byte led_pins[5] = {10, 16, 14, 15, 18}; // Pins where LEDs are connected

// Layer: this is the currently select layer (changed by the switch)
byte current_layer; // 0 = switch up, 1 = switch off, 2 = switch down

// CC values are the numbers in the decimal column of this table
// https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2

const int button_layers[2][5] = {
    /*
    Layer 0 (Switch Up)
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
    Layer 1 (Switch Off)
    ,-----------------,
    |  16    |     17 |
    |-----------------|
    |  18 |  19 |  48 |
    `-----------------`
    */
    {
        16,     17,
        18, 19, 48
    }
};

// Button modes: 0 = push button, 1 = toggle button
byte button_modes[2][5] = {
    // Layer 0 (Switch Up)
    {0, 0, 0, 0, 0},

    // Layer 1 (Switch Off)
    {0, 0, 0, 0, 0}
};

int buttonState = 0; 
int lastButtonState = 0; 

// Button states: true = button ON, false = button OFF
int button_states[5] = {false, false, false, false, false};

long time = 0;         // the last time the output pin was toggled
long debounce = 200;   // the debounce time, increase if the output flickers

// LED states
bool led_states[5] = {false, false, false, false, false};

byte ppqn = 0; // "Pulse Per Quarter Note"