import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "You are logged in and can see this secret message!";
  }),
  getUserRole: protectedProcedure.query(async ({ ctx }) => {
    console.log("sess?", ctx.session)
    const role = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    console.log("role?", role);
    return role?.role;
  }),
});
