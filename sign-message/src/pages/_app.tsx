import type { AppProps } from 'next/app';
import { WagmiContextProvider } from '@/context/WagmiContext';
import Layout from '@/components/Layout';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <WagmiContextProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </WagmiContextProvider>
    );
}
