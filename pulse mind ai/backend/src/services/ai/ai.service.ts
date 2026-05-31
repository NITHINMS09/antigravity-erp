import OpenAI from 'openai';
import { AIAnalysisResult, EmotionType, RiskLevel } from '../../types';
import logger from '../../utils/logger';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function analyzeFeedback(text: string, category?: string): Promise<AIAnalysisResult> {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `Analyze employee feedback. Return JSON: {sentiment(-1 to 1),emotion(STRESS|ANGER|FRUSTRATION|SATISFACTION|MOTIVATION|DEPRESSION|NEUTRAL|JOY|ANXIETY),toxicityScore(0-1),urgencyScore(0-1),keywords[],category,summary,suggestions[],confidence(0-1)}` },
          { role: 'user', content: `Category:${category||'auto'}\n${text}` }
        ],
        temperature: 0.3, max_tokens: 600,
      });
      const c = response.choices[0]?.message?.content || '';
      return JSON.parse(c.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) { logger.error('OpenAI failed, using fallback'); }
  }
  return fallbackAnalysis(text);
}

export async function predictBurnout(userId: string, history: any[]) {
  const recent = history.slice(-10);
  const avgStress = recent.reduce((s, f) => s + (f.stressLevel || 5), 0) / Math.max(recent.length, 1);
  const avgSent = recent.reduce((s, f) => s + (f.sentimentScore || 0), 0) / Math.max(recent.length, 1);
  const negCount = history.filter(f => (f.sentimentScore || 0) < -0.3).length;
  const score = Math.min(100, Math.max(0, (avgStress/10)*40 + ((1-(avgSent+1)/2))*30 + (negCount/Math.max(history.length,1))*30));
  const riskLevel = score > 75 ? RiskLevel.CRITICAL : score > 55 ? RiskLevel.HIGH : score > 35 ? RiskLevel.MEDIUM : RiskLevel.LOW;
  const factors: string[] = [];
  if (avgStress > 7) factors.push('High stress levels');
  if (avgSent < -0.3) factors.push('Negative sentiment trend');
  if (negCount > history.length * 0.5) factors.push('Frequent negative reports');
  if (!factors.length) factors.push('No significant risk factors');
  const recs = score > 60 ? ['Schedule wellness check','Redistribute workload','Provide mental health resources'] : ['Monitor stress levels','Encourage breaks'];
  return { score: Math.round(score), riskLevel, factors, recommendations: recs, resignationProbability: Math.min(95, Math.round(score * 0.85)) };
}

export async function detectToxicity(text: string) {
  const lower = text.toLowerCase();
  const toxic = ['abuse','harass','bully','threat','discriminat','hostile','assault','hate'];
  const count = toxic.filter(w => lower.includes(w)).length;
  const score = Math.min(1, count * 0.25);
  return { score, isAbusive: score > 0.5, categories: toxic.filter(w => lower.includes(w)), severity: score > 0.7 ? RiskLevel.CRITICAL : score > 0.4 ? RiskLevel.HIGH : score > 0.2 ? RiskLevel.MEDIUM : RiskLevel.LOW };
}

export async function detectPatterns(feedbacks: any[]) {
  const kwMap = new Map<string, number>();
  const deptMap = new Map<string, Set<string>>();
  feedbacks.forEach(f => {
    (f.keywords || []).forEach((k: string) => {
      kwMap.set(k, (kwMap.get(k) || 0) + 1);
      if (f.department?.name) { if (!deptMap.has(k)) deptMap.set(k, new Set()); deptMap.get(k)!.add(f.department.name); }
    });
  });
  const patterns = Array.from(kwMap.entries()).filter(([,c]) => c >= 3).sort((a,b) => b[1]-a[1]).slice(0,10).map(([issue,count]) => ({
    issue, count, departments: Array.from(deptMap.get(issue)||[]),
    trend: count > 10 ? 'increasing' as const : 'stable' as const,
    severity: count > 15 ? RiskLevel.CRITICAL : count > 10 ? RiskLevel.HIGH : count > 5 ? RiskLevel.MEDIUM : RiskLevel.LOW,
  }));
  const recurringIssues = Array.from(kwMap.entries()).sort((a,b) => b[1]-a[1]).slice(0,20).map(([keyword,count]) => ({ keyword, count }));
  return { patterns, recurringIssues };
}

