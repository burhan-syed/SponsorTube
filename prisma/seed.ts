import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const Bots = [
    {
      id: "_openaicurie1",
      name: "OpenAI Curie 1",
      model: "text-curie-001",
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      id: "_openaigpt3.5turbo",
      name: "OpenAI GPT 3.5 Turbo",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
  ];

  const botsUpsert = await prisma.$transaction(
    Bots.map((bot) => [
      prisma.user.upsert({
        where: { id: bot.id },
        update: { name: bot.name },
        create: { id: bot.id, name: bot.name },
      }),
      prisma.bots.upsert({
        where: {
          id: bot.id,
        },
        update: {
          model: bot.model,
          temperature: bot.temperature,
          maxTokens: bot.max_tokens,
          topP: bot.top_p,
          frequencyPenalty: bot.frequency_penalty,
          presencePenalty: bot.presence_penalty,
        },
        create: {
          id: bot.id,
          model: bot.model,
          temperature: bot.temperature,
          maxTokens: bot.max_tokens,
          topP: bot.top_p,
          frequencyPenalty: bot.frequency_penalty,
          presencePenalty: bot.presence_penalty,
        },
      }),
    ]).flat()
  );
  console.log("Seed?", botsUpsert);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
