import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  // Matrix
  MATRIX_HOMESERVER: z.string().url().default("https://matrix.org"),
  MATRIX_TOKEN: z.string().min(1, "MATRIX_TOKEN is required"),
  MATRIX_ROOM_ID: z.string().min(1, "MATRIX_ROOM_ID is required"),
  MATRIX_OWNER_ID: z.string().default("@georgialexandrov:matrix.org"),

  // Web bridge
  WEB_BRIDGE_PORT: z.coerce.number().default(8090),

  // Fizzy
  FIZZY_URL: z.string().url().optional(),
  FIZZY_TOKEN: z.string().optional(),
  FIZZY_BOARD_ID: z.string().optional(),
  FIZZY_ACCOUNT_PREFIX: z.string().optional(),
  FIZZY_COL_NEW: z.string().optional(),
  FIZZY_COL_DIAGNOSING: z.string().optional(),
  FIZZY_COL_AWAITING: z.string().optional(),
  FIZZY_COL_RESOLVED: z.string().optional(),

  // AI
  QWEN_URL: z.string().url().optional(),
  LITELLM_MASTER_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
