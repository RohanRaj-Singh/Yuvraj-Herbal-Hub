export const ASSET_BASE_URL =
  import.meta.env.VITE_ASSET_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

export const buildAssetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (!ASSET_BASE_URL) return path.startsWith('/') ? path : `/${path}`;
  return `${ASSET_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