export async function generateRecommendations(ctx: { departmentName: string; topIssues: string[]; satisfactionScore: number; stressScore: number; }) {
  const recs: string[] = [];
  if (ctx.stressScore > 60) recs.push(`Implement stress reduction in ${ctx.departmentName}`);
  if (ctx.satisfactionScore < 50) recs.push(`Conduct satisfaction workshops in ${ctx.departmentName}`);
  recs.push('Schedule regular team check-ins', 'Implement anonymous feedback channels', 'Review workload balance');
  return recs.slice(0, 5);
}

export async function generateSummary(feedbacks: any[]) {
  const total = feedbacks.length;
  const avgSent = feedbacks.reduce((s,f) => s + (f.sentimentScore||0), 0) / Math.max(total,1);
  const cats = new Map<string,number>();
  feedbacks.forEach(f => cats.set(f.category, (cats.get(f.category)||0)+1));
  const top = Array.from(cats.entries()).sort((a,b) => b[1]-a[1])[0];
  return `Analyzed ${total} feedback entries. Avg sentiment: ${avgSent.toFixed(2)}. Top category: ${top?.[0]||'N/A'} (${top?.[1]||0}). ${avgSent < -0.2 ? 'ALERT: Negative trend detected.' : 'Organizational health stable.'}`;
}

export async function translateText(text: string, lang: string) {
  if (openai) {
    try {
      const r = await openai.chat.completions.create({ model: 'gpt-4', messages: [{ role: 'system', content: `Translate to ${lang}. Return only translation.` }, { role: 'user', content: text }], temperature: 0.1, max_tokens: 500 });
      return r.choices[0]?.message?.content || text;
    } catch(e) { logger.error('Translation failed'); }
  }
  return text;
}

function fallbackAnalysis(text: string): AIAnalysisResult {
  const l = text.toLowerCase();
  const neg = ['bad','terrible','hate','angry','frustrated','stressed','overworked','toxic','unfair','quit'].filter(w => l.includes(w)).length;
  const pos = ['good','great','excellent','love','happy','satisfied','motivated','amazing'].filter(w => l.includes(w)).length;
  const sentiment = Math.max(-1, Math.min(1, (pos-neg)/Math.max(pos+neg,1)));
  const stress = ['stress','pressure','deadline','burnout','exhausted','overwhelm'].filter(w => l.includes(w)).length;
  let emotion: EmotionType = stress > 1 ? EmotionType.STRESS : neg > 2 ? EmotionType.FRUSTRATION : pos > 2 ? EmotionType.SATISFACTION : EmotionType.NEUTRAL;
  const kw: string[] = [];
  const kwm: Record<string,string> = { workload:'Workload', salary:'Salary', manager:'Manager Issue', team:'Team Dynamics', deadline:'Deadline Pressure', growth:'Career Growth', communication:'Communication', stress:'Mental Stress', toxic:'Toxicity', hr:'HR Issue', technical:'Technical Issue' };
  Object.entries(kwm).forEach(([w,t]) => { if (l.includes(w)) kw.push(t); });
  if (!kw.length) kw.push('General Feedback');
  return { sentiment, emotion, toxicityScore: Math.min(1, ['abuse','harass','bully','threat'].filter(w=>l.includes(w)).length*0.3), urgencyScore: Math.min(1, neg*0.15+stress*0.2), keywords: kw, category: kw[0], summary: text.slice(0,120), suggestions: ['Address concerns promptly','Review workload','Schedule feedback sessions'], confidence: 0.65 };
}
