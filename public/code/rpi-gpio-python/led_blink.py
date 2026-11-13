"""EdgeMind Lab: rpi-gpio-python

Blink an LED connected to GPIO17 (physical pin 11) with gpiozero.
Pin numbers are BCM GPIO numbers, not physical pin positions.
"""

from signal import pause

from gpiozero import LED

LED_PIN = 17  # BCM numbering: GPIO17 is physical pin 11

led = LED(LED_PIN)

# blink() runs in the background, so keep the script alive with pause().
led.blink(on_time=1, off_time=1)

print("Blinking the LED. Press Ctrl+C to stop.")
pause()
