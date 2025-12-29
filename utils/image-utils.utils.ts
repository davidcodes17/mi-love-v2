export const generateURL = ({ url }: { url: string }) => {
  const url_ = `${
    process.env.EXPO_PUBLIC_API_URL ||
    "https://mi-love-api-production.up.railway.app"
  }/${url}`;
  return url_;
};