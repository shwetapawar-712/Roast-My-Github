const axios = require('axios');

/**
 * AI Roast & Narration Service with Provider Abstraction (Gemini & Groq)
 * AI is strictly a narration and explanation layer. It receives deterministic
 * facts and scores, and writes punchy roasts, summaries, and recommendations.
 * AI NEVER decides or alters numerical scores or security findings.
 */

// Helper: Extract valid string fixes from findings without undefined/null
function extractValidFixes(findings) {
  if (!Array.isArray(findings)) return [];
  return findings
    .filter(f => f && f.score_impact < 0)
    .map(f => {
      const text = f.suggested_fix || f.fix || f.message;
      const repoStr = f.repository ? ` (${f.repository})` : '';
      return {
        category: (f.category || 'General').toUpperCase(),
        text: text ? `${text}${repoStr}` : `Review and resolve ${f.rule_id || 'issue'}`,
        impact: f.score_impact || -1
      };
    })
    .filter(item => Boolean(item.text && item.text.trim() && !item.text.includes('undefined')));
}

/**
 * Deterministic template fallback generator if AI key is missing or call fails.
 * Guarantees zero nulls and zero undefined strings.
 */
function generateFallbackRoast(facts) {
  const {
    username,
    targetName = username || 'Developer',
    targetType = 'profile',
    overall_score = null,
    overall_label = 'N/A — Insufficient repository data',
    categories = [],
    findings = [],
    repositories = [],
    intensity = 'brutal'
  } = facts;

  const validFixes = extractValidFixes(findings);
  const negativeFindings = (findings || []).filter(f => f && f.score_impact < 0);
  const criticalFindings = negativeFindings.filter(f => f.severity === 'critical');
  const docIssues = negativeFindings.filter(f => f.category === 'documentation');
  const staleIssues = negativeFindings.filter(f => f.category === 'activity');

  let roastTone = '';
  const isRepo = targetType === 'repository';
  const entityName = isRepo ? `repository "${targetName}"` : `@${targetName}'s profile`;
  const presCat = (categories || []).find(c => c.category === 'presentation');
  const presScore = presCat?.score !== null && presCat?.score !== undefined ? `${presCat.score}/100` : 'N/A';

  if (overall_score === null || repositories?.length === 0) {
    if (intensity === 'friendly') {
      roastTone = `Hey ${entityName}! We scanned your profile data (presentation scored at ${presScore}), but couldn't find any public original repositories to inspect. Add and document at least one original project so we can give you a full engineering score!`;
    } else if (intensity === 'nuclear') {
      roastTone = `☢️ GHOST TOWN ALERT ☢️: ${entityName} has zero original public repositories available to analyze. Profile presentation is sitting at ${presScore}, but we can't roast code that doesn't exist. Push some commits!`;
    } else {
      roastTone = `Hey ${entityName}, your profile presentation scored ${presScore}, but there are currently no analyzable public original repositories on this account. Repository-dependent health metrics are marked N/A until you publish an active project.`;
    }
  } else if (intensity === 'friendly') {
    roastTone = `Hey ${entityName}, looking solid! With a verified score of ${overall_score}/100 (${overall_label}), the foundation is clearly there. `;
    if (negativeFindings.length > 0) {
      roastTone += `A few quick wins around documentation and housekeeping will easily level up the presentation for visitors and collaborators.`;
    } else {
      roastTone += `Everything inspected in the deterministic audit looks clean, organized, and well maintained!`;
    }
  } else if (intensity === 'nuclear') {
    roastTone = `☢️ EMERGENCY ROAST ☢️: ${entityName} is sitting at a crisp ${overall_score}/100. `;
    if (criticalFindings.length > 0) {
      roastTone += `Potential credential or sensitive file patterns were detected in the root directory! Rotate those tokens immediately. `;
    }
    if (docIssues.length > 0) {
      roastTone += `The README situation is in dire need of attention—either setup steps are missing or preview demos are completely absent. `;
    }
    if (staleIssues.length > 0) {
      roastTone += `Some branches look like they haven't seen a commit since the previous decade. `;
    }
    if (negativeFindings.length === 0) {
      roastTone += `Surprisingly, our deterministic filters couldn't find a single hygiene flaw. Clean run!`;
    }
  } else {
    // Default Brutal
    roastTone = `Alright ${entityName}, let's look at the facts. Your overall verified score is ${overall_score}/100 (${overall_label}). `;
    if (negativeFindings.length > 0) {
      const topIssues = negativeFindings.slice(0, 3).map(f => f.message).join('; ');
      roastTone += `Primary flags raised during analysis: ${topIssues}. Polishing your documentation and repository hygiene will make a much stronger impression.`;
    } else {
      roastTone += `Passed all deterministic hygiene checks with flying colors. Clean setup, active commits, and zero credential exposures.`;
    }
  }

  const summary = isRepo
    ? `Repository audit completed for ${targetName}. Verified score: ${overall_score !== null ? `${overall_score}/100` : 'N/A'} with ${negativeFindings.length} actionable hygiene finding(s).`
    : repositories?.length === 0
      ? `Profile audit completed for @${targetName}. No analyzable public repositories found (repository health: N/A; presentation: ${presScore}).`
      : `Profile audit completed for @${targetName}. Analyzed ${repositories?.length || 0} public repositories, detecting ${negativeFindings.length} actionable hygiene finding(s) with a verified score of ${overall_score}/100.`;

  const recommendations = validFixes.length > 0
    ? validFixes.slice(0, 4).map(item => item.text)
    : [
      'Maintain current documentation standards across newly created projects.',
      'Keep commit cadence consistent.',
      'Continue proactive .gitignore maintenance.'
    ];

  const priority_actions = validFixes.length > 0
    ? validFixes
      .sort((a, b) => a.impact - b.impact)
      .slice(0, 4)
      .map((item, i) => `${i + 1}. [${item.category}] ${item.text}`)
    : [
      '1. [DOCUMENTATION] Ensure all featured repositories have a live demo or preview link.',
      '2. [SECURITY] Continue automated secret scanning with pre-commit hooks.',
      '3. [PRESENTATION] Keep portfolio links and topics refreshed.'
    ];

  return {
    roast: roastTone,
    summary,
    recommendations,
    priority_actions,
    isFallback: true,
    aiUnavailable: true,
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim(),
    notice: 'AI narration provider is currently unavailable or unconfigured. Displaying verified deterministic template grounded in audit findings.'
  };
}

