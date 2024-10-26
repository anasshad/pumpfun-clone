"use client";
import { useReadTokenFactoryGetAllTokens } from "@/src/generated";
import { useAccount } from "wagmi";

export const useAllTokens = () => {
  const { data: tokens, isPending, error } = useReadTokenFactoryGetAllTokens();
  return { tokens, isPending, error };
};
