import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [],
  plugins: [
    react(),
    foundry({
      project: "../",
      deployments: {
        TokenFactory: {
          31337: "0xCd9BC6cE45194398d12e27e1333D5e1d783104dD",
        },
      },
    }),
  ],
});
