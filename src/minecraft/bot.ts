import mineflayer from 'mineflayer';
import { options } from './config';

export async function getMinecraftBot() {
  const bot = mineflayer.createBot(options);
  
  bot.on('end', (reason) => {
    console.log(reason);
  })
  
  bot.on('error', (error) => {
    console.log(error)
  })
  
  bot.on('login', () => {
    console.log('logged in!');
  })


  return bot;
}
