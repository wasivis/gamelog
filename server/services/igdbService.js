import axios from "axios";

let accessToken = null;

const toCoverUrl = (cover) => {
  if (!cover?.url) return null;

  const normalized = cover.url.replace("t_thumb", "t_cover_small");
  return normalized.startsWith("http") ? normalized : `https:${normalized}`;
};

const getAccessToken = async () => {
  const response = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    }
  );

  accessToken = response.data.access_token;
};

export const searchGamesIGDB = async (query) => {
  if (!accessToken) {
    await getAccessToken();
  }

  const response = await axios.post(
    "https://api.igdb.com/v4/games",
    `search "${query}";
     fields name,cover.url;
     limit 10;`,
    {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const results = response.data.map((game) => ({
    id: game.id,
    name: game.name,
    coverUrl: toCoverUrl(game.cover),
  }));

  const q = query.trim().toLowerCase();
  results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aExact = aName === q;
    const bExact = bName === q;
    if (aExact !== bExact) return aExact ? -1 : 1;
    const aStarts = aName.startsWith(q);
    const bStarts = bName.startsWith(q);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return results;
};