/**
 * Validates AI output schema to guarantee integrity.
 * Cleans out any nulls, undefined values, or hallucinated scores.
 */
function sanitizeAndValidateAISchema(data, facts) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.roast !== 'string' || data.roast.trim().length < 10) return null;
  if (typeof data.summary !== 'string' || data.summary.trim().length < 10) return null;

  // Ensure recommendations is array of non-empty strings without null/undefined
  let recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
      .filter(r => typeof r === 'string' && r.trim().length > 0 && !r.toLowerCase().includes('undefined') && !r.toLowerCase().includes('null'))
      .map(r => r.trim())
    : [];

  let priority_actions = Array.isArray(data.priority_actions)
    ? data.priority_actions
      .filter(p => typeof p === 'string' && p.trim().length > 0 && !p.toLowerCase().includes('undefined') && !p.toLowerCase().includes('null'))
      .map(p => p.trim())
    : [];

  // Fallback defaults if array became empty
  if (recommendations.length === 0) {
    const fallback = generateFallbackRoast(facts);
    recommendations = fallback.recommendations;
  }
  if (priority_actions.length === 0) {
    const fallback = generateFallbackRoast(facts);
    priority_actions = fallback.priority_actions;
  }

  // Check score hallucination guard (only when overall_score is a real number)
  if (typeof facts.overall_score === 'number' && facts.overall_score !== null) {
    const scoreRegex = /(\b\d{1,3}\b)\s*\/\s*100/g;
    const categoryScores = Array.isArray(facts.categories)
      ? facts.categories.map(c => c.score).filter(s => typeof s === 'number')
      : [];
    let match;
    while ((match = scoreRegex.exec(data.roast)) !== null) {
      const citedScore = parseInt(match[1], 10);
      // Allow exact overall score, and allow valid category scores
      const isOverallScore = citedScore === facts.overall_score;
      const isCategoryScore = categoryScores.some(cs => cs === citedScore);
      if (!isOverallScore && !isCategoryScore) {
        console.warn(`[AI Guard] AI cited score ${citedScore}/100 which mismatches actual verified score ${facts.overall_score}. Falling back.`);
        return null;
      }
    }
  }

  return {
    roast: data.roast.trim(),
    summary: data.summary.trim(),
    recommendations,
    priority_actions,
    isFallback: false,
    aiUnavailable: false,
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim()
  };
}

/**
 * Builds the grounded system prompt and user prompt for LLM
 */
