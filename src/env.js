import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CONFIG_FILE: z.string().optional(),
    CACHE_CONFIG: z
      .enum(["0", "1", "true", "false", "yes", "no"])
      .optional()
      .default("true")
      .transform((it) => it === "1" || it === "true" || it === "yes"),
    ALLOWED_DEV_ORIGINS: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_HEADING: z
      .string()
      .min(1)
      .optional()
      .default("Example Company Portal"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CONFIG_FILE: process.env.CONFIG_FILE,
    CACHE_CONFIG: process.env.CACHE_CONFIG,
    NEXT_PUBLIC_HEADING: process.env.NEXT_PUBLIC_HEADING,
    ALLOWED_DEV_ORIGINS: process.env.ALLOWED_DEV_ORIGINS,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
