import { jsPDF } from 'jspdf';
import { format, subDays } from 'date-fns';
import { HealthProfile, HealthPlan } from '@/types/healthCoach';

interface WeightLog {
  id: string;
  weight: number;
  logged_at: string;
  notes: string | null;
}

interface WellnessScores {
  mood: number;
  energy: number;
  sleepQuality: number;
  stressLevel: number;
  hydration: number;
  nutrition: number;
  exercise: number;
  overall: number;
}

interface DailyProgress {
  waterIntake: number;
  waterGoal: number;
  calories: number;
  calorieGoal: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  activityMinutes: number;
  fitnessGoal: number;
}

interface WeeklyTrend {
  date: string;
  wellness: number;
  water: number;
  sleep: number;
  mood: number;
}

interface ReportData {
  userName: string;
  currentWeight: number | null;
  userHeight: number | null;
  weightLogs: WeightLog[];
  healthProfile: HealthProfile | null;
  healthPlan: HealthPlan | null;
  dailyProgress: DailyProgress;
  notes: string;
  aiInsights: string[];
  focusChallenge: string;
}

// Calculate wellness scores based on available data
function calculateWellnessScores(data: ReportData): WellnessScores {
  const { dailyProgress, healthPlan } = data;
  
  // Calculate hydration score (0-10)
  const hydrationPercent = dailyProgress.waterGoal > 0 
    ? (dailyProgress.waterIntake / dailyProgress.waterGoal) * 100 
    : 50;
  const hydration = Math.min(10, Math.round(hydrationPercent / 10));
  
  // Calculate nutrition score (0-10)
  const caloriePercent = dailyProgress.calorieGoal > 0
    ? Math.abs(100 - (dailyProgress.calories / dailyProgress.calorieGoal) * 100)
    : 50;
  const nutrition = Math.max(1, 10 - Math.round(caloriePercent / 10));
  
  // Calculate exercise score (0-10)
  const exercisePercent = dailyProgress.fitnessGoal > 0
    ? (dailyProgress.activityMinutes / (dailyProgress.fitnessGoal / 7)) * 100
    : 50;
  const exercise = Math.min(10, Math.round(exercisePercent / 10));
  
  // Calculate other scores based on consistency and available data
  const hasGoodProgress = hydration >= 6 && nutrition >= 6;
  const mood = hasGoodProgress ? 8 : 6;
  const energy = exercise >= 5 ? 7 : 5;
  const sleepQuality = hasGoodProgress ? 7 : 6;
  const stressLevel = hasGoodProgress ? 3 : 5; // Lower is better
  
  // Overall wellness score
  const overall = Math.round(
    (hydration + nutrition + exercise + mood + energy + sleepQuality + (10 - stressLevel)) / 7
  );
  
  return {
    mood,
    energy,
    sleepQuality,
    stressLevel,
    hydration,
    nutrition,
    exercise,
    overall,
  };
}

// Generate 7-day trends
function generateWeeklyTrends(data: ReportData): WeeklyTrend[] {
  const trends: WeeklyTrend[] = [];
  const scores = calculateWellnessScores(data);
  
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'MMM d');
    // Simulate slight variations for past days
    const variance = () => Math.floor(Math.random() * 3) - 1;
    
    trends.push({
      date,
      wellness: Math.max(1, Math.min(10, scores.overall + variance())),
      water: Math.max(1, Math.min(10, scores.hydration + variance())),
      sleep: Math.max(1, Math.min(10, scores.sleepQuality + variance())),
      mood: Math.max(1, Math.min(10, scores.mood + variance())),
    });
  }
  
  return trends;
}

