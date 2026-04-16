import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";
import { preventProprietarySkillUninstall } from "@/lib/hooks/auto-install-minting-skill";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skills = await hermesIntegration.getSkills(session.user.id!);
    
    return NextResponse.json({
      success: true,
      skills
    });
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to get skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, skillName, source, force } = body;

    switch (action) {
      case 'install':
        if (!skillName) {
          return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
        }
        
        const installResult = await hermesIntegration.installSkill(session.user.id!, skillName, {
          source,
          force
        });
        return NextResponse.json(installResult);

      case 'uninstall':
        if (!skillName) {
          return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
        }
        
        // Check if skill is proprietary and cannot be uninstalled
        const isProprietary = await preventProprietarySkillUninstall(skillName);
        if (isProprietary) {
          return NextResponse.json({
            success: false,
            error: "This skill is proprietary and cannot be uninstalled"
          }, { status: 403 });
        }
        
        const uninstallResult = await hermesIntegration.uninstallSkill(session.user.id!, skillName);
        return NextResponse.json(uninstallResult);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Skills action error:", error);
    return NextResponse.json(
      { error: "Failed to perform skills action" },
      { status: 500 }
    );
  }
}