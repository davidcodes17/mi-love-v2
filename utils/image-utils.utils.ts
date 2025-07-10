export const generateURL = ({ url }: { url: string }) => {
  const url_ = `${process.env.EXPO_PUBLIC_HOST}/${url}`;
  return url_;
};
