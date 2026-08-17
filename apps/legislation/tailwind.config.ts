import baseConfig from "../../packages/config/tailwind.config";

const config = {
  ...baseConfig,
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
};

export default config;
