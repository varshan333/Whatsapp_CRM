import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { Conversation } from "@/lib/models";
import { verifyAccessToken } from "@/lib/auth";

/**
 * PATCH /api/conversations/:id
 * Update conversation (mark read, toggle star, assign agent, change status).
 *
 * Body examples:
 *   { op: "markRead", userId }
 *   { op: "toggleStar", userId, value: true }
 *   { op: "assignAgent", agentId }
 *   { status: "open" | "pending" | "closed" }
 *
 * Response: updated conversation
 */
export async function PATCH(
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
    const body = await req.json();

    const conversation = await Conversation.findById(id).exec();
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Handle markRead operation
    if (body.op === "markRead" && body.userId) {
      const userMetaEntry = conversation.userMeta?.find(
        (m: any) => m.userId?.toString() === body.userId,
      );

      if (userMetaEntry) {
        userMetaEntry.lastReadAt = new Date();
      } else {
        conversation.userMeta = conversation.userMeta || [];
        conversation.userMeta.push({
          userId: body.userId,
          starred: false,
          lastReadAt: new Date(),
        });
      }

      await conversation.save();

      return NextResponse.json({
        message: "Marked as read",
        data: mapConversationToDTO(conversation),
      });
    }

    // Handle toggleStar operation
    if (body.op === "toggleStar" && body.userId !== undefined) {
      const userMetaEntry = conversation.userMeta?.find(
        (m: any) => m.userId?.toString() === body.userId,
      );

      if (userMetaEntry) {
        userMetaEntry.starred = body.value ?? !userMetaEntry.starred;
      } else {
        conversation.userMeta = conversation.userMeta || [];
        conversation.userMeta.push({
          userId: body.userId,
          starred: body.value ?? true,
          lastReadAt: null,
        });
      }

      await conversation.save();

      return NextResponse.json({
        message: "Starred toggled",
        data: mapConversationToDTO(conversation),
      });
    }

    // Handle assignAgent operation
    if (body.op === "assignAgent" && body.agentId) {
      conversation.assignedAgentId = body.agentId;
      await conversation.save();

      return NextResponse.json({
        message: "Agent assigned",
        data: mapConversationToDTO(conversation),
      });
    }

    // Handle status update
    if (body.status) {
      const statusSchema = z.enum(["open", "pending", "closed"]);
      const status = statusSchema.parse(body.status);

      conversation.status = status;
      if (status === "closed") {
        conversation.frontendStatus = "resolved";
      }

      await conversation.save();

      return NextResponse.json({
        message: "Status updated",
        data: mapConversationToDTO(conversation),
      });
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    console.error("Error updating conversation:", err);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

/**
 * Helper: map Conversation to DTO
 */
function mapConversationToDTO(conv: any) {
  return {
    id: conv._id?.toString(),
    leadId: conv.leadId?.toString(),
    displayName: conv.displayName,
    avatar: conv.avatar,
    assignedAgentId: conv.assignedAgentId?.toString(),
    frontendStatus: conv.frontendStatus || "unread",
    status: conv.status,
    lastMessageAt: conv.lastMessageAt?.toISOString(),
    unreadCount: conv.unreadCount || 0,
    userMeta: conv.userMeta || [],
    createdAt: conv.createdAt?.toISOString(),
  };
}
