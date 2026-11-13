"""EdgeMind Lab: rpi-gpio-python

Light an LED while a push button is held down.

Wiring (BCM numbering):
  LED, through a resistor, between GPIO17 (physical pin 11) and GND
  Push button between GPIO27 (physical pin 13) and GND
"""

from signal import pause

from gpiozero import LED, Button

LED_PIN = 17
BUTTON_PIN = 27

led = LED(LED_PIN)

# By default gpiozero pulls the pin high, so the other side of the button goes to GND.
button = Button(BUTTON_PIN)

# Pass the functions themselves: led.on, not led.on().
button.when_pressed = led.on
button.when_released = led.off

print("Hold the button to light the LED. Press Ctrl+C to stop.")
pause()
