export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
import connectDB from "../../lib/mongodb";
import { Bot, webhookCallback } from 'grammy'
import Feedback from "../../lib/models/Feedback";
import { NextResponse } from "next/server";

// 7993400849:AAHfsxl8nuf2sQdXKyEWd6YJFv9jWVkYf10
// const token = process.env.TELEGRAM_BOT_TOKEN

const token = '7993400849:AAHfsxl8nuf2sQdXKyEWd6YJFv9jWVkYf10'

if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable not found.')

const bot = new Bot(token)

bot.command("start", (ctx) => ctx.reply("Hi! How was your day from 0 to 10?"));

bot.on('message:text', async (ctx) => {

  console.log('ctx.message.text ==== ', ctx);
  console.log('ctx.message.text ==== ', ctx.message);
  
  await connectDB();

  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  console.log('ctx.message.text text ==== ', text);
  console.log('ctx.message.text chatId ==== ', chatId );

  if (!Number.isNaN(text) && Number(text) >= 0 && Number(text) <= 10) {
    await Feedback.create({ userId: chatId, rating: Number(text) });
    ctx.reply("Thanks! Your feedback has been recorded.");
  } else {
    ctx.reply("Please enter a valid number between 0 and 10.");
  }

//   await ctx.reply(ctx.message.text)
})

// export const POST = webhookCallback(bot, 'std/http')
export async function POST(req: any) {
  const body = await req.json();
  return webhookCallback(bot, "next")(req, body);
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
