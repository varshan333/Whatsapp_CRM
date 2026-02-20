import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Conversation, Lead } from "@/lib/models";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/leads/:id/conversations
 * Fetch all conversations for a specific lead.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *
 * Response:
 *   {
 *     data: [
 *       { id, leadId, status, lastMessageAt, lastMessagePreview, unreadCount, createdAt }
 *     ],
 *     meta: { page, limit, total }
 *   }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const authResult = await verifyAccessToken(req);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: authResult.status },
    );
  }

  try {
    const { id: leadId } = await params;

    // Verify lead exists
    const lead = await Lead.findById(leadId).exec();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20", 10),
      100,
    );

    const skip = (page - 1) * limit;

    // Fetch conversations for lead
    const conversations = await Conversation.find({ leadId })
      .skip(skip)
      .limit(limit)
      .sort({ lastMessageAt: -1 })
      .exec();

    const total = await Conversation.countDocuments({ leadId });

    // Map to DTO
    const data = conversations.map((conv: any) => ({
      id: conv._id.toString(),
      leadId: conv.leadId?.toString(),
      status: conv.status,
      frontendStatus: conv.frontendStatus,
      lastMessageAt: conv.lastMessageAt?.toISOString() || null,
      lastMessagePreview: conv.lastMessagePreview || "(No messages)",
      unreadCount: conv.unreadCount || 0,
      assignedAgentId: conv.assignedAgentId?.toString() || null,
      createdAt: conv.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      data,
      meta: { page, limit, total },
    });
  } catch (err: any) {
    console.error("Error fetching lead conversations:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
