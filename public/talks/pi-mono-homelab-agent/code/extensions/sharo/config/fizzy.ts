import { env, curl } from "./index.js";

const headers = () => ({
  Authorization: `Bearer ${env.fizzy.token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

const api = (path: string) => `${env.fizzy.url}/${env.fizzy.prefix}${path}`;

export function createCard(title: string, column?: string): { number: number } {
  const columnId = column ? env.fizzy.columns[column] : undefined;
  return JSON.parse(curl("POST", api(`/boards/${env.fizzy.board}/cards.json`),
    JSON.stringify({ card: { title, board_column_id: columnId } }), headers()));
}

export function moveCard(cardNumber: number, column: string) {
  const columnId = env.fizzy.columns[column];
  curl("POST", api(`/cards/${cardNumber}/triage.json`),
    JSON.stringify({ column_id: columnId }), headers());
}

export function addComment(cardNumber: number, body: string) {
  curl("POST", api(`/cards/${cardNumber}/comments.json`),
    JSON.stringify({ comment: { body } }), headers());
}
