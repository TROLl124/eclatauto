const { google } = require('googleapis');
require('dotenv').config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/book'
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar']
});

console.log('1. Visit this URL and authorize the application:');
console.log(authUrl);
console.log('\n2. After granting access, you will be redirected to a URL containing a `code` parameter.');
console.log('   Paste that code below and uncomment the block in this script to exchange it for a refresh token.');

// Uncomment the following block and replace the placeholder code to retrieve tokens
/*
const code = 'PASTE_CODE_HERE';
(async () => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log('Refresh token:', tokens.refresh_token);
})();
*/
