
// This module holds the API key in memory on the server.
// It's intentionally simple for local development.
// NOT SUITABLE FOR PRODUCTION if used to bypass secure env vars.

let devApiKey: string | undefined = undefined;

export async function setDeveloperApiKey(key: string | null): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    devApiKey = key === null ? undefined : key;
    if (devApiKey) {
      console.log('Developer API key has been set in memory for this session.');
    } else {
      console.log('Developer API key has been cleared from memory for this session.');
    }
  } else {
    console.warn('Attempted to set developer API key outside of development environment. Action ignored.');
  }
}

// This function will be called by the googleAI plugin.
export async function getGoogleApiKeyForPlugin(): Promise<string> {
  // In development, prioritize the dynamically set devApiKey.
  if (process.env.NODE_ENV === 'development' && typeof devApiKey === 'string' && devApiKey.trim() !== '') {
    return devApiKey;
  }
  // Fallback to environment variable (from .env file or hosting environment).
  const envKey = process.env.GOOGLE_API_KEY;
  if (typeof envKey === 'string' && envKey.trim() !== '') {
    return envKey;
  }
  
  // If no key is found, return a specific string that will cause an auth error from Google,
  // but won't be the function's source code or undefined causing a TypeError here.
  console.warn("API Key not found via UI-set devApiKey or GOOGLE_API_KEY environment variable. Using placeholder which will likely fail authentication.");
  return "NO_VALID_API_KEY_FOUND";
}

