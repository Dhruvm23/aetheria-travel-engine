// Aetheria Dashboard — Server Component shell
// The SplitScreen client component is imported here and handles all interactivity.

import { SplitScreen } from '@/components/dashboard/SplitScreen';

export default function Home() {
  return (
    <main
      className="flex flex-col flex-1"
      aria-label="Aetheria — AI Travel Planning Dashboard"
    >
      <SplitScreen />
    </main>
  );
}
