"use client";
import { useMyTokens } from "@/hooks/useMyTokens";

export default function MyTokenPage() {
  const { data } = useMyTokens();
  return (
    <div>
      <h1>My Tokens</h1>
    </div>
  );
}