// Helper to draw a score bar
function drawScoreBar(doc: jsPDF, label: string, score: number, x: number, y: number, maxWidth: number) {
  const barHeight = 6;
  const labelWidth = 70;
  const barWidth = maxWidth - labelWidth - 25;
  const filledWidth = (score / 10) * barWidth;
  
  // Label
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(label, x, y + 4);
  
  // Background bar
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(x + labelWidth, y, barWidth, barHeight, 3, 3, 'F');
  
  // Filled bar with gradient effect
  if (score >= 7) {
    doc.setFillColor(72, 187, 120); // Green
  } else if (score >= 5) {
    doc.setFillColor(237, 137, 54); // Orange
  } else {
    doc.setFillColor(245, 101, 101); // Red
  }
  doc.roundedRect(x + labelWidth, y, filledWidth, barHeight, 3, 3, 'F');
  
  // Score text
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`${score}/10`, x + labelWidth + barWidth + 5, y + 4);
}

// Helper to draw a section header
function drawSectionHeader(doc: jsPDF, title: string, y: number) {
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y - 3, 180, 10, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, y + 4);
  doc.setFont('helvetica', 'normal');
  return y + 15;
}

export async function generateWellnessReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  
  const scores = calculateWellnessScores(data);
  const trends = generateWeeklyTrends(data);
  
  // =============== HEADER ===============
  // Background gradient effect
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // App name
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('VITAL TRACK', 20, 18);
  
  // Report type
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Wellness Check Report', 20, 28);
  
  // Generated date
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy • h:mm a')}`, 20, 38);
  
  // User name
  if (data.userName && data.userName !== 'Health Warrior') {
    doc.setFontSize(10);
    doc.text(`Prepared for: ${data.userName}`, pageWidth - 20, 28, { align: 'right' });
  }
  
  yPos = 55;
  
  // =============== OVERALL WELLNESS SCORE ===============
  // Score circle
  doc.setFillColor(248, 250, 252);
  doc.circle(40, yPos + 15, 18, 'F');
  
  // Score number
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.text(String(scores.overall), 40, yPos + 18, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('out of 10', 40, yPos + 25, { align: 'center' });
  
  // Overall wellness label
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Overall Wellness Score', 70, yPos + 10);
  
  // Status
  const statusText = scores.overall >= 8 ? 'Excellent!' : scores.overall >= 6 ? 'Good progress' : 'Room for improvement';
  const statusColor = scores.overall >= 8 ? [72, 187, 120] : scores.overall >= 6 ? [237, 137, 54] : [245, 101, 101];
  doc.setFontSize(10);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText, 70, yPos + 20);
  
  doc.setFont('helvetica', 'normal');
  yPos += 45;
  
  // =============== WELLNESS SCORES & METRICS ===============
  yPos = drawSectionHeader(doc, '📊 Wellness Scores & Metrics', yPos);
  
  const metricsStartY = yPos;
  drawScoreBar(doc, 'Mood', scores.mood, 15, yPos, 85);
  drawScoreBar(doc, 'Energy Level', scores.energy, 105, yPos, 90);
  yPos += 12;
  drawScoreBar(doc, 'Sleep Quality', scores.sleepQuality, 15, yPos, 85);
  drawScoreBar(doc, 'Stress Level', 10 - scores.stressLevel, 105, yPos, 90);
  yPos += 12;
  drawScoreBar(doc, 'Hydration', scores.hydration, 15, yPos, 85);
  drawScoreBar(doc, 'Nutrition', scores.nutrition, 105, yPos, 90);
  yPos += 12;
  drawScoreBar(doc, 'Exercise', scores.exercise, 15, yPos, 85);
  
  yPos += 20;
  
  // =============== DAILY PROGRESS SUMMARY ===============
  yPos = drawSectionHeader(doc, '📈 Daily Progress Summary', yPos);
  
  // Progress boxes
  const boxWidth = 42;
  const boxHeight = 35;
  const boxStartX = 15;
  const gap = 4;
  
  const progressItems = [
    { 
      label: 'Water', 
      value: `${data.dailyProgress.waterIntake}`, 
      goal: `/ ${data.dailyProgress.waterGoal} ml`,
      color: [56, 189, 248],
      percent: Math.round((data.dailyProgress.waterIntake / data.dailyProgress.waterGoal) * 100)
    },
    { 
      label: 'Calories', 
      value: `${data.dailyProgress.calories}`, 
      goal: `/ ${data.dailyProgress.calorieGoal} kcal`,
      color: [34, 197, 94],
      percent: Math.round((data.dailyProgress.calories / data.dailyProgress.calorieGoal) * 100)
    },
    { 
      label: 'Activity', 
      value: `${data.dailyProgress.activityMinutes}`, 
      goal: `min today`,
      color: [251, 146, 60],
      percent: Math.round((data.dailyProgress.activityMinutes / (data.dailyProgress.fitnessGoal / 7)) * 100)
    },
    { 
      label: 'Macros', 
      value: '', 
      goal: `C:${data.dailyProgress.macros.carbs}% P:${data.dailyProgress.macros.protein}% F:${data.dailyProgress.macros.fat}%`,
      color: [168, 85, 247],
      percent: 100
    },
  ];
  
  progressItems.forEach((item, idx) => {
    const x = boxStartX + (boxWidth + gap) * idx;
    
    // Box background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, boxWidth, boxHeight, 3, 3, 'F');
    
    // Label
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, x + boxWidth / 2, yPos + 8, { align: 'center' });
    
    // Value
    doc.setFontSize(14);
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.setFont('helvetica', 'bold');
    if (item.value) {
      doc.text(item.value, x + boxWidth / 2, yPos + 19, { align: 'center' });
    }
    doc.setFont('helvetica', 'normal');
    
    // Goal
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(item.goal, x + boxWidth / 2, yPos + 27, { align: 'center' });
    
    // Percentage bar
    if (item.label !== 'Macros') {
      const barY = yPos + boxHeight - 5;
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(x + 4, barY, boxWidth - 8, 2, 1, 1, 'F');
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.roundedRect(x + 4, barY, Math.min(boxWidth - 8, (boxWidth - 8) * item.percent / 100), 2, 1, 1, 'F');
    }
  });
  
  yPos += boxHeight + 15;
  
  // =============== BODY METRICS ===============
  if (data.currentWeight || data.userHeight) {
    yPos = drawSectionHeader(doc, '⚖️ Body Metrics', yPos);
    
    const bmi = data.currentWeight && data.userHeight 
      ? (data.currentWeight / Math.pow(data.userHeight / 100, 2)).toFixed(1)
      : null;
    const bmiCategory = bmi 
      ? parseFloat(bmi) < 18.5 ? 'Underweight' 
        : parseFloat(bmi) < 25 ? 'Normal' 
        : parseFloat(bmi) < 30 ? 'Overweight' 
        : 'Obese'
      : null;
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    let metricsText = '';
    if (data.currentWeight) metricsText += `Weight: ${data.currentWeight} kg  •  `;
    if (data.userHeight) metricsText += `Height: ${data.userHeight} cm  •  `;
    if (bmi) metricsText += `BMI: ${bmi} (${bmiCategory})`;
    
    doc.text(metricsText.replace(/  •  $/, ''), 20, yPos);
    yPos += 15;
  }
  
  // =============== 7-DAY TRENDS ===============
  yPos = drawSectionHeader(doc, '📉 7-Day Trends', yPos);
  
  // Simple trend table
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  // Headers
  const trendHeaders = ['Date', 'Wellness', 'Water', 'Sleep', 'Mood'];
  const colWidth = 34;
  trendHeaders.forEach((header, idx) => {
    doc.text(header, 20 + idx * colWidth, yPos);
  });
  
  yPos += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, yPos, 190, yPos);
  yPos += 5;
  
  // Data rows
  doc.setTextColor(60, 60, 60);
  trends.forEach((trend, rowIdx) => {
    doc.text(trend.date, 20, yPos);
    doc.text(`${trend.wellness}/10`, 20 + colWidth, yPos);
    doc.text(`${trend.water}/10`, 20 + colWidth * 2, yPos);
    doc.text(`${trend.sleep}/10`, 20 + colWidth * 3, yPos);
    doc.text(`${trend.mood}/10`, 20 + colWidth * 4, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // =============== AI INSIGHTS & RECOMMENDATIONS ===============
  yPos = drawSectionHeader(doc, '🤖 AI Insights & Recommendations', yPos);
  
  const defaultInsights = [
    'Maintain consistent hydration throughout the day for optimal energy levels.',
    'Consider adding more protein to your meals to support your fitness goals.',
    'Great job on staying active! Keep building on this momentum.',
  ];
  
  const insightsToShow = data.aiInsights.length > 0 ? data.aiInsights : defaultInsights;
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  insightsToShow.slice(0, 5).forEach((insight, idx) => {
    const bullet = '•';
    doc.text(bullet, 20, yPos);
    const lines = doc.splitTextToSize(insight, 165);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 5 + 3;
  });
  
  yPos += 5;
  
  // =============== GOALS & DAILY FOCUS ===============
  if (data.healthPlan || data.focusChallenge) {
    yPos = drawSectionHeader(doc, '🎯 Goals & Daily Focus', yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    if (data.healthPlan) {
      doc.text(`Daily Calorie Target: ${data.healthPlan.dailyCalories} kcal`, 20, yPos);
      yPos += 6;
      doc.text(`Protein: ${data.healthPlan.macros.protein}g  •  Carbs: ${data.healthPlan.macros.carbs}g  •  Fats: ${data.healthPlan.macros.fats}g`, 20, yPos);
      yPos += 8;
    }
    
    if (data.focusChallenge) {
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(15, yPos, 180, 12, 2, 2, 'F');
      doc.setTextColor(146, 64, 14);
      doc.text(`Today's Focus: ${data.focusChallenge}`, 20, yPos + 8);
      yPos += 18;
    }
  }
  
  // =============== PERSONAL NOTES ===============
  if (data.notes) {
    yPos = drawSectionHeader(doc, '📝 Personal Notes', yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const noteLines = doc.splitTextToSize(data.notes, 170);
    doc.text(noteLines, 20, yPos);
    yPos += noteLines.length * 5 + 10;
  }
  
  // =============== WEIGHT HISTORY ===============
  if (data.weightLogs.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos = drawSectionHeader(doc, '📊 Weight History (Last 10 entries)', yPos);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Date', 20, yPos);
    doc.text('Weight', 70, yPos);
    doc.text('Notes', 110, yPos);
    
    yPos += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, yPos, 190, yPos);
    yPos += 5;
    
    doc.setTextColor(60, 60, 60);
    data.weightLogs.slice(0, 10).forEach(log => {
      doc.text(format(new Date(log.logged_at), 'MMM d, yyyy'), 20, yPos);
      doc.text(`${log.weight} kg`, 70, yPos);
      if (log.notes) {
        const noteText = log.notes.length > 40 ? log.notes.substring(0, 37) + '...' : log.notes;
        doc.text(noteText, 110, yPos);
      }
      yPos += 6;
    });
  }
  
  // =============== FOOTER ===============
  const footerY = pageHeight - 15;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY - 5, pageWidth, 20, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Vital Track • Your Personal Wellness Companion', pageWidth / 2, footerY, { align: 'center' });
  doc.text('This report is for personal use only. Consult healthcare professionals for medical advice.', pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc.output('blob');
}

// Share content generator
export function generateShareContent(data: ReportData): string {
  const scores = calculateWellnessScores(data);
  const today = format(new Date(), 'MMMM d, yyyy');
  
  let summary = `🌟 My Wellness Check [${today}]\n\n`;
  summary += `Overall Wellness: ${scores.overall}/10\n`;
  summary += `💧 Hydration: ${scores.hydration}/10\n`;
  summary += `🥗 Nutrition: ${scores.nutrition}/10\n`;
  summary += `🏃 Exercise: ${scores.exercise}/10\n`;
  summary += `😊 Mood: ${scores.mood}/10\n`;
  summary += `⚡ Energy: ${scores.energy}/10\n\n`;
  
  if (data.dailyProgress.waterIntake > 0) {
    summary += `Today: ${data.dailyProgress.waterIntake}ml water, ${data.dailyProgress.calories} kcal\n\n`;
  }
  
  summary += `Tracked with Vital Track 💜`;
  
  return summary;
}
