const { prompt, logMessage, rl } = require("./utils/logger");
const StreamAiAutoReff = require("./classes/StreamAiAutoReff");
const { generateRandomPassword } = require("./utils/generator");
const { getRandomProxy, loadProxies } = require("./classes/proxy");
const chalk = require("chalk");
const fs = require("fs");

async function main() {
  console.log(
    chalk.cyan(`
░█▀▀░▀█▀░█▀▄░█▀▀░█▀█░█▄█░░░█▀█░▀█▀░░░█▀▄░█▀▀░█▀▀░█▀▀
░▀▀█░░█░░█▀▄░█▀▀░█▀█░█░█░░░█▀█░░█░░░░█▀▄░█▀▀░█▀▀░█▀▀
░▀▀▀░░▀░░▀░▀░▀▀▀░▀░▀░▀░▀░░░▀░▀░▀▀▀░░░▀░▀░▀▀▀░▀░░░▀░░
                By : El Puqus Airdrop
                github.com/ahlulmukh
  `)
  );

  const refCode = await prompt(chalk.yellow("Enter Referral Code: "));
  const count = parseInt(await prompt(chalk.yellow("How many do you want?")));

  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    console.log(chalk.yellow("No proxies available. Using default IP."));
  }
  let successful = 0;

  const accountsStream = fs.createWriteStream("accounts.txt", { flags: "a" });
  const accountsBot = fs.createWriteStream("accountsBot.txt", { flags: "a" });

  for (let i = 0; i < count; i++) {
    console.log(chalk.white("-".repeat(85)));
    logMessage(i + 1, count, "Process", "debug");

    const currentProxy = await getRandomProxy();
    const generator = new StreamAiAutoReff(refCode, currentProxy);

    try {
      const email = generator.generateTempEmail();
      const password = generateRandomPassword();
      const emailSent = await generator.sendEmailCode(email);
      if (!emailSent) continue;

      const account = await generator.registerAccount(email, password);

      if (account) {
        accountsStream.write(`Email: ${email}\n`);
        accountsStream.write(`Password: ${password}\n`);
        accountsStream.write(`Reff To: ${refCode}\n`);
        accountsStream.write("-".repeat(85) + "\n");
        accountsBot.write(`${email}:${password}\n`);

        successful++;
        logMessage(i + 1, count, "Akun Berhasil Dibuat!", "success");
        logMessage(i + 1, count, `Email: ${email}`, "success");
        logMessage(i + 1, count, `Password: ${password}`, "success");
        logMessage(i + 1, count, `Reff To: ${refCode}`, "success");
      } else {
        logMessage(i + 1, count, "Gagal Membuat Akun", "error");
        if (generator.proxy) {
          logMessage(i + 1, count, `Failed proxy: ${generator.proxy}`, "error");
        }
      }
    } catch (error) {
      logMessage(i + 1, count, `Error: ${error.message}`, "error");
    }
  }

  accountsStream.end();
  accountsBot.end();

  console.log(chalk.magenta("\n[*] Selesai!"));
  console.log(
    chalk.green(
      `[*] Akun yang berhasil dibuat ${successful} dari ${count} akun`
    )
  );
  console.log(
    chalk.magenta("[*] Hasil disimpan di accounts.txt dan accountsBot.txt")
  );
  rl.close();
}

module.exports = { main };
