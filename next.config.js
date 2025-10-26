/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	images: {
		unoptimized: true,
	},
	allowedDevOrigins: [
		"http://10.18.245.132:3000",
		"http://tw10.vpn.internal:3000",
		"10.18.245.132",
		"tw10.vpn.internal",
	],
};

export default config;
