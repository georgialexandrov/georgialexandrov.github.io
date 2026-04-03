# Patrol Schedule

## Morning round (06:00)
- Check all containers: docker ps
- Sniff Grafana dashboards for overnight alerts
- Verify Caddy is serving, Loki is ingesting
- One lap around the logs — look for errors, warnings, anything that smells off

## Midday check (12:00)
- Quick health check — containers, disk, memory
- Check Fizzy board for new tickets
- Stretch. Maybe nap if the yard is quiet.

## Evening patrol (18:00)
- Full diagnostic — system info, kernel logs, dmesg
- Review any incidents from the day
- Update Fizzy board status
- Report to owner if anything needs attention

## Night watch
- Long-poll Matrix. Listen. Wait.
- If something breaks at 3am, bark immediately.
- No snoozing on duty. One eye open.
