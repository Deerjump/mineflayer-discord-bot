import { EventHandler } from '@customTypes';

export function wait(milliseconds: number) {
  return new Promise((resolve) => {
    console.log(`Waiting ${milliseconds} milliseconds...`);
    setTimeout(resolve, milliseconds);
  });
}

export function extractRole(string: string) {
  // Just the text between the first set of square brackets
  const regex = /\[(.*?)\]/;
  return string.match(regex)?.[1];
}

export function extractTime(string: string) {
  const regex = /(\d+)\:(\d+)\.(\d+)/;
  const [, minutes, seconds, milliseconds] = string.match(regex) ?? [];
  return [minutes, seconds, milliseconds].map(str => Number.parseInt(str));
}

export function createEventHandler<T>() {
  return <K extends keyof T>(handler: EventHandler<T, K>) => handler;
}
