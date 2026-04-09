import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateSuggestions, generateSuggestionsByCategory, FEATURED_SUGGESTIONS } from "@/lib/suggestions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'random';
    const count = parseInt(searchParams.get('count') || '4');
    const category = searchParams.get('category');

    let suggestions;

    switch (type) {
      case 'featured':
        suggestions = FEATURED_SUGGESTIONS;
        break;
      case 'category':
        if (category && ['creative', 'productivity', 'technical', 'business', 'learning'].includes(category)) {
          suggestions = generateSuggestionsByCategory(category as any, count);
        } else {
          suggestions = generateSuggestions(count);
        }
        break;
      case 'random':
      default:
        suggestions = generateSuggestions(count);
        break;
    }

    return NextResponse.json({
      success: true,
      suggestions,
      type,
      count: suggestions.length
    });

  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { regenerate = true, category, count = 4 } = body;

    if (!regenerate) {
      return NextResponse.json({
        success: true,
        suggestions: FEATURED_SUGGESTIONS
      });
    }

    const suggestions = category 
      ? generateSuggestionsByCategory(category, count)
      : generateSuggestions(count);

    return NextResponse.json({
      success: true,
      suggestions,
      regenerated: true
    });

  } catch (error) {
    console.error("Suggestions POST error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate suggestions" },
      { status: 500 }
    );
  }
}