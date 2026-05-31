import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PulseMind AI database...');

  const org = await prisma.organization.create({
    data: { name: 'TechCorp Solutions', industry: 'Technology', size: '500-1000', address: '123 Innovation Drive, Bangalore', website: 'https://techcorp.example.com' },
  });

  const [eng, sales, hr, mktg, ops] = await Promise.all([
    prisma.department.create({ data: { name: 'Engineering', description: 'Software development team', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Sales', description: 'Sales and business development', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Human Resources', description: 'HR and people operations', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and communications', organizationId: org.id } }),
    prisma.department.create({ data: { name: 'Operations', description: 'Business operations', organizationId: org.id } }),
  ]);

  const adminPass = await bcrypt.hash('admin123', 12);
  const empPass = await bcrypt.hash('employee123', 12);

  const admin = await prisma.user.create({
    data: { email: 'admin@pulsemind.ai', password: adminPass, firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', jobTitle: 'Platform Administrator', employeeId: 'PM-001', organizationId: org.id, departmentId: hr.id },
  });

  const hrAdmin = await prisma.user.create({
    data: { email: 'hr@pulsemind.ai', password: adminPass, firstName: 'Priya', lastName: 'Sharma', role: 'HR_ADMIN', jobTitle: 'HR Director', employeeId: 'PM-002', organizationId: org.id, departmentId: hr.id },
  });

  const employees = await Promise.all([
    prisma.user.create({ data: { email: 'dev1@pulsemind.ai', password: empPass, firstName: 'Arjun', lastName: 'Patel', role: 'EMPLOYEE', jobTitle: 'Senior Developer', employeeId: 'PM-010', organizationId: org.id, departmentId: eng.id } }),
    prisma.user.create({ data: { email: 'dev2@pulsemind.ai', password: empPass, firstName: 'Sneha', lastName: 'Gupta', role: 'EMPLOYEE', jobTitle: 'Frontend Developer', employeeId: 'PM-011', organizationId: org.id, departmentId: eng.id } }),
    prisma.user.create({ data: { email: 'sales1@pulsemind.ai', password: empPass, firstName: 'Vikram', lastName: 'Singh', role: 'EMPLOYEE', jobTitle: 'Sales Executive', employeeId: 'PM-012', organizationId: org.id, departmentId: sales.id } }),
    prisma.user.create({ data: { email: 'ops1@pulsemind.ai', password: empPass, firstName: 'Meera', lastName: 'Nair', role: 'EMPLOYEE', jobTitle: 'Operations Manager', employeeId: 'PM-013', organizationId: org.id, departmentId: ops.id } }),
    prisma.user.create({ data: { email: 'mktg1@pulsemind.ai', password: empPass, firstName: 'Karthik', lastName: 'Reddy', role: 'EMPLOYEE', jobTitle: 'Marketing Specialist', employeeId: 'PM-014', organizationId: org.id, departmentId: mktg.id } }),
  ]);

  const feedbackItems = [
    { userId: employees[0].id, category: 'COMPLAINT', priority: 'HIGH', title: 'Excessive workload affecting health', content: 'The constant deadline pressure and unrealistic sprint goals are causing significant stress. Working 12+ hour days for 3 months.', departmentId: eng.id, stressLevel: 9, starRating: 2, moodEmoji: '😫', satisfactionScore: 20, sentimentScore: -0.8, emotionDetected: 'STRESS', keywords: '["Workload","Deadline Pressure","Mental Stress"]', urgencyScore: 0.85, toxicityScore: 0.1 },
    { userId: employees[1].id, category: 'SUGGESTION', priority: 'MEDIUM', title: 'Need better code review process', content: 'Our code review process blocks deployments. Suggest automated checks and pair programming.', departmentId: eng.id, stressLevel: 5, starRating: 3, moodEmoji: '🤔', satisfactionScore: 55, sentimentScore: 0.2, emotionDetected: 'NEUTRAL', keywords: '["Technical Issue","Communication"]', urgencyScore: 0.4, toxicityScore: 0 },
    { userId: employees[2].id, category: 'TOXICITY_REPORT', priority: 'CRITICAL', title: 'Hostile behavior from team lead', content: 'My team lead has been extremely hostile and uses abusive language during meetings. Creates toxic environment.', departmentId: sales.id, stressLevel: 10, starRating: 1, moodEmoji: '😡', satisfactionScore: 10, sentimentScore: -0.95, emotionDetected: 'ANGER', keywords: '["Toxicity","Manager Issue","Mental Stress"]', urgencyScore: 0.95, toxicityScore: 0.85 },
    { userId: employees[3].id, category: 'SATISFACTION', priority: 'LOW', title: 'Great team collaboration', content: 'Very happy with the team dynamics. Manager is supportive and encourages work-life balance.', departmentId: ops.id, stressLevel: 2, starRating: 5, moodEmoji: '😊', satisfactionScore: 90, sentimentScore: 0.85, emotionDetected: 'SATISFACTION', keywords: '["Team Dynamics","Communication"]', urgencyScore: 0.1, toxicityScore: 0 },
    { userId: employees[4].id, category: 'WELLNESS', priority: 'HIGH', title: 'Burnout and anxiety issues', content: 'Experiencing severe burnout and anxiety. Constant pressure to meet targets without adequate resources.', departmentId: mktg.id, stressLevel: 8, starRating: 2, moodEmoji: '😰', satisfactionScore: 25, sentimentScore: -0.7, emotionDetected: 'ANXIETY', keywords: '["Mental Stress","Workload","Career Growth"]', urgencyScore: 0.8, toxicityScore: 0.05 },
    { userId: employees[0].id, category: 'HR_ISSUE', priority: 'MEDIUM', title: 'Salary disparity concerns', content: 'Significant salary disparity between team members at the same level. Demotivating and affects morale.', departmentId: eng.id, stressLevel: 6, starRating: 2, moodEmoji: '😐', satisfactionScore: 35, sentimentScore: -0.4, emotionDetected: 'FRUSTRATION', keywords: '["Salary","HR Issue","Career Growth"]', urgencyScore: 0.6, toxicityScore: 0 },
  ];

  for (const fd of feedbackItems) {
    const feedback = await prisma.feedback.create({ data: { ...fd, status: 'SUBMITTED', aiSuggestions: '["Address employee concerns","Review workload","Schedule feedback sessions"]', attachments: '[]' } });
    await prisma.emotionScore.create({ data: { userId: fd.userId, feedbackId: feedback.id, emotion: fd.emotionDetected, score: Math.abs(fd.sentimentScore), confidence: 0.8 } });
    if (fd.priority === 'HIGH' || fd.priority === 'CRITICAL' || fd.category === 'COMPLAINT') {
      await prisma.complaint.create({ data: { feedbackId: feedback.id, authorId: fd.userId, status: 'SUBMITTED', priority: fd.priority, aiResolution: 'AI is analyzing...', aiConfidence: 0.7 } });
    }
  }

  for (const emp of employees) {
    const score = Math.random() * 80 + 10;
    await prisma.burnoutScore.create({ data: { userId: emp.id, score, riskLevel: score > 70 ? 'HIGH' : score > 45 ? 'MEDIUM' : 'LOW', factors: score > 50 ? '["High workload","Deadline pressure"]' : '["Normal workload"]', recommendations: score > 50 ? '["Take regular breaks","Review workload"]' : '["Maintain balance"]' } });
    await prisma.wellnessReport.create({ data: { userId: emp.id, overallScore: Math.random() * 40 + 50, stressScore: Math.random() * 60 + 20, satisfactionScore: Math.random() * 50 + 40, engagementScore: Math.random() * 40 + 50, recommendations: '["Stay active","Practice mindfulness"]', period: '2025-Q4' } });
  }

  await prisma.notification.createMany({
    data: [
      { userId: admin.id, type: 'ALERT', title: 'Toxicity Alert', message: 'High toxicity detected in Sales department', link: '/admin/toxicity' },
      { userId: admin.id, type: 'AI_INSIGHT', title: 'Burnout Risk Rising', message: 'Engineering shows 40% increase in stress levels', link: '/admin/burnout' },
      { userId: hrAdmin.id, type: 'ESCALATION', title: 'Complaint Escalated', message: 'Critical complaint requires immediate attention', link: '/admin/complaints' },
      { userId: employees[0].id, type: 'SUCCESS', title: 'Badge Earned!', message: 'You earned the Helpful Voice badge', link: '/dashboard' },
      { userId: employees[0].id, type: 'INFO', title: 'Feedback Received', message: 'Your feedback is being analyzed by AI', link: '/dashboard' },
    ],
  });

  await prisma.userBadge.createMany({
    data: [
      { userId: employees[0].id, badge: 'FIRST_FEEDBACK' },
      { userId: employees[0].id, badge: 'HELPFUL_VOICE' },
      { userId: employees[1].id, badge: 'FIRST_FEEDBACK' },
      { userId: employees[3].id, badge: 'WELLNESS_CHAMPION' },
    ],
  });

  await prisma.aIInsight.createMany({
    data: [
      { type: 'TREND', title: 'Rising Stress in Engineering', content: 'Stress levels increased 35% this month. Primary: deadline pressure.', severity: 'HIGH', departmentId: eng.id },
      { type: 'TOXICITY_ALERT', title: 'Toxic Behavior in Sales', content: 'Multiple hostile behavior reports in Sales. Immediate investigation needed.', severity: 'CRITICAL', departmentId: sales.id },
      { type: 'PREDICTION', title: 'Attrition Risk Alert', content: '3 employees in Engineering show high resignation probability (>70%).', severity: 'HIGH', departmentId: eng.id },
      { type: 'PATTERN', title: 'Recurring Workload Complaints', content: 'Workload complaints submitted 12 times across 3 departments this month.', severity: 'MEDIUM' },
    ],
  });

  await prisma.poll.create({ data: { question: "How is this week's workload?", options: '["Very Light","Manageable","Heavy","Overwhelming"]', votes: '{"Very Light":3,"Manageable":12,"Heavy":8,"Overwhelming":5}', createdBy: hrAdmin.id, isActive: true } });

  console.log('\n✅ Seed complete!');
  console.log('📋 Demo Credentials:');
  console.log('  Super Admin:  admin@pulsemind.ai  / admin123');
  console.log('  HR Admin:     hr@pulsemind.ai     / admin123');
  console.log('  Employee:     dev1@pulsemind.ai   / employee123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
