import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#0F172A]/8 dark:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

export function WizardFormSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar skeleton */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-[#0F172A]/8 lg:flex">
        <div className="border-b border-[#0F172A]/8 p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
        <div className="flex-1 space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
        <div className="border-t border-[#0F172A]/8 p-4">
          <Skeleton className="h-1.5 w-full" />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-[#0F172A]/8 px-4 py-3 lg:hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-2 w-full" />
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="glass-card mx-auto max-w-3xl rounded-xl p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-10 sm:col-span-2" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>

        <div className="border-t border-[#0F172A]/8 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
