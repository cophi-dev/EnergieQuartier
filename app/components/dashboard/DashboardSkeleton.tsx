"use client";

import { Skeleton } from "@/app/components/wizard/WizardFormSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col xl:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-[#0F172A]/8 p-4 xl:block">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-2 h-6 w-full" />
        <Skeleton className="mt-4 h-20 w-full" />
        <Skeleton className="mt-3 h-20 w-full" />
      </aside>
      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 space-y-6 p-4 sm:p-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
        <aside className="hidden w-72 shrink-0 border-l border-[#0F172A]/8 p-4 xl:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-24 w-full rounded-xl" />
          ))}
        </aside>
      </div>
    </div>
  );
}
