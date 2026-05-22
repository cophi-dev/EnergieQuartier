"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadPdfReport } from "@/app/lib/pdf-report";
import { buildAdvisorContext } from "@/app/lib/llm/context";
import { fetchAdvisorText } from "@/app/lib/llm/fetch-advisor-text";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";

interface PdfExportButtonProps {
  project: ProjectData;
  result: CalculationResult;
  disabled?: boolean;
  disabledReason?: string;
  onBeforeExport?: () => void;
}

export function PdfExportButton({
  project,
  result,
  disabled = false,
  disabledReason = "Bitte zuerst ein Projekt im Wizard anlegen",
  onBeforeExport,
}: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      onBeforeExport?.();
      const context = buildAdvisorContext(project, result);
      const { text: executiveSummary } = await fetchAdvisorText(
        "report-executive-summary",
        context,
      );
      await downloadPdfReport(project, result, { executiveSummary });
    } finally {
      setLoading(false);
    }
  };

  const button = (
    <Button
      variant="outline"
      className="border-[#0F172A]/15 text-[#0F172A] hover:bg-[#06B6D4]/10 dark:text-white"
      disabled={disabled || loading}
      onClick={() => void handleExport()}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      PDF-Beratungsreport
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex">{button}</span>} />
        <TooltipContent>{disabledReason}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
