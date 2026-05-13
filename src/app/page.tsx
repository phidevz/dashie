import { headers } from "next/headers";
import { ServiceCard } from "~/components/service-card";
import { ThemeToggle } from "~/components/theme-toggle";
import { env } from "~/env";
import { filterServicesByRoles, getConfig } from "~/lib/config";

export default async function DashboardPage() {
  const config = getConfig();

  const headersList = await headers();

  const { remoteUser, remoteName, remoteGroups, remoteEmail } =
    config.parseHeaders(headersList);

  const roles = remoteGroups?.split(",") ?? [];

  const filteredServices = filterServicesByRoles(config.services, roles);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky border-border border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-lg text-primary-foreground">
                  C
                </span>
              </div>
              <h1 className="font-semibold text-foreground text-xl">
                {env.NEXT_PUBLIC_HEADING}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-balance font-bold text-3xl text-foreground">
            Welcome back, {remoteName}
          </h2>
          <div className="mt-4 text-muted-foreground">
            Logged in as: <span className="font-mono">{remoteUser}</span> (
            {remoteEmail})
          </div>
          <div className="mt-4 flex flex-row gap-4">
            <span className="text-muted-foreground">Your roles: </span>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {filteredServices.map((category) => (
            <section key={category.category}>
              <h3 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((service) => (
                  <ServiceCard key={service.name} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* No Services Message */}
        {filteredServices.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No services available for your current roles.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
