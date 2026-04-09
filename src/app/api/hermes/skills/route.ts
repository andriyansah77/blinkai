import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";

// Predefined skill templates that users can install
const SKILL_TEMPLATES = [
  {
    id: "email-assistant",
    name: "Email Assistant",
    description: "Compose, reply to, and manage emails automatically",
    category: "productivity",
    tags: ["email", "communication", "automation"],
    code: `
// Email Assistant Skill
function composeEmail(recipient, subject, content) {
  return {
    to: recipient,
    subject: subject,
    body: content,
    timestamp: new Date().toISOString()
  };
}

function replyToEmail(originalEmail, replyContent) {
  return {
    to: originalEmail.from,
    subject: "Re: " + originalEmail.subject,
    body: replyContent,
    inReplyTo: originalEmail.id
  };
}

module.exports = { composeEmail, replyToEmail };
    `,
    rating: 4.8,
    usage: 1250
  },
  {
    id: "web-scraper",
    name: "Web Scraper",
    description: "Extract data from websites and APIs",
    category: "data",
    tags: ["scraping", "data", "web", "automation"],
    code: `
// Web Scraper Skill
async function scrapeWebsite(url, selectors) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Parse HTML and extract data based on selectors
    const data = {};
    for (const [key, selector] of Object.entries(selectors)) {
      // Simplified extraction logic
      data[key] = extractBySelector(html, selector);
    }
    
    return data;
  } catch (error) {
    throw new Error('Failed to scrape website: ' + error.message);
  }
}

function extractBySelector(html, selector) {
  // Simplified selector extraction
  return "extracted_data";
}

module.exports = { scrapeWebsite };
    `,
    rating: 4.6,
    usage: 890
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    description: "Post and manage content across social platforms",
    category: "marketing",
    tags: ["social", "marketing", "content", "automation"],
    code: `
// Social Media Manager Skill
function createPost(platform, content, options = {}) {
  return {
    platform: platform,
    content: content,
    scheduledTime: options.scheduledTime || new Date().toISOString(),
    hashtags: options.hashtags || [],
    mentions: options.mentions || []
  };
}

function schedulePost(posts, schedule) {
  return posts.map(post => ({
    ...post,
    scheduledTime: schedule
  }));
}

module.exports = { createPost, schedulePost };
    `,
    rating: 4.7,
    usage: 650
  },
  {
    id: "data-analyzer",
    name: "Data Analyzer",
    description: "Analyze datasets and generate insights",
    category: "analytics",
    tags: ["data", "analytics", "insights", "reporting"],
    code: `
// Data Analyzer Skill
function analyzeDataset(data, analysisType) {
  switch (analysisType) {
    case 'summary':
      return generateSummary(data);
    case 'trends':
      return identifyTrends(data);
    case 'correlations':
      return findCorrelations(data);
    default:
      return basicAnalysis(data);
  }
}

function generateSummary(data) {
  return {
    totalRecords: data.length,
    summary: "Data analysis complete",
    insights: []
  };
}

module.exports = { analyzeDataset };
    `,
    rating: 4.5,
    usage: 420
  },
  {
    id: "calendar-manager",
    name: "Calendar Manager",
    description: "Schedule meetings and manage calendar events",
    category: "productivity",
    tags: ["calendar", "scheduling", "meetings", "time"],
    code: `
// Calendar Manager Skill
function scheduleEvent(title, startTime, endTime, attendees = []) {
  return {
    title: title,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    attendees: attendees,
    id: generateEventId()
  };
}

function findAvailableSlots(calendar, duration, preferences = {}) {
  // Logic to find available time slots
  return [
    {
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T11:00:00Z"
    }
  ];
}

function generateEventId() {
  return 'event_' + Date.now();
}

module.exports = { scheduleEvent, findAvailableSlots };
    `,
    rating: 4.4,
    usage: 780
  },
  {
    id: "file-organizer",
    name: "File Organizer",
    description: "Organize and manage files automatically",
    category: "productivity",
    tags: ["files", "organization", "automation", "storage"],
    code: `
// File Organizer Skill
function organizeFiles(files, rules) {
  const organized = {};
  
  files.forEach(file => {
    const category = categorizeFile(file, rules);
    if (!organized[category]) {
      organized[category] = [];
    }
    organized[category].push(file);
  });
  
  return organized;
}

function categorizeFile(file, rules) {
  for (const rule of rules) {
    if (file.name.match(rule.pattern)) {
      return rule.category;
    }
  }
  return 'uncategorized';
}

module.exports = { organizeFiles, categorizeFile };
    `,
    rating: 4.3,
    usage: 340
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const agentId = searchParams.get('agentId');
    const category = searchParams.get('category');

    if (type === 'templates') {
      // Return skill templates for installation
      let templates = SKILL_TEMPLATES;
      
      if (category) {
        templates = templates.filter(skill => skill.category === category);
      }
      
      return NextResponse.json({
        success: true,
        skills: templates,
        type: 'templates'
      });
    }

    if (type === 'installed' && agentId) {
      // Return installed skills for specific agent
      const skills = await HermesAgentDB.getAgentSkills(agentId);
      
      return NextResponse.json({
        success: true,
        skills,
        type: 'installed',
        agentId
      });
    }

    // Return all skills (both templates and installed)
    const userAgents = await HermesAgentDB.getUserAgents(session.user.id!);
    const allInstalledSkills = [];
    
    for (const agent of userAgents) {
      const skills = await HermesAgentDB.getAgentSkills(agent.id);
      allInstalledSkills.push(...skills.map(skill => ({
        ...skill,
        agentName: agent.name,
        agentId: agent.id
      })));
    }

    return NextResponse.json({
      success: true,
      templates: SKILL_TEMPLATES,
      installed: allInstalledSkills,
      categories: ['productivity', 'data', 'marketing', 'analytics', 'communication']
    });

  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const { action, agentId, skillId, skillData } = body;

    if (!agentId) {
      return NextResponse.json({ 
        error: "Agent ID is required" 
      }, { status: 400 });
    }

    // Verify agent belongs to user
    const agent = await HermesAgentDB.getAgent(agentId);
    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (action === 'install' && skillId) {
      // Install skill template
      const template = SKILL_TEMPLATES.find(t => t.id === skillId);
      if (!template) {
        return NextResponse.json({ error: "Skill template not found" }, { status: 404 });
      }

      const skill = await HermesAgentDB.createSkill(agentId, {
        name: template.name,
        description: template.description,
        code: template.code,
        category: template.category,
        tags: template.tags,
        usage: 0,
        rating: 0
      });

      return NextResponse.json({
        success: true,
        skill,
        message: `Skill "${template.name}" installed successfully`
      });
    }

    if (action === 'create' && skillData) {
      // Create custom skill
      const { name, description, code, category = 'custom', tags = [] } = skillData;
      
      if (!name || !code) {
        return NextResponse.json({ 
          error: "Skill name and code are required" 
        }, { status: 400 });
      }

      const skill = await HermesAgentDB.createSkill(agentId, {
        name,
        description: description || '',
        code,
        category,
        tags,
        usage: 0,
        rating: 0
      });

      return NextResponse.json({
        success: true,
        skill,
        message: `Custom skill "${name}" created successfully`
      });
    }

    return NextResponse.json({ 
      error: "Invalid action or missing parameters" 
    }, { status: 400 });

  } catch (error) {
    console.error("Skills POST error:", error);
    return NextResponse.json(
      { error: "Failed to process skill request" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { skillId, rating } = body;

    if (!skillId) {
      return NextResponse.json({ 
        error: "Skill ID is required" 
      }, { status: 400 });
    }

    // Get skill and verify ownership
    const skill = await HermesAgentDB.getSkill(skillId);
    if (!skill || skill.agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    if (rating !== undefined) {
      // Update skill rating
      await HermesAgentDB.updateSkillRating(skillId, rating);
      
      return NextResponse.json({
        success: true,
        message: "Skill rating updated"
      });
    }

    return NextResponse.json({ 
      error: "No valid updates provided" 
    }, { status: 400 });

  } catch (error) {
    console.error("Update skill error:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}