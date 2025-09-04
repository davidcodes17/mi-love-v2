export const generateURL = ({ url }: { url: string }) => {
  const url_ = `${"https://mi-love-api-production.up.railway.app"}/${url}`;
  return url_;
};
