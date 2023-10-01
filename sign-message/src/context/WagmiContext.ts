import constate from "constate";
import { configureChains, createConfig } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { polygonMumbai } from '@wagmi/core/chains'

const [WagmiContextProvider, useWagmiContext] = constate(() => {
  const { chains, publicClient } = configureChains(
    [polygonMumbai],
    [
      jsonRpcProvider({
        rpc: () => ({
          http: "https://rpc-mumbai.maticvigil.com" 
        }),
      })
    ]
  );

  const wagmiConfig = createConfig({
    autoConnect: true,
    publicClient,
    connectors: [
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      })
    ]
  });

  return {
    chains,
    wagmiConfig,
    publicClient
  };
});

export { WagmiContextProvider, useWagmiContext };