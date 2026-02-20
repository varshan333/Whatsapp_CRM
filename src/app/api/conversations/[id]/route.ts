import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Conversation } from "@/lib/models";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/conversations/:id
 * Fetch a single conversation with all metadata.
 *
 * Response:
 *   {
 *     id, leadId, displayName, avatar, assignedAgentId, frontendStatus,
 *     lastMessageAt, unreadCount, userMeta, createdAt
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
    const { id } = await params;

    const conversation = await Conversation.findById(id)
      .populate("leadId", "name phoneNumber")
      .populate("assignedAgentId", "name email")
      .exec();

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Map to DTO
    const data = {
      id: conversation._id.toString(),
      leadId: conversation.leadId?._id?.toString() || null,
      displayName: conversation.displayName || conversation.leadId?.name,
      avatar: conversation.avatar || "U",
      assignedAgentId: conversation.assignedAgentId?._id?.toString() || null,
      frontendStatus: conversation.frontendStatus || "unread",
      lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
      unreadCount: conversation.unreadCount || 0,
      userMeta: conversation.userMeta || [],
      createdAt: conversation.createdAt?.toISOString(),
    };

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error fetching conversation:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}
