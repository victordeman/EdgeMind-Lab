// EdgeMind Lab: arduino-blink
// Turns the on-board LED on for one interval, then off for one interval, forever.

// LED_BUILTIN is the pin number of the board's on-board LED.
const int LED_PIN = LED_BUILTIN;

// How long the LED stays on, and then off, in milliseconds.
const unsigned long INTERVAL_MS = 1000;

void setup() {
  // setup() runs once, when the board starts or is reset.
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // loop() runs over and over after setup() finishes.
  digitalWrite(LED_PIN, HIGH);  // LED on
  delay(INTERVAL_MS);           // wait
  digitalWrite(LED_PIN, LOW);   // LED off
  delay(INTERVAL_MS);           // wait
}
