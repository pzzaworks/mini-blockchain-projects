import { WagmiConfig } from 'wagmi';
import { useWagmiContext } from '@/context/WagmiContext';

export default function Layout({ children, }: { children: React.ReactNode }) {
  const { wagmiConfig } = useWagmiContext();
  
  return (
    <WagmiConfig config={wagmiConfig}>
        <main className="min-h-screen bg-background flex flex-col items-center">
          {children}
        </main>
    </WagmiConfig>
  )
}
