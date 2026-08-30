import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  createUser,
  deleteVaultResource,
  findOrCreateFirebaseUser,
  getAppState,
  getUserByEmail,
  getUserById,
  getVaultResources,
  resetDemoState,
  saveAppState,
  saveVaultResource,
  setUserOnboardingCompleted,
  updateUserPassword,
  updateUserProfile,
  updateVaultResource
} from "./server/db";
import { generateTailoredDashboardState, OnboardingInput } from "./server/onboardingEngine";
import { retrieveRelevantContext, buildCopilotSystemPrompt } from "./server/copilotEngine";
import { AppState, StartupStage, CopilotMessage, CopilotConversation, FounderNote } from "./src/types";

dotenv.config();

export function createApp(): express.Express {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  // Helper: Extract user ID from authorization bearer token or custom header
  const getUserIdFromReq = (req: Request): string | null => {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const t = authHeader.substring(7).trim();
      if (t) return t;
    }
    const tokenHeader = req.headers["x-user-token"] || req.headers["x-user-id"];
    if (typeof tokenHeader === "string" && tokenHeader.trim()) {
      return tokenHeader.trim();
    }
    return null;
  };

  // Helper: Get AI client with support for custom founder Gemini API key
  const getAi = (req?: Request, customKeyOverride?: string) => {
    let key = (customKeyOverride || "").trim();

    if (!key && req) {
      // 1. Check custom HTTP Header
      const headerKey = req.headers["x-gemini-api-key"];
      if (typeof headerKey === "string" && headerKey.trim()) {
        key = headerKey.trim();
      }

      // 2. Check request body payload
      if (!key && req.body) {
        if (typeof req.body.geminiApiKey === "string" && req.body.geminiApiKey.trim()) {
          key = req.body.geminiApiKey.trim();
        } else if (req.body.profile && typeof req.body.profile.geminiApiKey === "string" && req.body.profile.geminiApiKey.trim()) {
          key = req.body.profile.geminiApiKey.trim();
        }
      }

      // 3. Check persistent database/state profile for the authenticated user
      if (!key) {
        const userId = getUserIdFromReq(req);
        if (userId) {
          try {
            const state = getAppState(userId);
            if (state?.profile?.geminiApiKey && typeof state.profile.geminiApiKey === "string" && state.profile.geminiApiKey.trim()) {
              key = state.profile.geminiApiKey.trim();
            }
          } catch (err) {
            // Ignore state fetch error
          }
        }
      }
    }

    // 4. Fallback to server environment variable
    if (!key) {
      key = process.env.GEMINI_API_KEY || "";
    }

    if (!key || key === "MY_GEMINI_API_KEY") return null;
    try {
      return new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Gemini AI initialization error:", e);
      return null;
    }
  };

  // --- AUTH ENDPOINTS ---
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check for demo account shortcut
    if (cleanEmail === "alex@pulseboard.io" || cleanEmail === "demo@founderzero.app") {
      const user = getUserById("demo-user-1")!;
      const state = getAppState("demo-user-1");
      return res.json({ user, state, token: "demo-user-1", authenticated: true });
    }

    const existing = getUserByEmail(cleanEmail);
    if (!existing) {
      return res.status(401).json({ error: "Account not found with this email. Please create an account." });
    }

    if (existing.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid password. Please check your credentials." });
    }

    const user = getUserById(existing.id)!;
    const state = getAppState(existing.id);
    return res.json({
      user,
      state,
      token: existing.id,
      authenticated: true
    });
  });

  app.post("/api/auth/signup", (req: Request, res: Response) => {
    const { email, name, password, startupName, stage } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Full Name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const existing = getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists. Please sign in instead." });
    }

    const user = createUser(
      cleanEmail,
      name.trim(),
      password,
      startupName?.trim() || `${name.trim()}'s Startup`,
      stage as StartupStage || "Idea"
    );
    const state = getAppState(user.id);
    return res.json({ user, state, token: user.id, authenticated: true });
  });

  // Firebase Auth sync endpoint (for email/password and Google provider logins)
  app.post("/api/auth/firebase-sync", (req: Request, res: Response) => {
    const { firebaseUid, email, name, photoURL, startupName, stage } = req.body;
    if (!firebaseUid) {
      return res.status(400).json({ error: "Firebase UID is required" });
    }

    const { user, state } = findOrCreateFirebaseUser(
      firebaseUid,
      email || "",
      name || "",
      photoURL || "",
      startupName || "",
      stage as StartupStage || "Idea"
    );

    return res.json({
      user,
      state,
      token: user.id,
      authenticated: true
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ authenticated: false, error: "No active authentication session" });
    }

    const user = getUserById(userId);
    if (!user) {
      return res.status(401).json({ authenticated: false, error: "Session expired or user not found" });
    }

    const state = getAppState(user.id);
    return res.json({ user, state, authenticated: true });
  });

  app.post("/api/auth/update-profile", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, startupName, email } = req.body;
    const updated = updateUserProfile(userId, { name, startupName, email });
    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: updated, message: "Profile updated successfully" });
  });

  app.post("/api/auth/change-password", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const result = updateUserPassword(userId, currentPassword, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error || "Failed to update password" });
    }
    return res.json({ status: "ok", message: "Password updated successfully" });
  });

  app.post("/api/auth/logout", (_req: Request, res: Response) => {
    return res.json({ status: "ok", message: "Logged out successfully" });
  });

  // --- STATE ENDPOINTS ---
  app.get("/api/state", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const isDemo = req.query.demo === "true" || req.headers["x-demo-mode"] === "true";

    if (!userId) {
      if (isDemo) {
        return res.json(getAppState("demo-user-1"));
      }
      return res.status(401).json({ error: "Authentication required to access workspace data" });
    }

    const state = getAppState(userId);
    return res.json(state);
  });

  app.post("/api/state", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required to save workspace data" });
    }
    const newState = req.body as AppState;
    if (!newState || !newState.profile) {
      return res.status(400).json({ error: "Invalid state payload" });
    }
    saveAppState(userId, newState);
    return res.json({ status: "ok", updated: new Date().toISOString() });
  });

  app.post("/api/demo/reset", (req: Request, res: Response) => {
    const state = resetDemoState();
    return res.json({ status: "ok", state });
  });

  // --- ONBOARDING ENGINE ENDPOINT ---
  app.post("/api/onboarding/complete", async (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required to complete onboarding" });
    }

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const onboardingInput: OnboardingInput = req.body || {};
    
    // Generate tailored, comprehensive dashboard state
    let tailoredState = generateTailoredDashboardState(onboardingInput, user);

    // Optional Gemini enrichment if available
    const ai = getAi(req);
    if (ai && onboardingInput.name && onboardingInput.problem) {
      try {
        const prompt = `You are the FounderZero AI Growth Operating System.
Startup Name: ${onboardingInput.name}
Stage: ${onboardingInput.stage}
Category: ${onboardingInput.category}
Target ICP: ${onboardingInput.targetCustomer}
Core Problem: ${onboardingInput.problem}
Uncertainty: ${onboardingInput.biggestUncertainty}
90-Day Target: ${onboardingInput.goal90Days}

Provide:
1. singleTopDoNowAction: { title: string, whyItMatters: string, expectedImpact: string, reason: string, relatedBottleneck: string }
2. topDontDoYet: { action: string, reason: string, risk: string, betterAlternative: string }
3. welcomeInsight: string

Respond with strictly valid JSON matching this schema:
{
  "singleTopDoNowAction": { "title": "string", "whyItMatters": "string", "expectedImpact": "string", "reason": "string", "relatedBottleneck": "string" },
  "topDontDoYet": { "action": "string", "reason": "string", "risk": "string", "betterAlternative": "string" },
  "welcomeInsight": "string"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const aiData = JSON.parse(response.text.trim());
          if (aiData.singleTopDoNowAction && aiData.singleTopDoNowAction.title) {
            tailoredState.nextActions[0] = {
              ...tailoredState.nextActions[0],
              title: aiData.singleTopDoNowAction.title,
              whyItMatters: aiData.singleTopDoNowAction.whyItMatters || tailoredState.nextActions[0].whyItMatters,
              expectedImpact: aiData.singleTopDoNowAction.expectedImpact || tailoredState.nextActions[0].expectedImpact,
              reason: aiData.singleTopDoNowAction.reason || tailoredState.nextActions[0].reason,
              relatedBottleneck: aiData.singleTopDoNowAction.relatedBottleneck || tailoredState.nextActions[0].relatedBottleneck,
            };
          }
          if (aiData.topDontDoYet && aiData.topDontDoYet.action) {
            tailoredState.dontDoItems[0] = {
              ...tailoredState.dontDoItems[0],
              action: aiData.topDontDoYet.action,
              reason: aiData.topDontDoYet.reason || tailoredState.dontDoItems[0].reason,
              risk: aiData.topDontDoYet.risk || tailoredState.dontDoItems[0].risk,
              betterAlternative: aiData.topDontDoYet.betterAlternative || tailoredState.dontDoItems[0].betterAlternative,
            };
          }
          if (aiData.welcomeInsight) {
            tailoredState.insights[0].description = aiData.welcomeInsight;
          }
        }
      } catch (err) {
        console.warn("Optional Gemini enrichment skipped:", err);
      }
    }

    // Persist customized state
    saveAppState(userId, tailoredState);
    setUserOnboardingCompleted(userId, true);

    const updatedUser = getUserById(userId);

    return res.json({
      success: true,
      message: "Startup OS calibrated successfully",
      state: tailoredState,
      user: updatedUser
    });
  });

  // --- AI API KEY TESTING & STATUS ENDPOINTS ---
  app.post("/api/ai/test-key", async (req: Request, res: Response) => {
    const { apiKey } = req.body || {};
    const startTime = Date.now();

    const keyToTest = (apiKey || req.headers["x-gemini-api-key"] || "").toString().trim();
    const ai = getAi(req, keyToTest || undefined);

    if (!ai) {
      return res.status(400).json({
        success: false,
        error: "No Gemini API key provided. Please enter a valid key from Google AI Studio (aistudio.google.com)."
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: "Respond with the word OK",
      });

      const latencyMs = Date.now() - startTime;
      const text = response.text ? response.text.trim() : "";

      if (text) {
        return res.json({
          success: true,
          message: "Gemini API key is verified and operational!",
          model: "gemini-3.7-flash",
          latencyMs,
          isCustomKey: Boolean(keyToTest)
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Model returned an empty response. Please verify API key permissions."
        });
      }
    } catch (err: any) {
      console.error("Gemini API key verification error:", err);
      const errMsg = err?.message || "Invalid or restricted Gemini API key. Please check your key at https://aistudio.google.com/app/apikey";
      return res.status(400).json({
        success: false,
        error: errMsg
      });
    }
  });

  app.get("/api/ai/key-status", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const customKey = state.profile?.geminiApiKey;
    const hasCustomKey = Boolean(customKey && customKey.trim().length > 5);
    const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");

    return res.json({
      success: true,
      hasCustomKey,
      maskedKey: hasCustomKey ? `${customKey!.slice(0, 4)}••••••••${customKey!.slice(-4)}` : null,
      hasServerKey,
      activeProvider: hasCustomKey ? "custom" : hasServerKey ? "server" : "none",
      recommendedModel: "gemini-3.7-flash"
    });
  });

  // --- AI FOUNDER PROFILE ASSISTANT ENDPOINT ---
  app.post("/api/ai/founder-profile", async (req: Request, res: Response) => {
    const { founderName, startupName, category, problem, skills, stage, currentBio } = req.body || {};
    const ai = getAi(req);

    const fallbackSkills = Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : 'Full-Stack Development, Product Strategy, Rapid Prototyping';
    
    if (!ai) {
      return res.json({
        success: true,
        profile: {
          founderTitle: 'Solo Technical Founder & Product Architect',
          founderArchetype: 'Full-Stack Builder & Lean Operator',
          founderBio: `Building ${startupName || 'high-impact software'} with zero-budget discipline. Passionate about rapid customer discovery, autonomous AI workflows, and lean MVPs that solve painful bottlenecks.`,
          workingStyle: 'Deep Work Sprints • Async-First • Rapid Prototyping',
          superpowers: [
            'Autonomous AI Agent Workflows',
            'High-Velocity MVP Shipping',
            'Customer Discovery & The Mom Test',
            'Zero-Budget Stack Optimization',
            'Organic Founder-Led Distribution'
          ],
          operatingPrinciples: [
            'Validate problem intensity with 3 customers before writing complex code',
            'Zero paid marketing spend until 40%+ 30-day cohort retention is proven',
            'Ship thin, complete vertical slices over wide unfinished architectures',
            'Prioritize free open-source infrastructure over expensive monthly SaaS subscriptions'
          ],
          elevatorPitch: `I am building ${startupName || 'a lean startup'} to solve "${problem || 'a critical workflow bottleneck'}" for ${category || 'founders'} with zero overhead and maximum product velocity.`
        }
      });
    }

    try {
      const prompt = `You are an elite Silicon Valley executive coach and YC partner crafting a curated, attractive Founder Profile.
Founder Name: ${founderName || 'Founder'}
Startup Name: ${startupName || 'Startup'}
Category: ${category || 'SaaS'}
Stage: ${stage || 'Validating'}
Problem Solved: ${problem || 'Painful manual workflows and high costs'}
Founder Skills: ${fallbackSkills}
Current Bio / Context: ${currentBio || 'Early stage venture builder'}

Create a high-impact, authentic, and executive founder profile package:
1. founderTitle: A crisp, professional title (e.g., "Technical Founder & Product Architect", "Solo 0-to-1 Builder & Growth Hacker")
2. founderArchetype: A distinctive archetype tag (e.g., "Full-Stack Builder & Lean Operator", "Customer-Obsessed Product Hacker", "Autonomous Agent Architect")
3. founderBio: A compelling, concise 2-3 sentence founder manifesto highlighting speed, craft, and validation rigor.
4. workingStyle: A short phrase describing cadence (e.g., "Deep Work Sprints • Async-First • Rapid Prototyping")
5. superpowers: Array of exactly 5 distinctive, modern tactical superpowers (e.g. "Autonomous AI Coding", "The Mom Test Validation", "Zero-Budget Ops", "High-Velocity MVPs", "Viral Technical Content")
6. operatingPrinciples: Array of exactly 4 actionable, disciplined operating rules that prevent waste and drive focus.
7. elevatorPitch: A crisp 2-sentence founder pitch suitable for investor, co-founder, or customer introductions.

Respond with strictly valid JSON matching this schema:
{
  "founderTitle": "string",
  "founderArchetype": "string",
  "founderBio": "string",
  "workingStyle": "string",
  "superpowers": ["string", "string", "string", "string", "string"],
  "operatingPrinciples": ["string", "string", "string", "string"],
  "elevatorPitch": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ success: true, profile: parsed });
      }
    } catch (err) {
      console.error("Gemini founder profile generation error:", err);
    }

    return res.json({
      success: true,
      profile: {
        founderTitle: 'Solo Technical Founder & Product Architect',
        founderArchetype: 'Full-Stack Builder & Lean Operator',
        founderBio: `Building ${startupName || 'lean software'} with high craft and zero burn. Focused on rapid customer discovery and autonomous AI-assisted shipping.`,
        workingStyle: 'Deep Work Sprints • Async-First • Rapid Prototyping',
        superpowers: [
          'Autonomous AI Agent Workflows',
          'High-Velocity MVP Shipping',
          'Customer Discovery & The Mom Test',
          'Zero-Budget Stack Optimization',
          'Organic Founder-Led Distribution'
        ],
        operatingPrinciples: [
          'Validate problem intensity with 3 customers before writing complex code',
          'Zero paid marketing spend until 40%+ 30-day cohort retention is proven',
          'Ship thin, complete vertical slices over wide unfinished architectures',
          'Prioritize free open-source infrastructure over expensive monthly SaaS subscriptions'
        ],
        elevatorPitch: `I am building ${startupName || 'a lean startup'} to solve "${problem || 'a critical workflow bottleneck'}" with zero overhead and maximum product velocity.`
      }
    });
  });

  // --- AI PITCH & ICP ASSISTANT ENDPOINT ---
  app.post("/api/ai/suggest-pitch", async (req: Request, res: Response) => {
    const { name, category, concept } = req.body || {};
    const ai = getAi(req);

    if (!ai) {
      return res.json({
        success: true,
        suggestions: {
          oneLinePitch: `${name || 'The platform'} helps ${category || 'founders'} solve their core workflow bottleneck in under 5 minutes with ₹0 overhead.`,
          targetCustomer: 'Early-stage startup founders, solo builders, and indie operators',
          coreProblem: 'Wasting months building features nobody wants and spending high recurring SaaS costs before product validation.',
          monetizationModel: 'Subscription (B2B SaaS with Free Starter Tier)',
          suggested90DayGoal: 'Interview 10 target customers and launch functional MVP with 25 active users.'
        }
      });
    }

    try {
      const prompt = `You are a world-class Y Combinator startup advisor.
A founder is starting a new venture:
Startup Name: ${name || 'Untitled'}
Category: ${category || 'SaaS'}
Concept notes: ${concept || 'A modern software solution'}

Generate crisp, professional, high-converting startup positioning:
1. oneLinePitch (1 short sentence, punchy, active verb)
2. targetCustomer (specific ICP persona)
3. coreProblem (acute, painful problem in 1-2 sentences)
4. monetizationModel (e.g., Subscription / Usage-Based / Freemium)
5. suggested90DayGoal (realistic, measurable 90-day milestone)

Respond with strictly valid JSON:
{
  "oneLinePitch": "string",
  "targetCustomer": "string",
  "coreProblem": "string",
  "monetizationModel": "string",
  "suggested90DayGoal": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ success: true, suggestions: parsed });
      }
    } catch (err) {
      console.error("Gemini pitch suggestion error:", err);
    }

    return res.json({
      success: true,
      suggestions: {
        oneLinePitch: `${name || 'The platform'} helps ${category || 'founders'} solve their core workflow bottleneck in under 5 minutes.`,
        targetCustomer: 'Early-stage startup founders and modern engineering teams',
        coreProblem: 'High friction in manual processes and unvalidated feature development.',
        monetizationModel: 'Subscription (B2B SaaS)',
        suggested90DayGoal: 'Interview 10 target customers and secure first 20 active users.'
      }
    });
  });

  // --- NOTEPAD AI SEARCH ENDPOINT ---
  app.post("/api/ai/notepad-search", async (req: Request, res: Response) => {
    const { query, notes, profile } = req.body || {};
    const ai = getAi(req);

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.json({
        success: true,
        answer: "You don't have any notes saved yet. Create a note to start building your startup's thinking space!",
        matchedNoteIds: [],
        insights: []
      });
    }

    // Build condensed notes corpus for semantic search
    const notesCorpus = notes.map((n: any) => ({
      id: n.id,
      title: n.title,
      collection: n.collection,
      tags: n.tags || [],
      content: (n.blocks || []).map((b: any) => b.content || '').join('\n')
    }));

    if (!ai) {
      // Offline fallback keyword search
      const qLower = (query || '').toLowerCase();
      const matched = notesCorpus.filter((n: any) =>
        n.title.toLowerCase().includes(qLower) ||
        n.tags.some((t: string) => t.toLowerCase().includes(qLower)) ||
        n.content.toLowerCase().includes(qLower) ||
        n.collection.toLowerCase().includes(qLower)
      );

      return res.json({
        success: true,
        answer: matched.length > 0
          ? `Found ${matched.length} relevant note${matched.length === 1 ? '' : 's'} mentioning "${query}".`
          : `No direct notes found matching "${query}". Try searching with different keywords.`,
        matchedNoteIds: matched.map((m: any) => m.id),
        insights: matched.slice(0, 3).map((m: any) => `Found relevant thoughts in note: "${m.title}" (${m.collection})`)
      });
    }

    try {
      const prompt = `You are FounderZero AI, the founder's executive thinking partner.
The founder is asking a natural-language question about their private startup notes:
Question: "${query}"

Founder Startup: ${profile?.name || 'Startup'} (${profile?.stage || 'Early Stage'})
Core Problem: ${profile?.problem || ''}

Here are the founder's private notes:
${JSON.stringify(notesCorpus, null, 2)}

Instructions:
1. Synthesize a direct, concise, and helpful answer to the founder's query based ONLY on the contents of their notes.
2. Identify the specific note IDs that directly address or contain information relevant to this question (matchedNoteIds).
3. Provide 2-3 key takeaway bullet insights extracted from their thinking space.
4. If no notes contain relevant information, state that clearly and suggest a related startup thought or experiment they could document.

Respond with strictly valid JSON matching this schema:
{
  "answer": "string (crisp 2-4 sentence executive summary addressing the founder's question)",
  "matchedNoteIds": ["string"],
  "insights": ["string", "string"],
  "suggestedNextQuestion": "string"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ success: true, ...parsed });
      }
    } catch (err) {
      console.error("Gemini notepad search error:", err);
    }

    // Fallback if AI call failed
    const qLower = (query || '').toLowerCase();
    const matched = notesCorpus.filter((n: any) =>
      n.title.toLowerCase().includes(qLower) ||
      n.tags.some((t: string) => t.toLowerCase().includes(qLower)) ||
      n.content.toLowerCase().includes(qLower)
    );

    return res.json({
      success: true,
      answer: `Found ${matched.length} notes relevant to your inquiry.`,
      matchedNoteIds: matched.map((m: any) => m.id),
      insights: matched.map((m: any) => `Note: "${m.title}" has related context.`),
      suggestedNextQuestion: "Would you like to turn these insights into an experiment or mission?"
    });
  });

  // --- AI NOTE ACTION ENDPOINT (SUMMARIZE, EXPAND, EXTRACT TASKS, RISKS, ETC.) ---
  app.post("/api/ai/note-action", async (req: Request, res: Response) => {
    const { action, noteTitle, noteContent, selectedText, collection, profile } = req.body || {};
    const textToProcess = selectedText || noteContent || '';
    const ai = getAi(req);

    if (!textToProcess.trim()) {
      return res.status(400).json({ error: "No content provided to process" });
    }

    if (!ai) {
      return res.json({
        success: true,
        action,
        result: `[Offline AI Preview for "${action}"]:\nBased on "${noteTitle || 'Note'}", ensure you validate problem intensity with at least 3 target customers before investing coding time.`,
        suggestedBlocks: [
          { type: 'callout', content: `💡 **AI Takeaway (${action})**: Refine this thought with real customer feedback.`, calloutVariant: 'idea' }
        ]
      });
    }

    try {
      const actionPrompts: Record<string, string> = {
        summarize: "Create an executive 2-3 bullet summary capturing core decisions, pain points, and next steps.",
        rewrite: "Rewrite the content with crisp founder clarity, active verbs, and zero fluff. Maintain high technical precision.",
        expand: "Expand upon the core thesis with rigorous logical depth, potential edge cases, customer psychology, and zero-budget execution steps.",
        extract_tasks: "Extract all actionable next steps, customer follow-ups, or coding tasks as a clean checklist of items.",
        extract_insights: "Extract the top 3 high-leverage non-obvious insights and strategic takeaways.",
        find_assumptions: "Identify unverified assumptions, hidden risks, and things that might be false in this text.",
        generate_questions: "Generate 4 sharp, Mom Test-compliant questions to ask customers or advisors to test this thinking.",
        identify_risks: "Identify critical failure modes, distribution bottlenecks, and resource constraints.",
        create_action_plan: "Structure a 3-step prioritized 7-day execution plan with estimated time and success metrics."
      };

      const instruction = actionPrompts[action] || `Perform the "${action}" action on this founder note content.`;

      const prompt = `You are FounderZero AI, an elite YC startup advisor and technical co-founder.
Action requested: "${action}"
Instruction: ${instruction}

Startup Context:
Startup Name: ${profile?.name || 'PulseBoard'} (${profile?.stage || 'Launched'})
Core Problem: ${profile?.problem || ''}
Target ICP: ${profile?.targetCustomer || 'Developers'}

Note Title: ${noteTitle || 'Untitled'}
Collection: ${collection || 'General'}

Content to process:
"""
${textToProcess}
"""

Instructions:
1. Provide the main transformed text or result.
2. Provide a list of formatted blocks that the founder can preview and insert into their note.
Available block types: 'paragraph', 'heading2', 'bulletList', 'checklist', 'quote', 'code', 'callout', 'divider'.

Respond with strictly valid JSON:
{
  "summary": "string (short 1-line description of what was generated)",
  "resultText": "string",
  "suggestedBlocks": [
    {
      "type": "paragraph" | "heading2" | "bulletList" | "checklist" | "quote" | "code" | "callout",
      "content": "string",
      "checked": false,
      "calloutVariant": "idea" | "info" | "warning" | "success" | "founder"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ success: true, action, ...parsed });
      }
    } catch (err) {
      console.error("Gemini note action error:", err);
    }

    return res.json({
      success: true,
      action,
      summary: `Processed ${action} for ${noteTitle || 'note'}`,
      resultText: `Summary of key items from ${noteTitle || 'note'}:\n- Verified core customer pain point\n- Recommended 1-click test with target users`,
      suggestedBlocks: [
        { type: 'callout', content: `💡 **AI Recommendation**: Validate assumptions with 3 target users.`, calloutVariant: 'idea' },
        { type: 'checklist', content: `Complete follow-up on ${noteTitle || 'note'}`, checked: false }
      ]
    });
  });

  // --- AI CONVERT NOTE INTO MISSION / EXPERIMENT ENDPOINT ---
  app.post("/api/ai/convert-note-action", async (req: Request, res: Response) => {
    const { targetType, noteTitle, noteContent, profile } = req.body || {};
    const ai = getAi(req);

    if (!ai) {
      if (targetType === 'mission') {
        return res.json({
          success: true,
          targetType: 'mission',
          mission: {
            title: `Execute: ${noteTitle || 'Customer Validation'}`,
            objective: `Turn insights from "${noteTitle || 'Note'}" into an actionable validation sprint.`,
            category: 'Validation',
            whyItMatters: 'Converts unvalidated notes into verified customer learning.',
            estimatedTime: '3-4 hours',
            estimatedCost: '₹0',
            difficulty: 'Medium',
            expectedResult: 'Completed action items and recorded qualitative feedback.',
            steps: [
              { id: 's1', text: 'Synthesize core assumption from note', completed: false },
              { id: 's2', text: 'Reach out to 5 target customers for feedback', completed: false },
              { id: 's3', text: 'Log responses and update next roadmap items', completed: false }
            ]
          }
        });
      } else {
        return res.json({
          success: true,
          targetType: 'experiment',
          experiment: {
            title: `Test: ${noteTitle || 'Growth Hypothesis'}`,
            hypothesis: `If we implement the core concept in "${noteTitle}", then activation will improve.`,
            problem: 'Current friction or unverified assumption in customer journey.',
            metric: 'Conversion Rate',
            currentValue: '18%',
            targetValue: '35%',
            method: 'A/B test or 1-week cohort trial',
            audience: 'Next 50 new visitors',
            duration: '7 days',
            budget: '₹0'
          }
        });
      }
    }

    try {
      if (targetType === 'mission') {
        const prompt = `You are FounderZero AI. Convert this founder note into a high-impact, zero-budget Founder Mission.
Note Title: "${noteTitle}"
Startup Context: ${profile?.name || 'PulseBoard'} (${profile?.stage || 'Launched'})
Note Content:
"""
${noteContent}
"""

Generate a structured Founder Mission:
1. title: Crisp, active-verb action title (e.g. "Interview 10 potential customers before Friday", "Build 1-click Discord notification webhook")
2. objective: Clear 1-sentence goal of the mission
3. category: "Validation" | "Growth" | "Product" | "Stack" | "Strategy"
4. whyItMatters: Why this specific action moves the needle
5. estimatedTime: (e.g., "3 hours", "2 days")
6. estimatedCost: Keep at ₹0 or minimal
7. difficulty: "Easy" | "Medium" | "Hard"
8. expectedResult: Measurable completion criteria
9. steps: Array of 3-5 concrete step objects { "id": "s1", "text": "string", "completed": false }

Respond strictly with valid JSON:
{
  "title": "string",
  "objective": "string",
  "category": "string",
  "whyItMatters": "string",
  "estimatedTime": "string",
  "estimatedCost": "string",
  "difficulty": "Easy" | "Medium" | "Hard",
  "expectedResult": "string",
  "steps": [
    { "id": "string", "text": "string", "completed": false }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, targetType: 'mission', mission: parsed });
        }
      } else {
        // Target: Experiment
        const prompt = `You are FounderZero AI. Extract and format a scientific growth or product experiment hypothesis from this founder note.
Note Title: "${noteTitle}"
Startup Context: ${profile?.name || 'PulseBoard'} (${profile?.stage || 'Launched'})
Note Content:
"""
${noteContent}
"""

Generate a structured Experiment:
1. title: Crisp hypothesis title (e.g. "Interactive Demo Sandbox Onboarding")
2. hypothesis: Clear "If [change], then [outcome] because [reason]" statement
3. problem: The acute bottleneck being addressed
4. metric: Primary quantitative success metric (e.g. "Visitor-to-Activated Rate")
5. currentValue: Baseline measurement (e.g. "18.2%")
6. targetValue: Target measurement (e.g. "35.0%")
7. method: Exact execution test mechanism (e.g. "Client-side demo toggle for 100 new signups")
8. audience: Target test segment (e.g. "New landing page visitors")
9. duration: (e.g. "7 calendar days")
10. budget: (e.g. "₹0")

Respond strictly with valid JSON:
{
  "title": "string",
  "hypothesis": "string",
  "problem": "string",
  "metric": "string",
  "currentValue": "string",
  "targetValue": "string",
  "method": "string",
  "audience": "string",
  "duration": "string",
  "budget": "string"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, targetType: 'experiment', experiment: parsed });
        }
      }
    } catch (err) {
      console.error("Gemini convert note action error:", err);
    }

    // Default fallback if error
    return res.json({
      success: true,
      targetType,
      ...(targetType === 'mission'
        ? {
            mission: {
              title: `Action: ${noteTitle || 'Validation Sprint'}`,
              objective: `Execute key priorities outlined in ${noteTitle || 'Note'}.`,
              category: 'Validation',
              whyItMatters: 'Converts ideas into measurable progress.',
              estimatedTime: '2 hours',
              estimatedCost: '₹0',
              difficulty: 'Medium',
              expectedResult: 'Completed action steps and updated telemetry.',
              steps: [
                { id: 's1', text: 'Review core notes and list top 3 hypotheses', completed: false },
                { id: 's2', text: 'Reach out to 3 target users for direct feedback', completed: false },
                { id: 's3', text: 'Log qualitative answers and refine next steps', completed: false }
              ]
            }
          }
        : {
            experiment: {
              title: `Experiment: ${noteTitle || 'Hypothesis Test'}`,
              hypothesis: `If we test the idea from "${noteTitle}", then activation will improve.`,
              problem: 'Unverified assumption in founder notes.',
              metric: 'User Retention Rate',
              currentValue: '20%',
              targetValue: '35%',
              method: '1-week test on sample users',
              audience: 'Target customer cohort',
              duration: '7 days',
              budget: '₹0'
            }
          })
    });
  });

  // --- AI ENDPOINTS (GEMINI API SERVER-SIDE) ---
  app.post("/api/ai/diagnose", async (req: Request, res: Response) => {
    const body = req.body || {};
    const rawProfile = body.profile || (body.name || body.stage ? body : {});
    
    const profile = {
      name: rawProfile.name || "Startup",
      stage: rawProfile.stage || "Validating",
      description: rawProfile.description || "Building a growth solution.",
      problem: rawProfile.problem || "Finding customer acquisition channels.",
      targetCustomer: rawProfile.targetCustomer || "Early stage founders",
      monthlyBudget: Number(rawProfile.monthlyBudget) || 0,
      teamSize: Number(rawProfile.teamSize) || 1,
      currentUsers: Number(rawProfile.currentUsers) || 0,
      monthlyRevenue: Number(rawProfile.monthlyRevenue) || 0,
      biggestUncertainty: rawProfile.biggestUncertainty || "Can't get users",
      goal90Days: rawProfile.goal90Days || "Reach 100 active users"
    };

    const ai = getAi(req);

    if (ai) {
      try {
        const prompt = `You are FounderZero AI Startup Diagnostic Engine. Analyze this startup:
Name: ${profile.name}
Stage: ${profile.stage}
Description: ${profile.description}
Problem: ${profile.problem}
Target Customer: ${profile.targetCustomer}
Budget: ₹${profile.monthlyBudget}/mo
Team Size: ${profile.teamSize}
Users: ${profile.currentUsers}
Monthly Revenue: ₹${profile.monthlyRevenue}
Uncertainty: ${profile.biggestUncertainty}
90-Day Goal: ${profile.goal90Days}

Provide a concise, high-impact growth diagnosis JSON containing:
1. primaryBottleneck (string)
2. top3NextActions (array of { title, whyItMatters, expectedImpact, time, cost })
3. top2DontDoYet (array of { action, reason, risk, alternative })
4. strategicInsight (string)

Return strictly valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, diagnosis: parsed });
        }
      } catch (e) {
        console.error("Gemini diagnose error:", e);
      }
    }

    // Fallback deterministic rule-based response
    return res.json({
      success: true,
      diagnosis: {
        primaryBottleneck: profile.stage === "Idea" || profile.stage === "Validating" ? "Problem & Customer Validation" : profile.currentUsers < 100 ? "Distribution & User Acquisition" : "User Retention & Onboarding Activation",
        top3NextActions: [
          {
            title: `Interview 5 ${profile.stage === "Idea" ? "potential target customers" : "active users"}`,
            whyItMatters: "Direct customer feedback uncovers the true core pain point and core value loop.",
            expectedImpact: "Prevents building unvalidated features and boosts retention.",
            time: "3 hours",
            cost: "₹0",
          },
          {
            title: "Publish 2 organic build-in-public breakdowns on Reddit & X",
            whyItMatters: "Zero-budget community posts build trust and acquire high-intent signups.",
            expectedImpact: "+25 to 50 targeted signups at ₹0 CAC",
            time: "2.5 hours",
            cost: "₹0",
          },
          {
            title: "Simplify onboarding setup to under 2 minutes",
            whyItMatters: "Eliminates setup friction before users drop off.",
            expectedImpact: "Boosts activation rate by 15%",
            time: "2 hours",
            cost: "₹0",
          },
        ],
        top2DontDoYet: [
          {
            action: "Do NOT spend money on Meta or Google Ads yet",
            reason: `Your revenue is ₹${profile.monthlyRevenue} and retention needs stabilization. Paid ads will drain budget.`,
            risk: "High capital waste.",
            alternative: "Focus on zero-budget community distribution.",
          },
          {
            action: "Do NOT build custom enterprise permissions or complex settings yet",
            reason: "Focus 100% on the single feature driving core retention.",
            risk: "Wasted developer hours.",
            alternative: "Focus on onboarding time-to-value.",
          },
        ],
        strategicInsight: `Your startup '${profile.name}' is currently at '${profile.stage}' stage. Focus 80% of bandwidth on ${profile.stage === "Idea" ? "customer problem interviews" : "repeatable zero-budget distribution"}.`,
      },
    });
  });

  app.post("/api/ai/reality-check", async (req: Request, res: Response) => {
    const body = req.body || {};
    const decisionClaim = body.decisionClaim || "Spend budget on marketing";
    const profile = body.profile || body.state?.profile || {};
    const ai = getAi(req);

    if (ai) {
      try {
        const prompt = `You are FounderZero Reality Check Engine. A founder proposed this decision:
Decision Claim: "${decisionClaim}"

Startup Context:
Name: ${profile?.name || "Startup"}
Stage: ${profile?.stage || "Launched"}
Users: ${profile?.currentUsers || 0}
Monthly Revenue: ₹${profile?.monthlyRevenue || 0}
Monthly Budget: ₹${profile?.monthlyBudget || 0}

Analyze this decision with founder empathy, direct discipline, and capital efficiency.
Return JSON with:
{
  "decisionClaim": "${decisionClaim}",
  "actualEvidence": "What is actually proven by data right now",
  "missingEvidence": "What crucial evidence has NOT been proven yet",
  "counterargument": "The strongest reason this founder might be wrong",
  "risk": "What could go wrong if they execute this immediately",
  "betterAlternative": "A much cheaper or safer zero-budget experiment to run first",
  "recommendedDecision": "REJECT, CAUTION, or PROCEED WITH TEST",
  "confidence": "High" | "Medium" | "Low",
  "evidenceStrength": "Weak" | "Moderate" | "Strong",
  "estimatedCost": "Estimated financial or time risk",
  "potentialDownside": "Worst-case scenario summary"
}
Return strictly valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, realityCheck: parsed });
        }
      } catch (e) {
        console.error("Gemini reality check error:", e);
      }
    }

    // Fallback deterministic analysis
    const claimLower = decisionClaim.toLowerCase();
    const isAds = claimLower.includes("ad") || claimLower.includes("paid") || claimLower.includes("spend") || claimLower.includes("facebook") || claimLower.includes("google");
    const isHire = claimLower.includes("hire") || claimLower.includes("agency") || claimLower.includes("developer");

    return res.json({
      success: true,
      realityCheck: {
        decisionClaim,
        actualEvidence: `Current startup stage is ${profile?.stage || "Launched"} with ${profile?.currentUsers || 0} users and ₹${profile?.monthlyRevenue || 0} MRR.`,
        missingEvidence: isAds
          ? "Zero evidence that paid ad traffic converts into sticky, long-term paying subscribers."
          : isHire
          ? "Zero evidence that outsourcing core work will increase product-market fit."
          : "Lack of quantitative conversion testing and direct customer validation.",
        counterargument: isAds
          ? "Paying for ad clicks when onboarding activation and retention are not optimized burns cash reserves with zero lasting ROI."
          : "Executing this decision now introduces unnecessary fixed costs before securing repeatable organic demand.",
        risk: isAds ? "Draining monthly startup budget on uncalibrated campaign tests." : "Losing operational flexibility and founder focus.",
        betterAlternative: isAds
          ? "Run 2 zero-budget community distribution experiments on Reddit/IndieHackers first."
          : "Do manual, unscalable founder outreach to validate willingness to pay.",
        recommendedDecision: isAds ? "CAUTION: Reject Paid Ads for Now" : "PROCEED WITH LOW-COST EXPERIMENT",
        confidence: "High",
        evidenceStrength: "Strong",
        estimatedCost: isAds ? `₹${profile?.monthlyBudget || 5000} budget risk` : "High time investment",
        potentialDownside: "Depleting runway without improving retention metrics.",
      },
    });
  });

  app.post("/api/ai/query", async (req: Request, res: Response) => {
    const body = req.body || {};
    const query = body.query || "How do I grow my startup on ₹0 budget?";
    const profile = body.profile || body.state?.profile || {};
    const ai = getAi(req);

    if (ai) {
      try {
        const prompt = `You are FounderZero Growth Coach. The founder asked: "${query}"

Startup State:
Name: ${profile?.name}
Stage: ${profile?.stage}
Users: ${profile?.currentUsers}
MRR: ₹${profile?.monthlyRevenue}
Monthly Budget: ₹${profile?.monthlyBudget}
Bottleneck: ${profile?.biggestUncertainty}

Give a direct, actionable, zero-budget advice response referencing their actual metrics and stage. Keep it structured in 3 clear bullet points + 1 key action step. No sales hype or generic fluff.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
        });

        if (response.text) {
          return res.json({ success: true, answer: response.text.trim() });
        }
      } catch (e) {
        console.error("Gemini query error:", e);
      }
    }

    // Fallback response
    return res.json({
      success: true,
      answer: `Here is the FounderZero analysis for **${profile?.name || "your startup"}** at **${profile?.stage || "current"}** stage:

• **Current Priority:** At ${profile?.currentUsers || 0} users and ₹${profile?.monthlyRevenue || 0} MRR, your top focus should be resolving your primary bottleneck: *${profile?.biggestUncertainty || "Acquisition"}*.
• **Zero-Budget Strategy:** Do NOT spend money on paid ads or tools yet. Leverage organic teardowns, build-in-public posts, and direct founder DM outreach on Twitter/LinkedIn/Reddit.
• **Evidence Rule:** Talk to 5 customers before making any major product or pricing changes.

**Your Recommended Next Step:** Complete the mission to interview 5 active users and log key pain points in Customer Insights.`,
    });
  });

  // --- RESOURCE INTELLIGENCE ENDPOINTS ---
  app.get("/api/resources", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const state = getAppState(userId);
    const resources = state.resources || [];
    
    const { category, subcategory, search, isOpenSource, isFree } = req.query;
    let filtered = [...resources];

    if (category && typeof category === "string") {
      filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    if (subcategory && typeof subcategory === "string") {
      filtered = filtered.filter(r => r.subcategory.toLowerCase() === subcategory.toLowerCase());
    }

    if (isOpenSource === "true") {
      filtered = filtered.filter(r => r.isOpenSource);
    }

    if (isFree === "true") {
      filtered = filtered.filter(r => r.isFree || r.pricingType === "free" || r.pricingType === "open_source");
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return res.json({ count: filtered.length, resources: filtered });
  });

  app.post("/api/resources", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const state = getAppState(userId);
    const newResource = req.body;

    if (!newResource || !newResource.title) {
      return res.status(400).json({ error: "Resource title is required" });
    }

    const resources = state.resources || [];
    const existingIndex = resources.findIndex(r => r.id === newResource.id);

    if (existingIndex >= 0) {
      resources[existingIndex] = { ...resources[existingIndex], ...newResource, updatedAt: new Date().toISOString() };
    } else {
      const createdResource = {
        ...newResource,
        id: newResource.id || "res-custom-" + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: newResource.status || "active",
        qualityScore: newResource.qualityScore || 85,
        lastVerifiedAt: new Date().toISOString().substring(0, 7)
      };
      resources.unshift(createdResource);
    }

    state.resources = resources;
    saveAppState(userId, state);
    return res.json({ success: true, resources });
  });

  app.post("/api/resources/:id/verify", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const state = getAppState(userId);
    const resourceId = req.params.id;

    const resources = state.resources || [];
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    resource.lastVerifiedAt = new Date().toISOString().substring(0, 7);
    resource.status = "active";
    resource.updatedAt = new Date().toISOString();

    state.resources = resources;
    saveAppState(userId, state);
    return res.json({ success: true, resource });
  });

  app.post("/api/resources/interaction", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req);
    const state = getAppState(userId);
    const { resourceId, interactionType, notes } = req.body;

    if (!resourceId || !interactionType) {
      return res.status(400).json({ error: "resourceId and interactionType are required" });
    }

    const interactions = state.resourceInteractions || [];
    const existingIdx = interactions.findIndex(i => i.resourceId === resourceId && i.interactionType === interactionType);

    if (existingIdx >= 0) {
      // Toggle off if clicking saved again
      if (interactionType === "saved") {
        interactions.splice(existingIdx, 1);
      } else {
        interactions[existingIdx].notes = notes;
      }
    } else {
      interactions.push({
        id: "int-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        userId,
        startupId: state.profile.id,
        resourceId,
        interactionType,
        createdAt: new Date().toISOString(),
        notes
      });
    }

    state.resourceInteractions = interactions;
    saveAppState(userId, state);
    return res.json({ success: true, interactions: state.resourceInteractions });
  });

  // --- FOUNDER VAULT ENDPOINTS ---

  // Get user's personal vault resources & stats
  app.get("/api/vault/resources", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const saved = state.savedResources || [];

    // Stats breakdown
    const stats = {
      total: saved.length,
      tools: saved.filter(r => r.resourceType === "tool" || r.resourceType === "coding_agent" || r.resourceType === "ide").length,
      articles: saved.filter(r => r.resourceType === "article").length,
      newsletters: saved.filter(r => r.resourceType === "newsletter").length,
      repositories: saved.filter(r => r.resourceType === "repository").length,
      courses: saved.filter(r => r.resourceType === "course").length,
      videos: saved.filter(r => r.resourceType === "video").length,
      other: saved.filter(r => !["tool", "coding_agent", "ide", "article", "newsletter", "repository", "course", "video"].includes(r.resourceType)).length,
      unread: saved.filter(r => r.status === "unread").length,
      reading: saved.filter(r => r.status === "reading").length,
      completed: saved.filter(r => r.status === "completed").length,
      unsorted: saved.filter(r => r.category === "Unsorted" || !r.category || (r.collections && r.collections.length === 0)).length
    };

    return res.json({
      success: true,
      count: saved.length,
      stats,
      collections: state.vaultCollections || [],
      resources: saved
    });
  });

  // Smart URL metadata extraction
  app.post("/api/vault/extract-url-meta", async (req: Request, res: Response) => {
    const { url } = req.body || {};
    if (!url || typeof url !== "string" || !url.trim()) {
      return res.status(400).json({ error: "URL is required" });
    }

    const cleanUrl = url.trim();
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);

    // 1. Check if URL matches existing curated resource in FounderZero DB
    const existingCurated = (state.resources || []).find(r => {
      const rUrl = (r.url || "").toLowerCase().replace(/\/+$/, "");
      const cUrl = cleanUrl.toLowerCase().replace(/\/+$/, "");
      return rUrl === cUrl || (cUrl.includes("github.com/") && rUrl.includes(cUrl.replace("https://github.com/", "")));
    });

    if (existingCurated) {
      return res.json({
        success: true,
        extracted: {
          url: existingCurated.url || cleanUrl,
          title: existingCurated.title,
          description: existingCurated.description,
          resourceType: existingCurated.resourceType,
          category: existingCurated.subcategory || "Development",
          tags: existingCurated.tags || [],
          suggestedStage: existingCurated.startupStages?.[0] || "Building MVP",
          relevantProblem: existingCurated.founderGoals?.[0] || "MVP Build",
          relevantSkill: existingCurated.skillsRequired?.[0] || "Software Engineering",
          isOpenSource: existingCurated.isOpenSource || false,
          githubRepo: existingCurated.codingAgentDetails?.repositoryUrl?.replace("https://github.com/", "") || undefined,
          source: existingCurated.source || "FounderZero Curated",
          author: "",
          readingTimeMinutes: existingCurated.articleDetails?.readingTimeMinutes || 5,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanUrl.replace(/^https?:\/\//i, '').split('/')[0])}&sz=64`,
          isCurated: true,
          resourceId: existingCurated.id
        }
      });
    }

    // 2. Heuristic domain intelligence
    let domain = "";
    try {
      domain = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`).hostname;
    } catch {
      domain = cleanUrl.split("/")[0];
    }

    let defaultType: any = "website";
    let defaultCategory = "Development";
    let defaultTags: string[] = [];
    let defaultTitle = domain;
    let defaultDescription = `Saved resource from ${domain}`;
    let isOpenSource = false;
    let githubRepo: string | undefined = undefined;

    if (domain.includes("github.com")) {
      const parts = cleanUrl.replace(/^https?:\/\/(www\.)?github\.com\//i, "").split("/");
      const repoName = parts.slice(0, 2).join("/");
      defaultType = parts.length > 1 ? "repository" : "website";
      defaultCategory = "Development";
      defaultTags = ["AI", "Open Source", "Developer Tools", "GitHub"];
      defaultTitle = repoName || "GitHub Repository";
      defaultDescription = `Open-source repository on GitHub (${repoName}).`;
      isOpenSource = true;
      githubRepo = repoName;
    } else if (domain.includes("substack.com") || domain.includes("medium.com") || domain.includes("blog")) {
      defaultType = "newsletter";
      defaultCategory = "Growth";
      defaultTags = ["SaaS", "Growth", "Newsletter", "Startup Strategy"];
      defaultTitle = `Article from ${domain}`;
    } else if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
      defaultType = "video";
      defaultCategory = "Product";
      defaultTags = ["Video", "Tutorial", "Founders"];
    } else if (domain.includes("news.ycombinator.com") || domain.includes("reddit.com") || domain.includes("twitter.com") || domain.includes("x.com")) {
      defaultType = "community";
      defaultCategory = "Growth";
      defaultTags = ["Community", "Discussion", "Indie Hackers"];
    } else if (domain.includes("docs.") || cleanUrl.includes("/docs")) {
      defaultType = "documentation";
      defaultCategory = "Development";
      defaultTags = ["Documentation", "API", "Developer Tools"];
    }

    // 3. AI Enrichment with Gemini if available
    const ai = getAi(req);
    if (ai) {
      try {
        const prompt = `You are FounderZero Smart URL Importer. Analyze this URL: "${cleanUrl}" (Domain: ${domain}).
Extract and predict structured metadata for a founder's knowledge vault.

Return JSON:
{
  "title": "Clear, concise title of tool, article, or repo",
  "description": "1-2 sentence tactical summary of what this tool/article/repo does for an early-stage startup founder",
  "resourceType": "tool" | "coding_agent" | "ide" | "article" | "newsletter" | "course" | "repository" | "template" | "website" | "documentation" | "video" | "community" | "other",
  "category": "Development" | "Growth" | "Product" | "AI Tools" | "Design" | "Fundraising" | "Operations" | "Legal",
  "tags": ["3 to 5 concise keyword tags"],
  "suggestedStage": "Idea" | "Validating" | "Building MVP" | "Launched" | "First Revenue" | "Growing",
  "relevantProblem": "Customer Acquisition" | "Retention" | "Pricing" | "MVP Build" | "Finding Customers" | "Fundraising" | "Zero Budget Stack",
  "relevantSkill": "Key skill involved (e.g. Prompt Engineering, SEO, Mom Test Interviews)",
  "isOpenSource": boolean,
  "githubRepo": "owner/repo if GitHub or null",
  "source": "Publisher or platform name",
  "author": "Author name if recognizable or null",
  "readingTimeMinutes": number
}
Strictly output valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            success: true,
            extracted: {
              url: cleanUrl,
              title: parsed.title || defaultTitle,
              description: parsed.description || defaultDescription,
              resourceType: parsed.resourceType || defaultType,
              category: parsed.category || defaultCategory,
              tags: Array.isArray(parsed.tags) ? parsed.tags : defaultTags,
              suggestedStage: parsed.suggestedStage || "Building MVP",
              relevantProblem: parsed.relevantProblem || "MVP Build",
              relevantSkill: parsed.relevantSkill || "General Startup Strategy",
              isOpenSource: parsed.isOpenSource ?? isOpenSource,
              githubRepo: parsed.githubRepo || githubRepo,
              source: parsed.source || domain,
              author: parsed.author || "",
              readingTimeMinutes: Number(parsed.readingTimeMinutes) || 5,
              faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
              isCurated: false
            }
          });
        }
      } catch (err) {
        console.error("Gemini URL metadata error:", err);
      }
    }

    // Return heuristic extraction
    return res.json({
      success: true,
      extracted: {
        url: cleanUrl,
        title: defaultTitle,
        description: defaultDescription,
        resourceType: defaultType,
        category: defaultCategory,
        tags: defaultTags.length > 0 ? defaultTags : ["Startup", "Resource"],
        suggestedStage: "Building MVP",
        relevantProblem: "Zero Budget Stack",
        relevantSkill: "General Startup Strategy",
        isOpenSource,
        githubRepo,
        source: domain,
        author: "",
        readingTimeMinutes: 5,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
        isCurated: false
      }
    });
  });

  // Save new resource to Vault (with duplicate detection)
  app.post("/api/vault/resources", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const body = req.body || {};

    if (!body.url && !body.title) {
      return res.status(400).json({ error: "URL or Title is required" });
    }

    const result = saveVaultResource(userId, body);
    const state = getAppState(userId);

    return res.json({
      success: true,
      saved: result.saved,
      isDuplicate: result.isDuplicate,
      existingId: result.existingId,
      message: result.isDuplicate ? "Already saved in your Founder Vault" : "Saved to Founder Vault",
      totalSaved: (state.savedResources || []).length
    });
  });

  // Update a saved resource in Vault
  app.put("/api/vault/resources/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const resourceId = req.params.id;
    const updates = req.body || {};

    const updated = updateVaultResource(userId, resourceId, updates);
    if (!updated) {
      return res.status(404).json({ error: "Saved resource not found in your Vault" });
    }

    return res.json({ success: true, resource: updated });
  });

  // Delete a saved resource from Vault
  app.delete("/api/vault/resources/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const resourceId = req.params.id;

    const deleted = deleteVaultResource(userId, resourceId);
    if (!deleted) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const state = getAppState(userId);
    return res.json({ success: true, totalSaved: (state.savedResources || []).length });
  });

  // Collections CRUD
  app.get("/api/vault/collections", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    return res.json({ success: true, collections: state.vaultCollections || [] });
  });

  app.post("/api/vault/collections", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const { name, description, icon, color } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    if (!state.vaultCollections) state.vaultCollections = [];

    const newCol = {
      id: "col-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      name: name.trim(),
      description: (description || "").trim(),
      icon: icon || "FolderHeart",
      color: color || "#0052FF",
      createdAt: new Date().toISOString()
    };

    state.vaultCollections.push(newCol);
    saveAppState(userId, state);

    return res.json({ success: true, collection: newCol, collections: state.vaultCollections });
  });

  app.put("/api/vault/collections/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const colId = req.params.id;
    const { name, description, icon, color } = req.body || {};

    if (!state.vaultCollections) state.vaultCollections = [];
    const col = state.vaultCollections.find(c => c.id === colId);
    if (!col) return res.status(404).json({ error: "Collection not found" });

    const oldName = col.name;
    if (name) col.name = name.trim();
    if (description !== undefined) col.description = description.trim();
    if (icon) col.icon = icon;
    if (color) col.color = color;

    // Update resources referencing this collection if renamed
    if (name && name !== oldName && state.savedResources) {
      state.savedResources.forEach(r => {
        if (r.collections) {
          r.collections = r.collections.map(c => c === oldName ? name.trim() : c);
        }
      });
    }

    saveAppState(userId, state);
    return res.json({ success: true, collection: col, collections: state.vaultCollections });
  });

  app.delete("/api/vault/collections/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const colId = req.params.id;

    if (!state.vaultCollections) return res.status(404).json({ error: "Collection not found" });
    const col = state.vaultCollections.find(c => c.id === colId);
    if (!col) return res.status(404).json({ error: "Collection not found" });

    state.vaultCollections = state.vaultCollections.filter(c => c.id !== colId);

    // Remove collection reference from resources without deleting the resource
    if (state.savedResources) {
      state.savedResources.forEach(r => {
        if (r.collections) {
          r.collections = r.collections.filter(c => c !== col.name && c !== colId);
        }
      });
    }

    saveAppState(userId, state);
    return res.json({ success: true, collections: state.vaultCollections });
  });

  // Natural Language Vault Search (searches ONLY founder's private vault)
  app.post("/api/vault/natural-search", async (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const { query } = req.body || {};
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const state = getAppState(userId);
    const saved = state.savedResources || [];

    if (saved.length === 0) {
      return res.json({
        success: true,
        query,
        matchedResources: [],
        insight: "Your Founder Vault is currently empty. Save tools, repos, and articles to search them with natural language."
      });
    }

    const ai = getAi();
    if (ai) {
      try {
        const vaultIndex = saved.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          type: r.resourceType,
          category: r.category,
          tags: r.tags,
          notes: r.notes,
          collections: r.collections,
          url: r.url
        }));

        const prompt = `You are FounderZero Private Vault Assistant.
The founder asked: "${query}"

Here are the founder's saved private resources (JSON):
${JSON.stringify(vaultIndex)}

Find the most relevant items that match the user's intent.
Return JSON:
{
  "matchedIds": ["id1", "id2"],
  "insight": "Brief 1-2 sentence conversational answer summarizing why these items matched and how the founder can use them."
}
Strictly output valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const matchedIds: string[] = parsed.matchedIds || [];
          const matched = saved.filter(r => matchedIds.includes(r.id));
          return res.json({
            success: true,
            query,
            matchedResources: matched.length > 0 ? matched : saved.slice(0, 3),
            insight: parsed.insight || `Found ${matched.length} relevant items in your Vault.`
          });
        }
      } catch (err) {
        console.error("Gemini natural vault search error:", err);
      }
    }

    // Heuristic keyword matching
    const qLower = query.toLowerCase();
    const keywords = qLower.split(/\s+/).filter(k => k.length > 2);
    const scored = saved.map(r => {
      let score = 0;
      const text = `${r.title} ${r.description} ${r.notes} ${(r.tags || []).join(" ")} ${r.category} ${r.resourceType} ${(r.collections || []).join(" ")}`.toLowerCase();
      keywords.forEach(kw => {
        if (text.includes(kw)) score += 1;
      });
      return { resource: r, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    return res.json({
      success: true,
      query,
      matchedResources: scored.slice(0, 5).map(s => s.resource),
      insight: scored.length > 0 ? `Found ${scored.length} saved resources matching "${query}".` : `No direct matches found in your Vault for "${query}".`
    });
  });

  // Batch AI Organization for Unsorted resources
  app.post("/api/vault/batch-organize", async (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const saved = state.savedResources || [];

    const unsorted = saved.filter(r => r.category === "Unsorted" || !r.category || (r.collections && r.collections.length === 0));

    if (unsorted.length === 0) {
      return res.json({ success: true, organizedCount: 0, message: "All resources are already organized!" });
    }

    const ai = getAi(req);
    if (ai) {
      try {
        const items = unsorted.map(r => ({ id: r.id, title: r.title, description: r.description, url: r.url }));
        const prompt = `Categorize and organize these startup founder resources into standard categories ('Development', 'Growth', 'Product', 'AI Tools', 'Design', 'Fundraising', 'Operations') and suitable collections ('MVP Tools', 'Marketing Ideas', 'AI Tools', 'Read Later', 'Useful GitHub Repos'):
${JSON.stringify(items)}

Return JSON array of suggestions:
[
  { "id": "id", "category": "Development", "tags": ["tag1", "tag2"], "collections": ["MVP Tools"] }
]`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        if (response.text) {
          const suggestions = JSON.parse(response.text.trim());
          if (Array.isArray(suggestions)) {
            suggestions.forEach(s => {
              const item = saved.find(r => r.id === s.id);
              if (item) {
                if (s.category) item.category = s.category;
                if (Array.isArray(s.tags) && s.tags.length > 0) item.tags = s.tags;
                if (Array.isArray(s.collections) && s.collections.length > 0) {
                  item.collections = Array.from(new Set([...(item.collections || []), ...s.collections]));
                }
                item.updatedAt = new Date().toISOString();
              }
            });
            saveAppState(userId, state);
            return res.json({ success: true, organizedCount: suggestions.length, message: `Organized ${suggestions.length} resources with AI.` });
          }
        }
      } catch (err) {
        console.error("AI batch organize error:", err);
      }
    }

    // Heuristic organization
    unsorted.forEach(r => {
      if (r.url.includes("github.com")) {
        r.category = "Development";
        r.collections = ["Useful GitHub Repos", "MVP Tools"];
      } else if (r.resourceType === "article" || r.resourceType === "newsletter") {
        r.category = "Growth";
        r.collections = ["Read Later"];
      } else {
        r.category = "Product";
        r.collections = ["Things To Try"];
      }
      r.updatedAt = new Date().toISOString();
    });

    saveAppState(userId, state);
    return res.json({ success: true, organizedCount: unsorted.length, message: `Organized ${unsorted.length} resources into appropriate categories.` });
  });

  // Contextual Vault Surfacing
  app.get("/api/vault/surface-contextual", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const saved = (state.savedResources || []).filter(r => !r.dismissedFromSurfacing);

    if (saved.length === 0) {
      return res.json({ success: true, surfaced: [] });
    }

    const suggestions: any[] = [];
    const profile = state.profile;
    const bottleneck = profile?.biggestUncertainty || "Can't get users";

    // Check bottleneck matches (e.g. Retention, Acquisition)
    const bottleneckKeywords = bottleneck.toLowerCase().includes("stay") || bottleneck.toLowerCase().includes("retention")
      ? ["retention", "churn", "cohort", "activation", "onboarding"]
      : bottleneck.toLowerCase().includes("get users") || bottleneck.toLowerCase().includes("market")
      ? ["acquisition", "distribution", "marketing", "customers", "growth", "referrals"]
      : ["validation", "interview", "pricing", "mvp"];

    const matchingBottleneck = saved.find(r => {
      const text = `${r.title} ${r.description} ${r.notes} ${(r.tags || []).join(" ")} ${r.relevantProblem || ""}`.toLowerCase();
      return bottleneckKeywords.some(kw => text.includes(kw));
    });

    if (matchingBottleneck) {
      suggestions.push({
        resource: matchingBottleneck,
        reason: `Your current bottleneck is "${bottleneck}". You previously saved this resource which directly addresses it.`,
        triggerType: "bottleneck",
        savedDaysAgo: Math.max(1, Math.floor((Date.now() - new Date(matchingBottleneck.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
        triggerContext: bottleneck
      });
    }

    // Check active missions
    const activeMission = (state.missions || []).find(m => !m.completed);
    if (activeMission) {
      const missionWords = activeMission.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const missionMatch = saved.find(r => {
        if (matchingBottleneck && r.id === matchingBottleneck.id) return false;
        const text = `${r.title} ${r.description} ${(r.tags || []).join(" ")}`.toLowerCase();
        return missionWords.some(w => text.includes(w));
      });
      if (missionMatch) {
        suggestions.push({
          resource: missionMatch,
          reason: `You are currently working on Mission: "${activeMission.title}". This saved resource can help you complete it faster.`,
          triggerType: "mission",
          savedDaysAgo: Math.max(1, Math.floor((Date.now() - new Date(missionMatch.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
          triggerContext: activeMission.title
        });
      }
    }

    return res.json({ success: true, surfaced: suggestions });
  });

  // ==========================================
  // --- FOUNDER COPILOT API ENDPOINTS ---
  // ==========================================

  // 1. Get all Copilot conversations
  app.get("/api/copilot/conversations", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    return res.json({
      success: true,
      conversations: state.copilotConversations || []
    });
  });

  // 2. Create a new Copilot conversation
  app.post("/api/copilot/conversations", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const { title, mode } = req.body || {};

    if (!state.copilotConversations) state.copilotConversations = [];
    if (!state.copilotMessages) state.copilotMessages = {};

    const newConv: CopilotConversation = {
      id: "conv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId,
      startupId: state.profile?.id || "startup-" + userId,
      title: (title || "New Discussion").trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      lastMessagePreview: "",
      messagesCount: 0,
      mode: mode || "default"
    };

    state.copilotConversations.unshift(newConv);
    state.copilotMessages[newConv.id] = [];
    saveAppState(userId, state);

    return res.json({ success: true, conversation: newConv });
  });

  // 3. Update Copilot conversation (title, pin, tags)
  app.put("/api/copilot/conversations/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const convId = req.params.id;
    const { title, pinned, tags } = req.body || {};

    if (!state.copilotConversations) return res.status(404).json({ error: "No conversations found" });
    const conv = state.copilotConversations.find(c => c.id === convId);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    if (title !== undefined) conv.title = title.trim();
    if (pinned !== undefined) conv.pinned = Boolean(pinned);
    if (Array.isArray(tags)) conv.tags = tags;
    conv.updatedAt = new Date().toISOString();

    saveAppState(userId, state);
    return res.json({ success: true, conversation: conv });
  });

  // 4. Delete Copilot conversation
  app.delete("/api/copilot/conversations/:id", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const convId = req.params.id;

    if (state.copilotConversations) {
      state.copilotConversations = state.copilotConversations.filter(c => c.id !== convId);
    }
    if (state.copilotMessages) {
      delete state.copilotMessages[convId];
    }

    saveAppState(userId, state);
    return res.json({ success: true, deletedId: convId });
  });

  // 5. Get messages for a conversation
  app.get("/api/copilot/conversations/:id/messages", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const convId = req.params.id;
    const messages = (state.copilotMessages && state.copilotMessages[convId]) || [];
    return res.json({ success: true, messages });
  });

  // 6. Send message to Copilot (Intelligent Context Retrieval + Gemini Reasoning)
  app.post("/api/copilot/chat", async (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const { conversationId, message, mode } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const cleanMessage = message.trim();
    const effectiveMode = mode || "default";

    if (!state.copilotConversations) state.copilotConversations = [];
    if (!state.copilotMessages) state.copilotMessages = {};

    let conv = state.copilotConversations.find(c => c.id === conversationId);
    let targetConvId = conversationId;

    if (!conv) {
      targetConvId = "conv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      conv = {
        id: targetConvId,
        userId,
        startupId: state.profile?.id || "startup-" + userId,
        title: cleanMessage.length > 35 ? cleanMessage.slice(0, 35) + "..." : cleanMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        lastMessagePreview: cleanMessage,
        messagesCount: 0,
        mode: effectiveMode
      };
      state.copilotConversations.unshift(conv);
    }

    if (!state.copilotMessages[targetConvId]) {
      state.copilotMessages[targetConvId] = [];
    }

    // 1. Create and store user message
    const userMsg: CopilotMessage = {
      id: "msg-u-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      conversationId: targetConvId,
      role: "user",
      content: cleanMessage,
      timestamp: new Date().toISOString(),
      mode: effectiveMode
    };
    state.copilotMessages[targetConvId].push(userMsg);

    // 2. Run Intelligent Context Retrieval
    const retrievedContext = retrieveRelevantContext(cleanMessage, effectiveMode, state);

    let assistantContent = "";
    let evidenceBreakdown = {
      knownData: [
        { label: "Startup", value: state.profile?.name || "PulseBoard" },
        { label: "Stage", value: state.profile?.stage || "Validating" },
        { label: "MRR", value: `₹${(state.profile?.monthlyRevenue || 0).toLocaleString()}` }
      ],
      founderAssumptions: ["Assumption that technical founders require real-time dashboarding"],
      inferences: ["Push-based notifications directly into Discord/Slack will decrease churn by 50%"],
      generalKnowledge: ["Bootstrapped SaaS PMF is characterized by high 30-day organic retention"]
    };
    let actionProposal: any = undefined;
    let detectedIntent = retrievedContext.detectedIntent;
    let insufficientWarning = false;

    // 3. Invoke Gemini AI model if available
    const ai = getAi(req);
    if (ai) {
      try {
        const systemPrompt = buildCopilotSystemPrompt(retrievedContext.contextPromptText, effectiveMode);
        const prompt = `${systemPrompt}\n\nUSER'S QUESTION / PROMPT:\n"${cleanMessage}"\n\nGenerate direct, practical, evidence-driven advice with valid JSON.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.content) {
            assistantContent = parsed.content;
          }
          if (parsed.evidenceBreakdown) {
            evidenceBreakdown = parsed.evidenceBreakdown;
          }
          if (parsed.actionProposal && parsed.actionProposal.title) {
            actionProposal = {
              ...parsed.actionProposal,
              id: "prop-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
              status: "pending"
            };
          }
          if (parsed.intent) {
            detectedIntent = parsed.intent;
          }
          if (parsed.insufficientEvidenceWarning) {
            insufficientWarning = true;
          }
        }
      } catch (err) {
        console.error("Gemini Copilot execution error:", err);
      }
    }

    // 4. Fallback Heuristic Reasoning if AI failed or not configured
    if (!assistantContent) {
      const p = state.profile || ({} as any);
      const m = state.metrics || [];
      const f = state.customerFeedback || [];
      const retMetric = m.find(item => item.name.toLowerCase().includes("retention"))?.currentValue || "41%";

      if (effectiveMode === "reality-check" || cleanMessage.toLowerCase().includes("ad") || cleanMessage.toLowerCase().includes("spend")) {
        assistantContent = `### Reality Check: REJECT PREMATURE SPEND

**Recommendation**: Do not allocate budget to paid ads or external marketing yet.

#### Evidence Breakdown:
- **Known Data**: Your monthly budget is ₹${(p.monthlyBudget || 2000).toLocaleString()}, MRR is ₹${(p.monthlyRevenue || 0).toLocaleString()}, and 7-day retention is ${retMetric}.
- **Founder Assumption**: Paid traffic will convert without high organic retention.
- **AI Inference**: Spending ₹50,000 on ads with a 41% retention bucket results in a 95% capital loss within 14 days.

#### Direct Next Step:
Execute an organic community launch sprint (Show HN, IndieHackers milestone, developer Discord outreach) to prove that users retain for 30 days before spending money.`;

        actionProposal = {
          id: "prop-" + Date.now(),
          type: "create_mission",
          title: "Run Organic Community Distribution Sprint",
          description: "Acquire 50 high-intent developer signups with zero ad spend via Show HN and Reddit teardowns.",
          status: "pending",
          missionData: {
            title: "Acquire 50 Organic Users via Community Teardown",
            category: "Growth",
            objective: "Validate retention bucket without spending advertising capital.",
            whyItMatters: "Zero-burn distribution protects runway while calibrating onboarding.",
            estimatedTime: "3 hours",
            estimatedCost: "₹0",
            difficulty: "Medium",
            expectedResult: "50 qualified developer signups.",
            steps: [
              { id: "s1", text: "Draft technical breakdown of zero-bloat architecture on Show HN", completed: false },
              { id: "s2", text: "Post interactive demo sandbox with no signup password wall", completed: false },
              { id: "s3", text: "Collect 10 qualitative feedback reviews on Discord", completed: false }
            ]
          }
        };
      } else if (cleanMessage.toLowerCase().includes("retention") || cleanMessage.toLowerCase().includes("drop") || cleanMessage.toLowerCase().includes("churn")) {
        assistantContent = `### Retention Diagnosis & Leverage Point

Based on your telemetry, your **7-day retention is currently ${retMetric}** (target benchmark: 55%+). 

#### Based on your data:
- **Activation Drop-off**: 52% of visitors who signup do not complete initial API key integration.
- **Customer Interviews**: 4 out of 5 founders requested an automated daily Discord/Slack webhook rather than visiting a web portal.

#### My Recommendation:
Do NOT build more analytics charts. Instead, build a **1-click Discord daily digest webhook** so the core value arrives in the founder's existing daily workspace.`;

        actionProposal = {
          id: "prop-" + Date.now(),
          type: "create_experiment",
          title: "Launch 1-Click Discord Retention Digest Experiment",
          description: "Test if delivering daily digests to Discord increases Day-7 retention from 41% to 55%.",
          status: "pending",
          experimentData: {
            title: "Automated Discord Digest Webhook vs Web Login",
            hypothesis: "If we deliver daily telemetry snapshots directly into user Discord channels, then Day-7 retention will increase from 41% to 55% because founders avoid browser tab friction.",
            problem: "Founders forget to log into the web dashboard daily.",
            metric: "Day-7 Retention Rate",
            currentValue: String(retMetric),
            targetValue: "55%",
            method: "Offer 1-click Discord webhook connect in onboarding for next 50 signups",
            audience: "New signups",
            duration: "14 days",
            budget: "₹0"
          }
        };
      } else {
        assistantContent = `### Strategic Synthesis for ${p.name || 'Your Startup'}

Here is my direct assessment based on your current stage (**${p.stage || 'Validating'}**) and 90-day target (**${p.goal90Days || 'Reach PMF'}**):

1. **Core Leverage**: Focus all weekly energy on your single biggest bottleneck: **${p.biggestUncertainty || 'User Retention'}**.
2. **Execution Focus**: Talk to 3 active users directly to understand why they returned or dropped off.
3. **Zero-Budget Rule**: Keep infrastructure spend at ₹0 using verified open-source and free-tier tools.`;

        actionProposal = {
          id: "prop-" + Date.now(),
          type: "notepad_draft",
          title: "Save Founder Strategy Playbook to Notepad",
          description: "Save this action plan directly to your Strategy collection in Founder Notepad.",
          status: "pending",
          draftNote: {
            title: `${p.name || 'Startup'} Weekly Focus & Execution Playbook`,
            collection: "Strategy",
            tags: ["Strategy", "Focus", "Execution", "Zero-Budget"],
            blocks: [
              { id: "b1", type: "callout", content: `🎯 **Focus Rule**: 100% of effort goes into solving "${p.biggestUncertainty || 'User Retention'}".`, calloutVariant: "founder" },
              { id: "b2", type: "heading2", content: "Key Objectives for the Week" },
              { id: "b3", type: "checklist", content: "Complete 3 direct customer discovery interviews", checked: false },
              { id: "b4", type: "checklist", content: "Deploy 1-click Discord digest webhook", checked: false }
            ]
          }
        };
      }
    }

    // 5. Construct Assistant Message
    const assistantMsg: CopilotMessage = {
      id: "msg-a-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      conversationId: targetConvId,
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
      mode: effectiveMode,
      intent: detectedIntent,
      insufficientEvidenceWarning: insufficientWarning,
      retrievedContextSummary: retrievedContext.summary,
      sources: retrievedContext.sources,
      evidenceBreakdown,
      actionProposal
    };

    state.copilotMessages[targetConvId].push(assistantMsg);

    // Update conversation metadata
    conv.updatedAt = new Date().toISOString();
    conv.lastMessagePreview = assistantContent.replace(/[#*`_]/g, "").slice(0, 120) + "...";
    conv.messagesCount = state.copilotMessages[targetConvId].length;

    saveAppState(userId, state);

    return res.json({
      success: true,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      conversation: conv,
      state
    });
  });

  // 7. Confirm Copilot Action (Save to Notepad, Create Mission, Launch Experiment, etc.)
  app.post("/api/copilot/action/confirm", (req: Request, res: Response) => {
    const userId = getUserIdFromReq(req) || "demo-user-1";
    const state = getAppState(userId);
    const { conversationId, messageId, actionProposal } = req.body || {};

    if (!actionProposal || !actionProposal.type) {
      return res.status(400).json({ error: "Invalid action proposal" });
    }

    const type = actionProposal.type;
    let createdEntity: any = null;

    if (type === "notepad_draft" && actionProposal.draftNote) {
      if (!state.notes) state.notes = [];
      const newNote: FounderNote = {
        id: "note-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        title: actionProposal.draftNote.title || "Untitled Note",
        collection: actionProposal.draftNote.collection || "Strategy",
        tags: actionProposal.draftNote.tags || ["Copilot", "Strategy"],
        blocks: (actionProposal.draftNote.blocks || []).map((b: any, i: number) => ({
          ...b,
          id: b.id || `b-${Date.now()}-${i}`
        })),
        includeInKnowledgeBase: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.notes.unshift(newNote);
      createdEntity = newNote;

      if (!state.notifications) state.notifications = [];
      state.notifications.unshift({
        id: "notif-" + Date.now(),
        title: "Note Saved to Notepad",
        message: `Copilot created note: "${newNote.title}" in collection "${newNote.collection}".`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "action"
      });
    } else if (type === "create_mission" && actionProposal.missionData) {
      if (!state.missions) state.missions = [];
      const newMission = {
        id: "mis-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        title: actionProposal.missionData.title,
        category: actionProposal.missionData.category || "Growth",
        objective: actionProposal.missionData.objective,
        whyItMatters: actionProposal.missionData.whyItMatters,
        estimatedTime: actionProposal.missionData.estimatedTime || "3 hours",
        estimatedCost: actionProposal.missionData.estimatedCost || "₹0",
        difficulty: actionProposal.missionData.difficulty || "Medium",
        expectedResult: actionProposal.missionData.expectedResult,
        completed: false,
        steps: actionProposal.missionData.steps || []
      };
      state.missions.unshift(newMission);
      createdEntity = newMission;

      if (!state.activities) state.activities = [];
      state.activities.unshift({
        id: "act-" + Date.now(),
        title: `Launched Mission: ${newMission.title}`,
        description: newMission.objective,
        timestamp: new Date().toISOString(),
        type: "mission"
      });

      if (!state.notifications) state.notifications = [];
      state.notifications.unshift({
        id: "notif-" + Date.now(),
        title: "New Mission Created",
        message: `Founder Copilot created mission: "${newMission.title}".`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "mission"
      });
    } else if (type === "create_experiment" && actionProposal.experimentData) {
      if (!state.experiments) state.experiments = [];
      const newExp = {
        id: "exp-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        title: actionProposal.experimentData.title,
        hypothesis: actionProposal.experimentData.hypothesis,
        problem: actionProposal.experimentData.problem,
        metric: actionProposal.experimentData.metric,
        currentValue: actionProposal.experimentData.currentValue || "0",
        targetValue: actionProposal.experimentData.targetValue || "50%",
        method: actionProposal.experimentData.method || "In-app test",
        audience: actionProposal.experimentData.audience || "Active users",
        duration: actionProposal.experimentData.duration || "14 days",
        budget: actionProposal.experimentData.budget || "₹0",
        status: "Running" as const,
        createdAt: new Date().toISOString()
      };
      state.experiments.unshift(newExp);
      createdEntity = newExp;

      if (!state.activities) state.activities = [];
      state.activities.unshift({
        id: "act-" + Date.now(),
        title: `Launched Experiment: ${newExp.title}`,
        description: `Hypothesis: ${newExp.hypothesis}`,
        timestamp: new Date().toISOString(),
        type: "experiment"
      });

      if (!state.notifications) state.notifications = [];
      state.notifications.unshift({
        id: "notif-" + Date.now(),
        title: "New Experiment Launched",
        message: `Founder Copilot launched experiment: "${newExp.title}".`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "insight"
      });
    } else if (type === "save_resource" && actionProposal.savedResourceData) {
      if (!state.savedResources) state.savedResources = [];
      const newSaved = {
        id: "sv-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
        userId,
        startupId: state.profile?.id || "startup-" + userId,
        url: actionProposal.savedResourceData.url,
        title: actionProposal.savedResourceData.title,
        description: actionProposal.savedResourceData.notes || "",
        resourceType: actionProposal.savedResourceData.resourceType || "tool",
        category: actionProposal.savedResourceData.category || "Development",
        tags: ["Copilot", "Saved"],
        notes: actionProposal.savedResourceData.notes || "",
        priority: "medium" as const,
        status: "reading" as const,
        collections: actionProposal.savedResourceData.collections || ["MVP Tools"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.savedResources.unshift(newSaved);
      createdEntity = newSaved;
    } else if (type === "update_startup_profile" && actionProposal.profileUpdateData) {
      state.profile = {
        ...state.profile,
        ...actionProposal.profileUpdateData
      };
      createdEntity = state.profile;
    }

    // Mark message's actionProposal as confirmed in state
    if (conversationId && messageId && state.copilotMessages && state.copilotMessages[conversationId]) {
      const msg = state.copilotMessages[conversationId].find(m => m.id === messageId);
      if (msg && msg.actionProposal) {
        msg.actionProposal.status = "confirmed";
      }
    }

    saveAppState(userId, state);

    return res.json({
      success: true,
      createdEntity,
      type,
      state
    });
  });

  return app;
}

export const app = createApp();

async function startServer() {
  const PORT = 3000;

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
