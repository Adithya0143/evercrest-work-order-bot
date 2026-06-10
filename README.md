# Evercrest Work Order Bot MVP

This is a self-contained browser prototype for the Evercrest tenant work order chatbot.

## What It Does

- Guides tenants through maintenance intake.
- Starts with a focused AC/HVAC troubleshooting workflow.
- Flags urgent situations such as active leaks, burning smell, repeated breaker trips, and heat risk.
- Produces an Appfolio-ready job description.
- Produces a maintenance-team handoff message.
- Exports a structured JSON work order package.

## How To Open

Open `index.html` in a browser.

Local file:

`C:\Users\india\OneDrive\Documents\New project\evercrest-work-order-bot\index.html`

Suggested test flow:

1. Enter a tenant name.
2. Enter a property address.
3. Enter a phone number and email.
4. Select `AC / HVAC`.
5. Describe an AC issue such as `AC is not cooling and the outside fan is not spinning`.
6. Choose `No urgent risk`.
7. Select a few AC symptoms and safe checks, then choose `Done`.
8. Finish media, appointment, and access questions.
9. Review the Appfolio draft and maintenance team message on the right.

## Next Build Steps

1. Add staff login and saved work order list.
2. Store requests in a database.
3. Add file upload for photos and videos.
4. Add Appfolio/report integration after staff approval.
5. Add OpenAI-powered natural language classification using the same structured fields.
