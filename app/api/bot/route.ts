export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { Bot, InlineKeyboard } from "grammy";
import { ethers } from "ethers"; // Web3 for wallet creation

import connectDB from "../../lib/mongodb";
import Feedback from "../../lib/models/Feedback";

// Load Bot Token
const token = "7993400849:AAHfsxl8nuf2sQdXKyEWd6YJFv9jWVkYf10";
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing. Check your .env.local file.");

const bot = new Bot(token);

// ✅ Initialize the bot
await bot.init();

// 🎉 Start Command
bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("🆕 Create Wallet", "create_wallet")
    .text("🔗 Connect Wallet", "connect_wallet");

  await ctx.reply(
    `🚀 *Welcome to the Crypto Wallet Bot!*  
Here you can create and connect your crypto wallet easily.  

🔹 *Create Wallet* → Generate a new wallet securely.  
🔹 *Connect Wallet* → Link your existing wallet for transactions.  

👇 Choose an option below:`, 
    { parse_mode: "Markdown", reply_markup: keyboard }
  );
});

// 🎉 Create Wallet (Ethereum Example)
bot.callbackQuery("create_wallet", async (ctx) => {
  const wallet = ethers.Wallet.createRandom();
  await ctx.reply(
    `🆕 *Wallet Created Successfully!*  
🔑 *Private Key:* \`${wallet.privateKey}\`  
📩 *Address:* \`${wallet.address}\`  

⚠️ *Important:* Keep your private key secure and do not share it!`, 
    { parse_mode: "Markdown" }
  );
});

// 🔗 Connect Wallet - Ask for Address
bot.callbackQuery("connect_wallet", async (ctx) => {
  await ctx.reply("🔗 *Please enter your wallet address (Ethereum or Solana).*", { parse_mode: "Markdown" });
});

// 📩 Handle User Wallet Input
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  if (/^(0x|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(text)) {
    // Valid Ethereum (0x...) or Solana (Base58) address
     await ctx.reply(`✅ *Wallet Connected Successfully!*  
📩 *Your Address:* \`${text}\``, { parse_mode: "Markdown" });
    return;

  }

  await ctx.reply("⚠️ *Invalid address! Please enter a correct Ethereum or Solana wallet address.*", { parse_mode: "Markdown" });
});

// // Handling user input
// bot.on("message:text", async (ctx) => {
//   console.log("🔹 Received message:", ctx.message.text);

//   await connectDB().then(() => console.log("✅ MongoDB connected")).catch(err => console.error("❌ MongoDB Error:", err));

//   const chatId = ctx.chat.id;
//   const text = ctx.message.text.trim();
//   const rating = Number(text);

//   if (!isNaN(rating) && rating >= 0 && rating <= 10) {
//     await Feedback.create({ userId: chatId, rating });
//     ctx.reply("Thanks! Your feedback has been recorded.");
//   } else {
//     ctx.reply("Please enter a valid number between 0 and 10.");
//   }
// });

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
