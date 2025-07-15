# AI Evaluation Criteria for Client Briefs

## Executive Summary

This document outlines the AI-powered evaluation system for assessing client briefs in MediaPlanPro. The system analyzes uploaded briefs across six key criteria to provide objective recommendations on whether to accept, review, or decline RFP opportunities.

### Key Features
- **Automated scoring** across 6 weighted criteria
- **Risk detection** with automatic red flags
- **Actionable recommendations** for improvement
- **Confidence scoring** for decision support

---

## Table of Contents

1. [Overview](#overview)
2. [Evaluation Criteria](#evaluation-criteria)
3. [Scoring Methodology](#scoring-methodology)
4. [Red Flags & Triggers](#red-flags--triggers)
5. [AI Output Format](#ai-output-format)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Example Evaluations](#example-evaluations)

---

## Overview

The AI evaluation system analyzes client briefs to determine their viability and alignment with MiQ's capabilities. Each brief receives a comprehensive score from 0-100, with clear recommendations for next steps.

### Recommendation Categories

| Score Range | Recommendation | Action | Visual |
|------------|----------------|---------|---------|
| 80-100 | **ACCEPT** | High-value opportunity, proceed with proposal | ✅ |
| 60-79 | **REVIEW** | Needs clarification before proceeding | ⚠️ |
| 0-59 | **DECLINE** | Too risky or misaligned | ❌ |

---

## Evaluation Criteria

### 1. Budget Viability (25% weight)

Assesses whether the client's budget aligns with their expectations and MiQ's minimum thresholds.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Budget Range** | "$50,000-$75,000" | "Mid-range budget" | "Budget TBD" |
| **Payment Terms** | "Net 30, 50% upfront" | "Standard terms" | Not mentioned |
| **Scope Alignment** | Budget matches deliverables | Slightly ambitious | Unrealistic expectations |

#### Scoring Logic
```javascript
budgetScore = calculateBudgetScore({
  hasSpecificBudget: 40,      // 40 points for clear budget
  budgetAboveMinimum: 30,     // 30 points if above $25K
  paymentTermsClear: 20,      // 20 points for payment clarity
  scopeAlignment: 10          // 10 points for realistic scope
});
```

### 2. Campaign Clarity (20% weight)

Evaluates how well-defined the campaign objectives, audience, and success metrics are.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Objectives** | "Increase brand awareness by 25% among target demo" | "Improve brand presence" | "Make brand popular" |
| **Target Audience** | "Women 25-34, HHI $75K+, urban markets" | "Young professionals" | "Everyone" |
| **KPIs** | "CTR >2%, 10M impressions, 5K conversions" | "Good engagement" | Not specified |
| **Deliverables** | "Display, video, social across 5 platforms" | "Digital campaign" | "Various channels" |

#### Scoring Logic
```javascript
clarityScore = calculateClarityScore({
  specificObjectives: 30,     // 30 points for SMART goals
  definedAudience: 25,        // 25 points for clear demographics
  measurableKPIs: 25,         // 25 points for specific metrics
  clearDeliverables: 20       // 20 points for channel clarity
});
```

### 3. Timeline Feasibility (20% weight)

Analyzes whether the proposed timeline allows for quality execution.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Lead Time** | "8 weeks until launch" | "4 weeks to launch" | "ASAP" or <2 weeks |
| **Campaign Duration** | "3-month campaign" | "1-month test" | Not specified |
| **Milestones** | "Week 2: Strategy, Week 4: Creative" | "Regular check-ins" | No milestones |
| **Revision Buffer** | "2 weeks for revisions" | "Some flexibility" | No buffer time |

#### Scoring Logic
```javascript
timelineScore = calculateTimelineScore({
  adequateLeadTime: 35,       // 35 points for 6+ weeks
  definedDuration: 25,        // 25 points for clear dates
  clearMilestones: 20,        // 20 points for phases
  revisionBuffer: 20          // 20 points for flexibility
});
```

### 4. Strategic Fit (15% weight)

Determines alignment with MiQ's core competencies and market presence.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Industry** | "E-commerce, retail" | "B2B software" | "Regulated pharma" |
| **Geography** | "US major metros" | "US + Canada" | "Global campaign" |
| **Channels** | "Programmatic display, CTV" | "Some traditional media" | "Print, radio focus" |
| **Technology** | "Standard tracking pixels" | "Custom integration needed" | "Proprietary platform" |

#### Scoring Logic
```javascript
strategicScore = calculateStrategicScore({
  industryExpertise: 30,      // 30 points for core verticals
  geographicCoverage: 25,     // 25 points for supported markets
  channelAlignment: 25,       // 25 points for MiQ strengths
  techRequirements: 20        // 20 points for platform fit
});
```

### 5. Brief Quality (10% weight)

Assesses the professionalism and completeness of the brief itself.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Completeness** | All sections filled, appendices included | Most sections complete | Many TBDs |
| **Organization** | Clear structure, branded template | Basic structure | Disorganized |
| **Supporting Data** | Market research, competitor analysis | Some background | No context |
| **Contacts** | Decision maker, day-to-day contact | Single contact | No clear contact |

### 6. Risk Assessment (10% weight)

Identifies potential red flags and risk factors.

#### Evaluation Points

| Criterion | Good Example | Warning Example | Poor Example |
|-----------|--------------|-----------------|--------------|
| **Client Reputation** | "Fortune 500 brand" | "Startup, Series B" | Unknown entity |
| **Competitive Conflicts** | "No conflicts" | "Different vertical" | Direct competitor |
| **Legal/Compliance** | "Standard terms" | "Some restrictions" | Heavy regulations |
| **Scope Creep** | "Fixed scope" | "Some flexibility expected" | "Evolving requirements" |

---

## Scoring Methodology

### Overall Score Calculation

```javascript
const calculateOverallScore = (criteria) => {
  return (
    criteria.budget * 0.25 +
    criteria.clarity * 0.20 +
    criteria.timeline * 0.20 +
    criteria.strategic * 0.15 +
    criteria.quality * 0.10 +
    criteria.risk * 0.10
  );
};
```

### Confidence Level Calculation

The AI provides a confidence level based on brief completeness:

| Information Completeness | Confidence Level |
|-------------------------|------------------|
| >90% fields populated | HIGH |
| 70-90% fields populated | MEDIUM |
| <70% fields populated | LOW |

---

## Red Flags & Triggers

### Automatic Decline Triggers

These conditions result in immediate decline recommendation:

1. ❌ **No budget information** - Cannot assess viability
2. ❌ **Timeline under 2 weeks** - Insufficient preparation time
3. ❌ **Illegal/unethical content** - Reputational risk
4. ❌ **Direct competitor conflict** - Contractual violations
5. ❌ **Known non-payment history** - Financial risk

### Warning Flags

These conditions trigger review recommendation:

1. ⚠️ **Vague objectives** - "Increase sales" without specifics
2. ⚠️ **Unrealistic expectations** - $1M results from $10K budget
3. ⚠️ **Multiple stakeholders** - No clear decision maker
4. ⚠️ **Scope volatility** - "Requirements may change"
5. ⚠️ **Equity/exposure payment** - Non-monetary compensation

---

## AI Output Format

### Standard JSON Response

```json
{
  "briefId": "RFP-2024-001",
  "evaluationDate": "2024-12-15T10:30:00Z",
  "overallScore": 75,
  "recommendation": "REVIEW",
  "confidenceLevel": "HIGH",
  
  "breakdown": {
    "budget": {
      "score": 85,
      "weight": 0.25,
      "notes": "Clear budget range $50-75K, payment terms specified"
    },
    "clarity": {
      "score": 70,
      "weight": 0.20,
      "notes": "Objectives clear but KPIs need specification"
    },
    "timeline": {
      "score": 90,
      "weight": 0.20,
      "notes": "8-week lead time with defined milestones"
    },
    "strategic": {
      "score": 65,
      "weight": 0.15,
      "notes": "Good channel fit, new geographic market"
    },
    "quality": {
      "score": 70,
      "weight": 0.10,
      "notes": "Professional brief, missing competitive analysis"
    },
    "risk": {
      "score": 80,
      "weight": 0.10,
      "notes": "Established brand, standard terms"
    }
  },
  
  "strengths": [
    "Well-known brand with clear budget",
    "Reasonable timeline with milestones",
    "Aligns with MiQ's programmatic expertise"
  ],
  
  "concerns": [
    "KPIs not specifically defined",
    "New geographic market (Canada)",
    "No competitive analysis provided"
  ],
  
  "actionItems": [
    "Request specific KPIs and success metrics",
    "Confirm Canadian market capabilities",
    "Ask for competitive landscape overview"
  ],
  
  "estimatedValue": "$65,000",
  "estimatedEffort": "MEDIUM",
  "recommendedTeam": ["Account Manager", "Strategy Lead", "Campaign Manager"]
}
```

### Error Response Format

```json
{
  "error": true,
  "errorType": "PROCESSING_ERROR",
  "message": "Unable to parse brief document",
  "recommendation": "MANUAL_REVIEW",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

---

## Implementation Guidelines

### 1. API Integration

```javascript
// Example implementation for OpenAI
const evaluateBrief = async (briefContent, metadata) => {
  const prompt = `
    Analyze this client brief and provide evaluation scores based on:
    1. Budget Viability (25%)
    2. Campaign Clarity (20%)
    3. Timeline Feasibility (20%)
    4. Strategic Fit (15%)
    5. Brief Quality (10%)
    6. Risk Assessment (10%)
    
    Brief content: ${briefContent}
    
    Return JSON with scores, recommendation, and actionable insights.
  `;
  
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,  // Lower temperature for consistent evaluation
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.data.choices[0].message.content);
};
```

### 2. Database Schema Extension

```sql
-- Add to rfp_responses table
ALTER TABLE rfp_responses ADD COLUMN brief_file_url TEXT;
ALTER TABLE rfp_responses ADD COLUMN brief_file_name VARCHAR(255);
ALTER TABLE rfp_responses ADD COLUMN ai_evaluation_score INTEGER;
ALTER TABLE rfp_responses ADD COLUMN ai_recommendation VARCHAR(20);
ALTER TABLE rfp_responses ADD COLUMN ai_evaluation_details JSONB;
ALTER TABLE rfp_responses ADD COLUMN ai_confidence_level VARCHAR(20);
ALTER TABLE rfp_responses ADD COLUMN evaluated_at TIMESTAMP;
```

### 3. Frontend Integration

```typescript
// React component example
const BriefEvaluationDisplay: React.FC<{ evaluation: AIEvaluation }> = ({ evaluation }) => {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'ACCEPT': return 'text-green-600';
      case 'REVIEW': return 'text-yellow-600';
      case 'DECLINE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Brief Evaluation</CardTitle>
        <div className={`text-2xl font-bold ${getRecommendationColor(evaluation.recommendation)}`}>
          {evaluation.recommendation} - {evaluation.overallScore}/100
        </div>
      </CardHeader>
      <CardContent>
        {/* Render breakdown, action items, etc. */}
      </CardContent>
    </Card>
  );
};
```

---

## Example Evaluations

### Example 1: High-Score Brief (ACCEPT)

**Brief Summary**: Major retail brand seeking Q4 holiday campaign with $150K budget, 10-week timeline, clear KPIs.

```json
{
  "overallScore": 92,
  "recommendation": "ACCEPT",
  "breakdown": {
    "budget": { "score": 95, "notes": "Strong budget with clear allocation" },
    "clarity": { "score": 90, "notes": "SMART objectives with defined KPIs" },
    "timeline": { "score": 95, "notes": "10-week timeline with milestones" },
    "strategic": { "score": 90, "notes": "Perfect fit for MiQ capabilities" },
    "quality": { "score": 85, "notes": "Professional, comprehensive brief" },
    "risk": { "score": 90, "notes": "Established client, low risk" }
  }
}
```

### Example 2: Medium-Score Brief (REVIEW)

**Brief Summary**: B2B software company, $40K budget, 4-week timeline, vague KPIs.

```json
{
  "overallScore": 68,
  "recommendation": "REVIEW",
  "breakdown": {
    "budget": { "score": 70, "notes": "Acceptable budget but tight for scope" },
    "clarity": { "score": 60, "notes": "Objectives clear but KPIs vague" },
    "timeline": { "score": 65, "notes": "Tight but manageable timeline" },
    "strategic": { "score": 70, "notes": "B2B is growing area for MiQ" },
    "quality": { "score": 75, "notes": "Well-structured but missing details" },
    "risk": { "score": 70, "notes": "New client, moderate risk" }
  },
  "actionItems": [
    "Clarify specific KPIs and success metrics",
    "Negotiate timeline extension to 6 weeks",
    "Confirm B2B targeting capabilities"
  ]
}
```

### Example 3: Low-Score Brief (DECLINE)

**Brief Summary**: Unknown startup, no budget specified, "ASAP" timeline, wants "viral campaign".

```json
{
  "overallScore": 25,
  "recommendation": "DECLINE",
  "breakdown": {
    "budget": { "score": 0, "notes": "No budget information provided" },
    "clarity": { "score": 20, "notes": "Vague objectives, no real KPIs" },
    "timeline": { "score": 10, "notes": "ASAP is not a timeline" },
    "strategic": { "score": 40, "notes": "Channels align but expectations unrealistic" },
    "quality": { "score": 30, "notes": "Poorly structured brief" },
    "risk": { "score": 40, "notes": "Unknown entity, high risk" }
  },
  "concerns": [
    "No budget information (automatic decline)",
    "Unrealistic viral expectations",
    "No clear timeline or process"
  ]
}
```

---

## Continuous Improvement

### Feedback Loop

1. **Track Outcomes**: Monitor which evaluated briefs convert to successful campaigns
2. **Adjust Weights**: Refine scoring weights based on historical success
3. **Update Criteria**: Add new evaluation points as patterns emerge
4. **Calibrate Thresholds**: Adjust score ranges based on business needs

### Performance Metrics

- **Accuracy Rate**: % of recommendations that align with human decision
- **Time Saved**: Average time reduced in brief evaluation
- **Revenue Impact**: Value of accepted briefs vs. declined
- **False Positive Rate**: % of declined briefs that would have been valuable

---

## Conclusion

This AI evaluation system provides a consistent, objective framework for assessing client briefs. By automating the initial evaluation, teams can focus their time on high-value opportunities while maintaining quality standards across all submissions.

For questions or updates to these criteria, please contact the MediaPlanPro development team.