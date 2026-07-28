import packageJson from "../package.json";

export const siteVersion = packageJson.version;

export const buildInfo = {
  version: packageJson.version,
  next: packageJson.dependencies.next.replace(/^[\^~]/, ""),
  react: packageJson.dependencies.react.replace(/^[\^~]/, ""),
  reactDom: packageJson.dependencies["react-dom"].replace(/^[\^~]/, ""),
} as const;
