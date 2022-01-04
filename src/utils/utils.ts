export async function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function extractRole(string: string) {
  // Just the text between the first set a square brackets
  const regex = /\[(.*?)\]/;
  return string.match(regex)?.[1];
}
