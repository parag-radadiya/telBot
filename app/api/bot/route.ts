export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { Bot } from "grammy";
import connectDB from "../../lib/mongodb";
import Feedback from "../../lib/models/Feedback";

// Load Bot Token
const token = "7993400849:AAHfsxl8nuf2sQdXKyEWd6YJFv9jWVkYf10";
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing. Check your .env.local file.");

const bot = new Bot(token);

// ✅ Initialize the bot
await bot.init();

// Command: /start
bot.command("start", (ctx) => ctx.reply("Hi! How was your day from 0 to 10?"));

// Handling user input
bot.on("message:text", async (ctx) => {
  console.log("🔹 Received message:", ctx.message.text);

  await connectDB().then(() => console.log("✅ MongoDB connected")).catch(err => console.error("❌ MongoDB Error:", err));

  const chatId = ctx.chat.id;
  const text = ctx.message.text.trim();
  const rating = Number(text);

  if (!isNaN(rating) && rating >= 0 && rating <= 10) {
    await Feedback.create({ userId: chatId, rating });
    ctx.reply("Thanks! Your feedback has been recorded.");
  } else {
    ctx.reply("Please enter a valid number between 0 and 10.");
  }
});

// Handle Telegram webhook
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔹 Incoming update:", JSON.stringify(body, null, 2));

    await bot.handleUpdate(body);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error handling update:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
