import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type { IconName } from "lucide-react/dynamic";
import type { headers } from "next/headers";
import { parse } from "yaml";
import { env } from "~/env";

type ReadonlyHeaders = Awaited<ReturnType<typeof headers>>;

export interface ServiceItem {
  name: string;
  description?: string;
  url: string;
  icon: IconName;
  roles: string[];
}

export interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

export interface HeaderConfig {
  _parseAs?: "utf8" | "utf16le" | "uri-component";
  user: string;
  email: string;
  name: string;
  groups: string;
}

export class Config {
  public readonly headers: HeaderConfig;
  public readonly services: ServiceCategory[];

  constructor(headers: HeaderConfig, services: ServiceCategory[]) {
    this.headers = headers;
    this.services = services;
  }

  parseHeaders(headersList: ReadonlyHeaders) {
    let remoteUser = headersList.get(this.headers.user);
    let remoteName = headersList.get(this.headers.name);
    let remoteGroups = headersList.get(this.headers.groups);
    let remoteEmail = headersList.get(this.headers.email);

    if (this.headers._parseAs === "uri-component") {
      remoteUser = remoteUser === null ? null : decodeURIComponent(remoteUser);
      remoteName = remoteName === null ? null : decodeURIComponent(remoteName);
      remoteGroups =
        remoteGroups === null ? null : decodeURIComponent(remoteGroups);
      remoteEmail =
        remoteEmail === null ? null : decodeURIComponent(remoteEmail);
    } else if (this.headers._parseAs) {
      remoteUser =
        remoteUser === null
          ? null
          : Buffer.from(remoteUser, "latin1").toString(this.headers._parseAs);
      remoteName =
        remoteName === null
          ? null
          : Buffer.from(remoteName, "latin1").toString(this.headers._parseAs);
      remoteGroups =
        remoteGroups === null
          ? null
          : Buffer.from(remoteGroups, "latin1").toString(this.headers._parseAs);
      remoteEmail =
        remoteEmail === null
          ? null
          : Buffer.from(remoteEmail, "latin1").toString(this.headers._parseAs);
    }

    return { remoteUser, remoteName, remoteGroups, remoteEmail };
  }
}

let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (env.CACHE_CONFIG && cachedConfig) {
    return cachedConfig;
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
  const parsed = parse(fileContents);

  cachedConfig = new Config(parsed.headers, parsed.services);

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
