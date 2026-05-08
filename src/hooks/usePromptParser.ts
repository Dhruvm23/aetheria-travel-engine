import { useEffect } from 'react';
import type { BudgetLevel } from '@/types/itinerary';

interface UsePromptParserProps {
  prompt: string;
  setBudget: (budget: BudgetLevel) => void;
  setInterests: (updater: (prev: string[]) => string[]) => void;
  setGroupSize: (size: number) => void;
}

export function usePromptParser({ prompt, setBudget, setInterests, setGroupSize }: UsePromptParserProps) {
  useEffect(() => {
    if (!prompt) return;

    const lower = prompt.toLowerCase();

    // --- Budget Parsing ---
    if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) {
      setBudget('budget');
    } else if (lower.includes('luxury') || lower.includes('expensive') || lower.includes('premium')) {
      setBudget('luxury');
    } else if (lower.includes('moderate') || lower.includes('mid-range') || lower.includes('standard')) {
      setBudget('moderate');
    }

    // --- Group Size Parsing ---
    const groupMatch = lower.match(/(?:for\s+)?(\d+)\s+(?:people|persons|travelers|friends|of us)/);
    if (groupMatch && groupMatch[1]) {
      const num = parseInt(groupMatch[1], 10);
      if (num > 0 && num <= 20) setGroupSize(num);
    } else if (lower.includes('solo') || lower.includes('just me') || lower.includes('alone')) {
      setGroupSize(1);
    } else if (lower.includes('couple') || lower.includes('two of us')) {
      setGroupSize(2);
    }

    // --- Interests Parsing ---
    const toggleInterest = (id: string, shouldHave: boolean) => {
      setInterests((prev) => {
        if (shouldHave && !prev.includes(id)) return [...prev, id];
        return prev;
      });
    };

    toggleInterest('history', /history|historical|ruins|ancient/i.test(lower));
    toggleInterest('art', /art|museums|gallery/i.test(lower));
    toggleInterest('food', /food|cuisine|eat|dining|restaurant|culinary/i.test(lower));
    toggleInterest('nature', /nature|parks|outdoors|hike|scenic/i.test(lower));
    toggleInterest('adventure', /adventure|thrill|active/i.test(lower));
    toggleInterest('shopping', /shopping|mall|boutique|market/i.test(lower));
    toggleInterest('nightlife', /nightlife|club|bar|party/i.test(lower));
    toggleInterest('wellness', /wellness|spa|relax|massage/i.test(lower));
    
  }, [prompt, setBudget, setInterests, setGroupSize]);
}
