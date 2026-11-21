LUCXI E-COMMERCE ORDER BACKEND PACKAGE
======================================
This package keeps the LUCXI storefront look and removes the "demo order" label.
Checkout posts orders to a server endpoint. Orders are saved on the server in data/orders.json.
Order notification emails are sent via SMTP (Gmail example) after SMTP credentials are configured.

SETUP ON WINDOWS
1) Install Node.js LTS from https://nodejs.org/
2) Extract this ZIP into a folder (keep the assets folder in place).
3) In this folder, duplicate .env.example as .env and fill in SMTP settings.
   For Gmail, use a Google App Password (requires 2-Step Verification); never use your regular Gmail password.
4) Open Command Prompt in this folder and run: npm install
5) Run: npm start
6) Open: http://localhost:3000
7) Place a test order and check the store inbox: mr4smillybusiness@gmail.com


IMPORTANT LIMITATIONS BEFORE A REAL PUBLIC LAUNCH
- This is an ecommerce foundation, not yet a fully production-hardened shop. It is not deployed to a public HTTPS domain.
- SMTP is not configured with credentials in this ZIP; email will only send after you set up .env.
- UPI QR payments are manual and cannot be verified automatically. A live payment gateway (e.g., Razorpay) needs merchant onboarding, keys and webhook validation.
- The existing product/admin controls remain browser-side/localStorage and are not yet server-secure or shared across devices. Do not publish as a live business until admin/product management is migrated behind server authentication and a persistent database, HTTPS, security hardening, privacy policy, backups, inventory and payment verification are completed.
- Never put UPI PIN, OTP, bank login password or customer card data in this app.
- Orders contain personal data; secure hosting, access controls, retention and privacy compliance are required before public use.
