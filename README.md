<<<<<<< HEAD
# Éclat AUTO Website

This is a Next.js project for the car detailing shop's website. It uses Tailwind CSS with a custom navy/gold colour theme.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file with your Google API credentials (see `.env.local` example).
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- French language pages
- Booking form that submits to a Next.js API route
- API route calls Google Calendar API to create events
- Tailwind CSS styling with navy/gold color scheme

## Deployment

Deploy to Vercel using your GitHub repository. Set the same environment variables in the Vercel dashboard.

## Google API setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the **Google Calendar API** for the project.
4. Under **APIs & Services > Credentials**, create an OAuth 2.0 Client ID (type "Web application").
   - Add `http://localhost:3000` to the authorized JavaScript origins.
   - Add `http://localhost:3000/api/book` as an authorized redirect URI.
5. Copy the **Client ID** and **Client Secret** into `.env.local`.

### Obtaining a Refresh Token

Run the following Node script once (example in `tools/getRefreshToken.js`) to authorize and get a refresh token:

```js
// tools/getRefreshToken.js
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/book' // or any redirect URL
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('Authorize this app by visiting this url:', authUrl);

// After visiting the URL and approving, you'll get a code query parameter.
// Paste the code below and run again to retrieve the refresh token.

/*
const code = 'PASTE_CODE_HERE';
(async () => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log('Refresh token:', tokens.refresh_token);
})();
*/
```

Copy the printed refresh token into `.env.local` as `GOOGLE_REFRESH_TOKEN`.

When deploying to Vercel, set the same environment variables there.
=======
# eclatauto
Site web Eclat Auto
>>>>>>> c969e2938b21a6b990e14adab16a791a52e91e16
