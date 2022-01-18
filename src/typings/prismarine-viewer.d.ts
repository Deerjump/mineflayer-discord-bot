interface ViewerOptions {
  viewDistance?: number;
  firstPerson?: boolean;
  port?: number;
}

declare module 'prismarine-viewer' {
  export function mineflayer(bot: import('mineflayer').Bot, options: ViewerOptions);
}
