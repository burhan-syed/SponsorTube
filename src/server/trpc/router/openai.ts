import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { OpenAIApi, Configuration } from "openai";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

export const openAIRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getSegmentAnnotations: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = new OpenAIApi(configuration);
      const prompt = `Create a table to identify sponsor information if there is any in the following text:\n\"${input.text}"\n\nSponsor|Product|URL|Offer|\n\n`;
      const response = await openai.createCompletion({
        model: "text-curie-001",
        prompt: prompt,
        temperature: 0,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log("response?", JSON.stringify(response.data));
      const parsed = (response.data.choices?.[0]?.text?.split("\n") ?? [])
        .filter((p) => p)
        .map((p) => {
          const data = {
            sponsor: "",
            product: "",
            url: "",
            offer: "",
          };
          p.split("|").forEach((t, i) => {
            switch (i) {
              case 0:
                data.sponsor = t;
                break;
              case 1:
                data.product = t;
                break;
              case 2:
                data.url = t;
                break;
              case 3:
                data.offer = t;
                break;
            }
          });
          return data;
        });
      console.log('parsed?', parsed)
      return;
    }),
});
