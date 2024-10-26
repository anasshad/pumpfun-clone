"use client";
import { useAllTokens } from "@/hooks/useAllTokens";
import TokenCard from "@/components/TokenCard";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function Home() {
  const { tokens, isPending, error } = useAllTokens();

  console.log(tokens);

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <div className="text-center p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tokens &&
          tokens.map((token, index) => (
            <TokenCard
              key={index}
              imageSrc={token.imageUrl}
              name={token.name}
              ticker={token.ticker}
              description={token.description}
              contract_address={token.tokenAddress}
            />
          ))}
      </div>
    </div>
  );
}
