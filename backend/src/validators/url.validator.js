// Regular expression patterns for supported social media platforms
const PLATFORM_PATTERNS = {
  tiktok: /^(https?:\/\/)?(www\.|vm\.|vt\.|v\.)?tiktok\.com\/[a-zA-Z0-9_@.-]+/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|reels|tv|stories|share)\/[a-zA-Z0-9_.-]+/i,
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|shorts\/|embed\/|v\/|live\/|.+\?v=)?([a-zA-Z0-9_-]{11})/i,
  facebook: /^(https?:\/\/)?(www\.|web\.|m\.)?(facebook\.com|fb\.watch|fb\.com)\/.+$/i,
  twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i,
  reddit: /^(https?:\/\/)?(www\.|old\.|v\.)?(reddit\.com|redd\.it)\/.+$/i,
  vimeo: /^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+$/i,
  twitch: /^(https?:\/\/)?(www\.|clips\.)?(twitch\.tv)\/.+$/i,
  dailymotion: /^(https?:\/\/)?(www\.)?(dailymotion\.com|dai\.ly)\/.+$/i,
  bilibili: /^(https?:\/\/)?(www\.|b23\.)?(bilibili\.com|b23\.tv)\/.+$/i
};

// General URL syntax validation
const GENERAL_URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

module.exports = {
  PLATFORM_PATTERNS,
  GENERAL_URL_REGEX
};
