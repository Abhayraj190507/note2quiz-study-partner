import smtplib
import ssl
from email.message import EmailMessage

from flask import current_app


def send_mail(to, subject, text):
    """Sends via SMTP when configured; otherwise logs the email (and keeps it in app.outbox for tests/dev)."""
    cfg = current_app.config
    current_app.outbox.append({"to": to, "subject": subject, "text": text})
    if not cfg["SMTP_HOST"]:
        current_app.logger.info("EMAIL (not sent, SMTP not configured)\nTo: %s\nSubject: %s\n%s", to, subject, text)
        return
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = cfg["MAIL_FROM"], to, subject
    msg.set_content(text)
    try:
        with smtplib.SMTP(cfg["SMTP_HOST"], cfg["SMTP_PORT"], timeout=15) as s:
            s.starttls(context=ssl.create_default_context())
            if cfg["SMTP_USER"]:
                s.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
            s.send_message(msg)
    except Exception:
        current_app.logger.exception("Could not send email to %s", to)
