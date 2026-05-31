import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function getRiskColor(risk: string) {
  switch (risk) {
    case 'LOW': return 'text-emerald-400';
    case 'MEDIUM': return 'text-amber-400';
    case 'HIGH': return 'text-orange-400';
    case 'CRITICAL': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getRiskBg(risk: string) {
  switch (risk) {
    case 'LOW': return 'bg-emerald-500/20 border-emerald-500/30';
    case 'MEDIUM': return 'bg-amber-500/20 border-amber-500/30';
    case 'HIGH': return 'bg-orange-500/20 border-orange-500/30';
    case 'CRITICAL': return 'bg-red-500/20 border-red-500/30';
    default: return 'bg-gray-500/20 border-gray-500/30';
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400';
    case 'AI_PROCESSING': return 'bg-purple-500/20 text-purple-400';
    case 'AI_RESOLVED': return 'bg-emerald-500/20 text-emerald-400';
    case 'IN_REVIEW': return 'bg-amber-500/20 text-amber-400';
    case 'IN_PROGRESS': return 'bg-cyan-500/20 text-cyan-400';
    case 'ESCALATED': return 'bg-red-500/20 text-red-400';
    case 'RESOLVED': return 'bg-green-500/20 text-green-400';
    case 'CLOSED': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

export function getMoodEmoji(mood: string) {
  const moods: Record<string, string> = { '😊': 'Happy', '😐': 'Neutral', '😤': 'Frustrated', '😫': 'Exhausted', '😡': 'Angry', '😰': 'Anxious', '🤔': 'Thoughtful', '😢': 'Sad' };
  return moods[mood] || mood;
}

export function getEmotionColor(emotion: string) {
  const colors: Record<string, string> = {
    STRESS: '#f97316', ANGER: '#ef4444', FRUSTRATION: '#f59e0b', SATISFACTION: '#22c55e',
    MOTIVATION: '#3b82f6', DEPRESSION: '#6b7280', NEUTRAL: '#8b5cf6', JOY: '#10b981', ANXIETY: '#ec4899',
  };
  return colors[emotion] || '#8b5cf6';
}
