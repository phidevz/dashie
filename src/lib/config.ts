import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type * as LucideIcons from "lucide-react";
import { parse } from "yaml";
import { env } from "~/env";

export type LucideIcon = Exclude<
	keyof typeof LucideIcons,
	| "LucideIcon"
	| "SVGElementType"
	| "IconNode"
	| "SVGAttributes"
	| "ElementAttributes"
	| "LucideProps"
>;

export interface ServiceItem {
	name: string;
	description?: string;
	url: string;
	icon: LucideIcon;
	roles: string[];
}

export interface ServiceCategory {
	category: string;
	items: ServiceItem[];
}

export interface HeaderConfig {
	user: string;
	email: string;
	name: string;
	groups: string;
}

export interface Config {
	headers: HeaderConfig;
	services: ServiceCategory[];
}

let cachedConfig: Config | null = null;

export function getConfig(): Config {
	if (cachedConfig) {
		//return cachedConfig
	}

	let configPath: string;
	if (env.CONFIG_FILE !== undefined) {
		if (isAbsolute(env.CONFIG_FILE)) {
			configPath = env.CONFIG_FILE;
		} else {
			configPath = join(process.cwd(), env.CONFIG_FILE);
		}
	} else {
		configPath = join(process.cwd(), "config", "services.yaml");
	}

	const fileContents = readFileSync(configPath, "utf8");
	cachedConfig = parse(fileContents) as Config;

	return cachedConfig;
}

export function filterServicesByRoles(
	services: ServiceCategory[],
	userRoles: string[],
): ServiceCategory[] {
	return services
		.map((category) => ({
			...category,
			items: category.items.filter((service) => {
				const allAccess = service.roles.includes("*");
				const negateRoles = service.roles
					.filter((it) => it.startsWith("!"))
					.map((it) => it.substring(1));
				const permitRoles = service.roles.filter(
					(it) => it !== "*" && !it.startsWith("!"),
				);
				if (allAccess) {
					return !(
						negateRoles.length > 0 &&
						userRoles.some((it) => negateRoles.includes(it))
					);
				}

				return userRoles.some((it) => permitRoles.includes(it));
			}),
		}))
		.filter((category) => category.items.length > 0);
}
