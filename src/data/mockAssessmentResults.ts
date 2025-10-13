// Mock data for testing the assessment results page
export const mockAssessmentResult = {
  id: "mock-assessment-123",
  organizationId: "org-456",
  score: 9,
  tier: "F" as const,
  completedAt: new Date().toISOString(),
  reportUrl: "#",
  recommendations: [
    {
      title: "Implement Multi-Factor Authentication",
      description: "Enable MFA for all user accounts to significantly improve security posture.",
      priority: "high" as const
    },
    {
      title: "Regular Security Awareness Training",
      description: "Conduct monthly security training sessions for all employees.",
      priority: "medium" as const
    },
    {
      title: "Update Incident Response Plan",
      description: "Review and update your incident response procedures quarterly.",
      priority: "medium" as const
    }
  ],
  vulnerabilities: [
    {
      title: "Weak Password Policies",
      description: "Current password requirements are insufficient for proper security.",
      severity: "high" as const
    },
    {
      title: "Outdated Software Components",
      description: "Several software components are running outdated versions with known vulnerabilities.",
      severity: "medium" as const
    }
  ],
  breakdown: [
    {
      category: "Policy & Compliance",
      score: 2,
      maxScore: 10,
      percentage: 31,
      weight: 0.25
    },
    {
      category: "Access Control", 
      score: 1,
      maxScore: 10,
      percentage: 27,
      weight: 0.25
    },
    {
      category: "Endpoint Security",
      score: 3,
      maxScore: 10, 
      percentage: 27,
      weight: 0.25
    },
    {
      category: "Network Security",
      score: 2,
      maxScore: 10,
      percentage: 2,
      weight: 0.25
    },
    {
      category: "Data Protection",
      score: 1,
      maxScore: 10,
      percentage: 23,
      weight: 0.25
    }
  ],
  benchmark: {
    industry: "Technology",
    size: "MEDIUM",
    averageScore: 65,
    topPercentile: 85
  }
};

export const mockLatestAssessment = {
  id: "mock-assessment-123",
  organizationId: "org-456",
  title: "Cyber Safety Index Assessment",
  status: "COMPLETED" as const,
  score: 9,
  tier: "F" as const,
  startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  completedAt: new Date().toISOString(),
  reportUrl: "#"
};