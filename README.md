# LuthierGram

A modern Instagram Content Manager specifically designed for luthiers and guitar builders. Organize your build photos from Google Photos and Google Drive, create engaging content, and manage your Instagram presence.

## ✨ Features

- **Modern Photo Import (2025)**: Import photos from both Google Photos and Google Drive using the latest picker APIs
- **Build Organization**: Group photos by guitar builds with wood types and build stages
- **AI Content Generation**: Generate Instagram captions and hashtags
- **Content Scheduling**: Plan and schedule your posts in advance
- **Professional UI**: Beautiful, luthier-themed interface

## 🚀 Modern Google Integration (2025 Update)

Due to Google's 2025 API changes that deprecated the Photos Library API, LuthierGram now uses:

- **Google Photos Picker API**: For secure access to Google Photos
- **Google Drive Picker API**: For accessing images stored in Google Drive
- **Modern Authentication**: OAuth2 with drive.readonly scope

Both pickers provide a secure, Google-approved interface for photo selection without requiring deprecated API access.

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY=your-google-developer-api-key
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Drive API** (for Google Drive picker)
   - **Google Picker API** (for photo selection interface)

4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

5. Create an API Key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to:
     - Google Drive API
     - Google Picker API
   - Optional: Restrict by HTTP referrer for security

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📸 Photo Import Workflow

1. **Sign In**: Authenticate with your Google account
2. **Choose Source**: Select either Google Photos or Google Drive
3. **Pick Photos**: Use the Google picker interface to select photos
4. **Organize**: Group selected photos by builds
5. **Create Content**: Generate captions and schedule posts

## 🔧 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: NextAuth.js with Google OAuth2
- **Styling**: Tailwind CSS with custom luthier theme
- **Type Safety**: TypeScript
- **Google APIs**: 
  - Google Photos Picker API
  - Google Drive Picker API
  - Google OAuth2

## 🎯 API Integration Details

### Google Photos Picker API
- **Purpose**: Secure photo selection from Google Photos
- **Scope**: No additional scope required (uses picker interface)
- **Implementation**: Official Google picker widget

### Google Drive Picker API  
- **Purpose**: Access to images and videos in Google Drive
- **Scope**: `https://www.googleapis.com/auth/drive.readonly`
- **Implementation**: Drive picker with image/video filters

### Authentication Flow
```
User Login → Google OAuth2 → Access Token → Picker APIs → Photo Import
```

## 🔒 Security & Privacy

- **No Backend Storage**: Photos are referenced, not stored on our servers
- **OAuth2 Security**: Industry-standard authentication
- **Picker APIs**: Google-approved interfaces for secure access
- **Minimal Permissions**: Only requests necessary scopes

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure your platform supports:
- Node.js 18+
- Environment variables
- HTTPS (required for Google OAuth)

## 🐛 Troubleshooting

### Common Issues

1. **"Developer Key not configured"**
   - Add `NEXT_PUBLIC_GOOGLE_DEVELOPER_KEY` to environment variables
   - Ensure the API key is unrestricted or allows your domain

2. **"Authentication required"**
   - Check Google OAuth credentials
   - Verify redirect URIs in Google Cloud Console
   - Clear browser cache and cookies

3. **"Failed to load Google APIs"**
   - Check internet connection
   - Verify domain restrictions on API key
   - Ensure Google APIs are enabled in Cloud Console

### API Limitations

- **Photos Picker**: Limited to Google's picker interface capabilities
- **Drive Picker**: Requires files to be accessible to the user
- **Rate Limits**: Subject to Google API quotas

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

## 📞 Support

For support, please open an issue in the GitHub repository.
