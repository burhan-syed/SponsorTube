import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

export const getBotIds = async ({ prisma }: { prisma: PrismaClient }) => {
  const bots = await prisma?.bots.findMany();
  if (!bots) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "No Bots Found",
    });
  }
  return bots.map((b) => b.id);
};
