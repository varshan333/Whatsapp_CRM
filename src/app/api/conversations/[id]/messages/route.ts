import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { Conversation, Message } from "@/lib/models";
import { verifyAccessToken } from "@/lib/auth";
import { enqueueMessage } from "@/lib/queue";

/**
 * GET /api/conversations/:conversationId/messages
 * Fetch messages for a conversation with pagination.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 50, max 100)
 *
 * Response:
 *   {
 *     data: [
 *       { id, senderType, messageType, content, templateName, providerMessageId, status, statusHistory, timestamp }
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
    const { id } = await params;
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      100,
    );

    const skip = (page - 1) * limit;

    // Fetch messages for conversation
    const messages = await Message.find({ conversationId: id })
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: 1 })
      .exec();

    const total = await Message.countDocuments({ conversationId: id });

    // Map to DTO
    const data = messages.map((msg: any) => ({
      id: msg._id.toString(),
      senderType: msg.senderType,
      messageType: msg.messageType,
      content: msg.content,
      templateName: msg.templateName || null,
      providerMessageId: msg.providerMessageId || null,
      status: msg.status,
      statusHistory: msg.statusHistory || [],
      timestamp: msg.timestamp?.toISOString(),
    }));

    return NextResponse.json({
      data,
      meta: { page, limit, total },
    });
  } catch (err: any) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/conversations/:conversationId/messages
 * Send a new message in a conversation.
 *
 * Body:
 *   {
 *     messageType: 'text' | 'template' | 'image' | 'button',
 *     content: { text: '...' } | { ... },
 *     templateName?: string,
 *     components?: array
 *   }
 *
 * Response: created message object
 * Side effects: updates conversation, enqueues outbound send
 */
export async function POST(
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
    const { id: conversationId } = await params;
    const body = await req.json();

    const schema = z.object({
      messageType: z.enum(["text", "template", "image", "button"]),
      content: z.record(z.string(), z.any()),
      templateName: z.string().optional(),
      components: z.array(z.any()).optional(),
    });

    const parsed = schema.parse(body);

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId).exec();
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Create message
    const message = await Message.create({
      clientId: conversation.clientId,
      conversationId: conversationId,
      senderType: "agent",
      messageType: parsed.messageType,
      content: parsed.content,
      templateName: parsed.templateName || null,
      status: "sent",
      statusHistory: [
        {
          status: "sent",
          timestamp: new Date(),
          raw: {},
        },
      ],
      timestamp: new Date(),
    });

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessagePreview: parsed.content.text || `[${parsed.messageType}]`,
      $inc: { unreadCount: 1 },
    }).exec();

    // Enqueue outbound send job
    // TODO: extract recipient phone from conversation.leadId
    await enqueueMessage({
      id: message._id.toString(),
      type: "send_message",
      to: "+1234567890", // placeholder; should come from lead
      templateName: parsed.templateName,
      messageType: parsed.messageType,
      content: parsed.content,
    });

    // Return message DTO
    return NextResponse.json(
      {
        id: message._id.toString(),
        senderType: message.senderType,
        messageType: message.messageType,
        content: message.content,
        templateName: message.templateName,
        status: message.status,
        timestamp: message.timestamp?.toISOString(),
      },
      { status: 201 },
    );
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    console.error("Error posting message:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