function buildPrompts(facts) {
  const {
    targetName,
    targetType = 'profile',
    overall_score,
    overall_label,
    categories = [],
    findings = [],
    intensity = 'brutal'
  } = facts;

  const negativeFindings = findings.filter(f => f.score_impact < 0);
  const toneInstruction = intensity === 'friendly'
    ? 'Tone: Encouraging, constructive, witty, and positive. Highlight strengths first while offering clear tips for improvement.'
    : intensity === 'nuclear'
      ? 'Tone: Exaggerated, high-energy, ruthless developer roaster. Savage tech humor about commits, READMEs, and missing setup instructions.'
      : 'Tone: Sarcastic, sharp, witty, brutal but fair. Classic developer humor based STRICTLY on the real facts.';

  const formattedOverall = overall_score !== null && overall_score !== undefined
    ? `${overall_score}/100 (${overall_label})`
    : 'N/A (Insufficient repository data - no original repositories available to audit)';

  const systemPrompt = `You are a legendary, hilarious, technical code reviewer for "Roast My GitHub" (tagline: "Your GitHub. Audited. Secured. Roasted.").
Your job is to generate a grounded roast, summary, recommendations, and priority actions based on a REAL deterministic audit.

CRITICAL RULES:
1. You must ONLY reference the deterministic facts provided to you. Do not invent or assume any data.
2. SCORE IS AUTHORITATIVE — The verified overall score is exactly ${formattedOverall}. This score was calculated by a deterministic audit engine and is the single source of truth.
3. If you mention the overall score anywhere in your response, you MUST copy it EXACTLY as ${overall_score}/100. You MUST NOT recalculate, estimate, round, or change this number under any circumstances.
4. NEVER invent repository names, fake commit history, fake vulnerabilities, or unmentioned secrets.
5. Recommendations and priority actions MUST be derived ONLY from the deterministic findings supplied to you.
6. If a category is marked N/A or has no repositories, explain that repository-level data was unavailable rather than claiming it is perfect or failed.
7. NEVER output null or undefined values anywhere in the response.
8. All recommendations and priority actions must be non-empty actionable strings.
9. Return ONLY valid, parseable JSON matching the exact schema. No markdown fences, no extra keys.`;

  const userPrompt = `Target: ${targetType.toUpperCase()} "${targetName}"
Verified Overall Score: ${formattedOverall}
IMPORTANT: The verified score above is authoritative. Do not recalculate or modify it. If you mention the overall score anywhere in your response, copy it exactly as ${overall_score}/100 — never a different number.
Intensity Mode: ${intensity.toUpperCase()}
${toneInstruction}

Deterministic Category Scores:
${categories.map(c => `- ${c.name || c.category}: ${c.score !== null && c.score !== undefined ? `${c.score}/100 (${c.penalties} penalty pts)` : `N/A - ${c.reason || 'No repository data'}`}`).join('\n')}

Key Deterministic Findings (${negativeFindings.length} issues):
${negativeFindings.slice(0, 10).map(f => `- [${f.severity.toUpperCase()}] [${f.category}] ${f.message}. Evidence: ${f.evidence || 'N/A'}. Suggested Fix: ${f.suggested_fix || f.fix}`).join('\n') || 'None detected! Clean audit.'}

Respond with pure JSON only matching this schema:
{
  "roast": "A 2-4 paragraph witty and grounded roast referencing the specific facts above",
  "summary": "A 1-2 sentence professional audit summary",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "priority_actions": [
    "1. [CATEGORY] Specific high-impact fix with repository name if applicable",
    "2. [CATEGORY] Specific high-impact fix with repository name if applicable",
    "3. [CATEGORY] Specific high-impact fix with repository name if applicable"
  ]
}`;

  return { systemPrompt, userPrompt };
}

/**
 * Calls Gemini API
 */
async function callGemini(facts) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-1.5-flash';
  const { systemPrompt, userPrompt } = buildPrompts(facts);
  console.log("Gemini Model:", model);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: 'application/json'
    }
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.trim()
    },
    timeout: 15000
  });

  const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) throw new Error('Empty response from Gemini API');

  return JSON.parse(candidate);
}

/**
 * Calls Groq API
 */
async function callGroq(facts) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const { systemPrompt, userPrompt } = buildPrompts(facts);

  const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq API');

  return JSON.parse(content);
}

/**
 * Main AI Generation Entry Point with Provider Abstraction
 */
async function generateRoast(facts) {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  try {
    let rawOutput;
    if (provider === 'groq') {
      rawOutput = await callGroq(facts);
    } else {
      rawOutput = await callGemini(facts);
    }

    const validated = sanitizeAndValidateAISchema(rawOutput, facts);
    if (validated) {
      return validated;
    }
    console.warn('[AI Service] AI output failed schema validation or hallucination check. Using deterministic fallback.');
    return generateFallbackRoast(facts);
  } catch (err) {
    console.warn(`[AI Service] AI generation via ${provider} failed (${err.message}). Using verified deterministic fallback template.`);
    return generateFallbackRoast(facts);
  }
}

module.exports = {
  generateRoast,
  generateFallbackRoast
};
