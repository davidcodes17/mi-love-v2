export const generateURL = ({ url }: { url: string }) => {
  const url_ = `${
    process.env.EXPO_PUBLIC_API_URL ||
    "https://3v3gcz8b-9999.uks1.devtunnels.ms"
  }/${url}`;
  return url_;
};