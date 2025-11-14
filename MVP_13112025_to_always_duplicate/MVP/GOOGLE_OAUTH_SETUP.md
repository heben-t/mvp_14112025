# IMPORTANT: Add these to your .env file

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# How to get Google OAuth credentials:
# 1. Go to https://console.cloud.google.com/
# 2. Create a new project or select existing one
# 3. Enable Google+ API
# 4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
# 5. Application type: Web application
# 6. Authorized redirect URIs: 
#    - http://localhost:3002/api/auth/callback/google
#    - http://localhost:3000/api/auth/callback/google
#    - https://yourdomain.com/api/auth/callback/google
# 7. Copy Client ID and Client Secret

# Add these to your existing .env file
