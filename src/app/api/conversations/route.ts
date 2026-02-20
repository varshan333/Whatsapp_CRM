import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { Conversation } from "@/lib/models";
import { verifyAccessToken } from "@/lib/auth";

/**
 * GET /api/conversations
 * Fetch conversation list for inbox with filters and pagination.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - search: string (search sender/displayName)
 *   - status: 'all' | 'unread' | 'read' | 'resolved' (default 'all')
 *   - assignedAgentId: ObjectId (filter by agent)
 *   - clientId: ObjectId (filter by client)
 *
 * Response:
 *   {
 *     data: [
 *       {
 *         id, leadId, sender, avatar, lastMessage, lastMessageAt,
 *         unreadCount, status, starred
 *       }
 *     ],
 *     meta: { page, limit, total }
 *   }
 */
export async function GET(req: NextRequest) {
  await connectDB();

  // Verify token (basic auth check)
  const authResult = await verifyAccessToken(req);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: authResult.status },
    );
  }

  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20", 10),
      100,
    );
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const assignedAgentId = url.searchParams.get("assignedAgentId");
    const clientId = url.searchParams.get("clientId");

    // Build query filter
    const filter: any = {};
    if (clientId) filter.clientId = clientId;
    if (assignedAgentId) filter.assignedAgentId = assignedAgentId;
    if (status !== "all") {
      filter.frontendStatus = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch conversations
    const conversations = await Conversation.find(filter)
      .populate({
        path: "leadId",
        select: "name phoneNumber",
      })
      .skip(skip)
      .limit(limit)
      .sort({ lastMessageAt: -1 })
      .exec();

    // Apply search filter (client-side, post-fetch)
    const filtered = search
      ? conversations.filter((conv: any) => {
          const sender = conv.displayName || conv.leadId?.name || "";
          return sender.toLowerCase().includes(search.toLowerCase());
        })
      : conversations;

    // Get total count for pagination
    const total = await Conversation.countDocuments(filter);

    // Map to frontend DTO
    const data = filtered.map((conv: any) => ({
      id: conv._id.toString(),
      leadId: conv.leadId?._id?.toString() || null,
      sender: conv.displayName || conv.leadId?.name || "Unknown",
      avatar: conv.avatar || "U",
      lastMessage: conv.lastMessagePreview || "(No messages)",
      lastMessageAt:
        conv.lastMessageAt?.toISOString() || new Date().toISOString(),
      unreadCount: conv.unreadCount || 0,
      status: conv.frontendStatus || "unread",
      starred: conv.starred || false,
    }));

    return NextResponse.json({
      data,
      meta: { page, limit, total },
    });
  } catch (err: any) {
    console.error("Error fetching conversations:", err);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation.
 *
 * Body: { leadId, clientId?, templateId? }
 * Response: created conversation object
 */
export async function POST(req: NextRequest) {
  await connectDB();

  const authResult = await verifyAccessToken(req);
  if (!authResult.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: authResult.status },
    );
  }

  try {
    const schema = z.object({
      leadId: z.string(),
      clientId: z.string().optional(),
      templateId: z.string().optional(),
    });

    const body = await req.json();
    const parsed = schema.parse(body);

    const conversation = await Conversation.create({
      leadId: parsed.leadId,
      clientId: parsed.clientId || null,
      status: "open",
      frontendStatus: "unread",
      unreadCount: 0,
      starred: false,
      createdAt: new Date(),
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    console.error("Error creating conversation:", err);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
