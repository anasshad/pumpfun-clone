"use client";
import {
  useReadTokenFactoryGetUserTokens,
  useReadTokenFactoryGetAllTokens,
} from "@/src/generated";
import { useAccount } from "wagmi";

export const useMyTokens = () => {
  const { address } = useAccount();
  const { data, error, isPending } = useReadTokenFactoryGetUserTokens({
    args: [address!],
    query: {
      enabled: address !== undefined,
    },
  });
  const tokens = useReadTokenFactoryGetAllTokens();
  console.log("Hello", data, error, tokens);
  return { data };
};
