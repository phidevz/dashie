import { ExternalLink } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import type { ServiceItem } from "~/lib/config";

interface ServiceCardProps {
  service: ServiceItem;
}

export async function ServiceCard({ service }: ServiceCardProps) {
  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <DynamicIcon
            name={service.icon ?? "box"}
            className="h-6 w-6 text-foreground"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-balance font-semibold text-foreground transition-colors group-hover:text-primary">
            {service.name}
          </h4>
          <p className="mt-1 text-pretty text-muted-foreground text-sm">
            {service.description}
          </p>
        </div>
        <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </a>
  );
}
