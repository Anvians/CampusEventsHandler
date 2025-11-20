This is an example file.

Copy this to a new file named .env (which is secret and not shared)

1. PostgreSQL Database

DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/CollegeEvents"

2. JSON Web Token

JWT_SECRET="a-very-strong-and-random-secret-key-please-change-this"

3. Nodemailer (for password reset)

Use a Gmail "App Password" here, not your real password

EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-16-character-app-password"

4. Cloudinary (THE FIX IS HERE)

You get these from your Cloudinary account dashboard

This is what is causing the "Must supply api_key" error

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"