import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		CONFIG_FILE: z.string().optional(),
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
		NEXT_PUBLIC_HEADING: process.env.NEXT_PUBLIC_HEADING,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
