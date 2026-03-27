

## Fix: "Save & Email My Report" — Deliver the Report to the User's Inbox

### Problem
Currently, clicking "Save & Email My Report" only inserts a row into the `scanner_leads` table. No email is actually sent because no email infrastructure is set up.

### Solution
Set up Lovable's built-in email system to send a branded report summary email to the user after they submit the form.

### Steps

**1. Set up an email domain**
The first step is configuring a sender domain so emails can be sent from your brand (e.g., `notify@yourdomain.com`). You'll need to add DNS records at your domain registrar. This is a one-time setup.

**2. Set up email infrastructure**
This creates the backend queuing and delivery system that powers reliable email sending with retries.

**3. Create a "report-summary" email template**
A branded React Email template that includes:
- Greeting with the user's name
- Total hours saved summary
- Top automation recommendations (title, hours saved, ROI)
- A "Book a Free Discovery Call" button linking to your Google Calendar
- Creative Hauz branding with your terracotta/green color palette
- Footer with "Built by Creative Hauz – creativehauz.space"

**4. Register and deploy the email function**
Register the template in the email registry and deploy the edge function.

**5. Update EmailCapture.tsx**
After the lead is inserted into `scanner_leads`, invoke the `send-transactional-email` function with:
- `templateName: 'report-summary'`
- `recipientEmail`: the user's email
- `idempotencyKey`: derived from the inserted lead ID
- `templateData`: name + key report highlights (total hours saved, recommendation titles)

**6. Update success message**
Change the toast to "Report saved and emailed! Check your inbox."

### What You'll Need To Do
- When prompted, set up your sender domain (you'll need access to your domain's DNS settings)
- DNS verification can take up to 72 hours, but everything else will be ready immediately

