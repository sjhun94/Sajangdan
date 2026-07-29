import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sajangdan.app",
  appName: "사장단",
  webDir: "public",
  server: {
    url: "https://worktalk-one.vercel.app",
    cleartext: false,
  },
};

export default config;
