# MIDI Pedal Web Configurator

React web application that communicates directly with the MIDI Footswitch using the **Web Serial API**.

## Usage

1. Connect the footswitch via USB
2. Click **Connect Device** in the browser
3. Select the Arduino/Serial device from the browser popup
4. Use **Load from pedal** to read settings and **Save** to write them

## Development

### Prerequisites

- Node.js <=18
- A Web Serial compatible browser (Chrome, Edge)

### How to Run

1. **Install Dependencies**

   ```bash
   cd webserial_app
   npm install
   ```

2. **Start Dev Server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`
