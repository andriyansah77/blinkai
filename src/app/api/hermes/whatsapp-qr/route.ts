import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as pty from "node-pty";

// Store active PTY sessions
const activeSessions = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id!;
    const profileName = `user-${userId}`;

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
        );

        // Spawn Hermes WhatsApp with PTY
        console.log(`[WhatsApp QR] Starting PTY for user ${userId}`);
        
        const ptyProcess = pty.spawn("/root/.local/bin/hermes", [
          "--profile",
          profileName,
          "whatsapp"
        ], {
          name: "xterm-color",
          cols: 80,
          rows: 30,
          cwd: `/root/.hermes/profiles/${profileName}`,
          env: {
            ...process.env,
            TERM: "xterm-256color",
            HERMES_HOME: `/root/.hermes/profiles/${profileName}`,
          }
        });

        // Store session
        activeSessions.set(userId, ptyProcess);

        let outputBuffer = "";
        let qrCodeDetected = false;

        // Handle PTY output
        ptyProcess.onData((data: string) => {
          outputBuffer += data;
          
          console.log(`[WhatsApp QR] Output chunk:`, data.substring(0, 100));

          // Detect QR code in output
          if (!qrCodeDetected && (data.includes("█") || data.includes("▄") || data.includes("▀"))) {
            qrCodeDetected = true;
            console.log(`[WhatsApp QR] QR code detected for user ${userId}`);
            
            // Send QR code data
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: "qr_code", 
                data: data 
              })}\n\n`)
            );
          } else if (data.includes("Successfully connected") || data.includes("Connected to WhatsApp")) {
            console.log(`[WhatsApp QR] Connection successful for user ${userId}`);
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: "connected_success",
                message: "WhatsApp connected successfully!"
              })}\n\n`)
            );
            
            // Close stream after successful connection
            setTimeout(() => {
              ptyProcess.kill();
              activeSessions.delete(userId);
              controller.close();
            }, 2000);
          } else if (data.includes("Error") || data.includes("Failed")) {
            console.error(`[WhatsApp QR] Error for user ${userId}:`, data);
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: "error",
                message: data
              })}\n\n`)
            );
          } else {
            // Send regular output
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: "output", 
                data: data 
              })}\n\n`)
            );
          }
        });

        // Handle PTY exit
        ptyProcess.onExit(({ exitCode, signal }) => {
          console.log(`[WhatsApp QR] PTY exited for user ${userId}. Code: ${exitCode}, Signal: ${signal}`);
          
          activeSessions.delete(userId);
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: "exit",
              exitCode,
              signal
            })}\n\n`)
          );
          
          controller.close();
        });

        // Cleanup on client disconnect
        request.signal.addEventListener("abort", () => {
          console.log(`[WhatsApp QR] Client disconnected for user ${userId}`);
          
          if (activeSessions.has(userId)) {
            const pty = activeSessions.get(userId);
            pty.kill();
            activeSessions.delete(userId);
          }
          
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[WhatsApp QR] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start WhatsApp QR session" }),
      { status: 500 }
    );
  }
}

// Cleanup endpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id!;

    if (activeSessions.has(userId)) {
      const pty = activeSessions.get(userId);
      pty.kill();
      activeSessions.delete(userId);
      console.log(`[WhatsApp QR] Cleaned up session for user ${userId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[WhatsApp QR] Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to cleanup session" }),
      { status: 500 }
    );
  }
}
