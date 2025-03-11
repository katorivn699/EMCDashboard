const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback cho SSR
};

const REDIRECT_URI = `${getBaseUrl()}/api/auth/callback`;

export const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=identify`;