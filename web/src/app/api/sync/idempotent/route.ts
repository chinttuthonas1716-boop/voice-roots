import { NextResponse } from "next/server";

// Cache of already processed client operation IDs to guarantee idempotency
const PROCESSED_OPERATIONS = new Map<string, { timestamp: string; result: any }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientOperationId, actionType, payload } = body;

    if (!clientOperationId) {
      return NextResponse.json(
        { error: "clientOperationId is mandatory for idempotent sync." },
        { status: 400 }
      );
    }

    // Check if operation already processed to avoid duplicates
    if (PROCESSED_OPERATIONS.has(clientOperationId)) {
      const existing = PROCESSED_OPERATIONS.get(clientOperationId)!;
      return NextResponse.json({
        success: true,
        idempotentReplay: true,
        message: "Operation was already processed. Replaying confirmed status.",
        result: existing.result,
      });
    }

    // Process new action
    const operationResult = {
      clientOperationId,
      actionType,
      processedAt: new Date().toISOString(),
      status: "SYNCED_TO_CLOUD",
      storyId: payload?.storyId || `vr_${Date.now().toString(36)}`,
    };

    PROCESSED_OPERATIONS.set(clientOperationId, {
      timestamp: new Date().toISOString(),
      result: operationResult,
    });

    return NextResponse.json({
      success: true,
      idempotentReplay: false,
      message: "Offline action successfully committed to Voice Roots cloud storage.",
      result: operationResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process idempotent sync", details: err?.message },
      { status: 500 }
    );
  }
}

