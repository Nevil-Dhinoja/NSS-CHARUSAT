# Email Setup Guide

## Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Factor Authentication

## Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **"Mail"** as the app
3. Select your device
4. Click **"Generate"**
5. Copy the **16-character password** (format: `abcd efgh ijkl mnop`)

## Step 3: Create .env File
Create a file named `.env` in the server directory with:

```
EMAIL_USER=d24dce147@charusat.edu.in
EMAIL_PASSWORD=your-16-character-app-password
```

## Step 4: Test Email
Run the test script:
```bash
node test-email.js
```

## Alternative: Set Environment Variables
If you don't want to create a .env file, set them when running the server:
```bash
EMAIL_USER=d24dce147@charusat.edu.in EMAIL_PASSWORD=your-app-password node server.js
```

## Troubleshooting
- Make sure you're using the App Password, not your regular Gmail password
- The App Password should be 16 characters with spaces
- Remove spaces when using in the .env file 