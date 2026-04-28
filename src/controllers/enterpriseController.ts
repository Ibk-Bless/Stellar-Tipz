import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { processBulkTransfer } from "../services/enterpriseService";

function getUploadedFile(
  req: Request,
):
  | { buffer: Buffer; originalname?: string; mimetype?: string; size?: number }
  | undefined {
  const anyReq = req as Request & {
    file?: {
      buffer?: Buffer;
      originalname?: string;
      mimetype?: string;
      size?: number;
    };
    files?: Array<{
      buffer?: Buffer;
      originalname?: string;
      mimetype?: string;
      size?: number;
    }>;
  };

  const file = anyReq.file ?? anyReq.files?.[0];
  if (!file?.buffer) {
    return undefined;
  }

  return file as { buffer: Buffer; originalname?: string; mimetype?: string; size?: number };
}

function isCsvUpload(file: {
  originalname?: string;
  mimetype?: string;
}): boolean {
  const name = file.originalname?.toLowerCase() ?? "";
  const mimetype = file.mimetype?.toLowerCase() ?? "";
  const hasCsvExtension = name.endsWith(".csv");
  return (
    mimetype.includes("text/csv") ||
    mimetype.includes("application/csv") ||
    mimetype.includes("application/vnd.ms-excel") ||
    (mimetype.includes("text/plain") && hasCsvExtension) ||
    hasCsvExtension
  );
}

/**
 * POST /enterprise/bulk-transfer
 * Process a bulk CSV transfer upload for an enterprise organization.
 */
export async function postBulkTransfer(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const organizationId = req.apiKey?.organizationId;
    if (!organizationId) {
      throw new AppError("Organization-scoped API key required", 401);
    }

    const file = getUploadedFile(req);
    if (!file?.buffer) {
      throw new AppError("CSV upload is required", 400);
    }
    if (!isCsvUpload(file)) {
      throw new AppError("Only CSV uploads are supported", 400);
    }

    const result = await processBulkTransfer({
      organizationId,
      senderUserId: req.apiKey?.userId ?? undefined,
      fileContent: file.buffer,
      fileName: file.originalname,
    });

    res.status(200).json({
      job_id: result.jobId,
      total_rows: result.totalRows,
      success_count: result.successCount,
      failure_count: result.failureCount,
      skipped_count: result.skippedCount,
      status: result.status,
      created_at: result.createdAt,
      completed_at: result.completedAt ?? null,
      failure_report: result.failureReport,
    });
    return;

  } catch (e) {
    if (e instanceof AppError) {
      return next(e);
    }
    next(e);
  }
}

/**
 * GET /enterprise/treasury
 * Returns a stub treasury response until treasury aggregation is implemented.
 */
export async function getTreasury(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.status(200).json({
      totalBalanceUsd: treasury.totalBalanceUsd,
      totalReserveAmount: treasury.totalReserveAmount,
      summary: treasury.summary,
      byCurrency: treasury.byCurrency.map((item) => ({
        currency: item.currency,
        targetWeight: item.targetWeight,
        reserveAmount: item.combined.reserveAmount,
        reserveValueUsd: item.combined.reserveValueUsd,
        segments: {
          transactions: {
            amount: item.transactions.reserveAmount,
            valueUsd: item.transactions.reserveValueUsd,
            fxRate: item.transactions.fxRate,
            fxRateTimestamp: item.transactions.fxRateTimestamp,
            fxRateSource: item.transactions.fxRateSource,
          },
          investmentSavings: {
            amount: item.investmentSavings.reserveAmount,
            valueUsd: item.investmentSavings.reserveValueUsd,
            fxRate: item.investmentSavings.fxRate,
            fxRateTimestamp: item.investmentSavings.fxRateTimestamp,
            fxRateSource: item.investmentSavings.fxRateSource,
          },
        },
      })),
      reconciliation: {
        ledgerTotal: treasury.reconciliation.ledgerTotal,
        calculatedTotal: treasury.reconciliation.calculatedTotal,
        discrepancy: treasury.reconciliation.discrepancy,
        discrepancyPercentage: treasury.reconciliation.discrepancyPercentage,
        isReconciled: treasury.reconciliation.isReconciled,
        tolerancePercentage: treasury.reconciliation.tolerancePercentage,
        warnings: treasury.reconciliation.warnings,
      },
      message: treasury.message,
    });
  } catch (e) {
    next(e);
  }
}
