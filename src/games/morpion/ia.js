import { iaPrompt, iaParams } from "./iaConfig";
import { generateMistral } from "../../services/mistralService";

export async function getIaMove(boardState) {
  const prompt = `${iaPrompt}\nÉtat du plateau : ${JSON.stringify(boardState)}`;
  return await generateMistral(prompt, iaParams);
}
