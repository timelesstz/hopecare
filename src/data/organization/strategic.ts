export interface StrategicGoal {
  area: string;
  target: string;
  strategies: string[];
  timeline: string;
  metrics: string[];
}

export const strategicGoals: StrategicGoal[] = [
  {
    area: "Geographical Expansion",
    target: "Extend operations to 5 additional regions",
    strategies: [
      "Conduct needs assessments",
      "Establish local partnerships",
      "Gradual program introduction"
    ],
    timeline: "2025",
    metrics: [
      "Number of new regions covered",
      "Number of new beneficiaries",
      "Program success rates in new areas"
    ]
  },
  {
    area: "Economic Empowerment",
    target: "Double micro-financing beneficiaries",
    strategies: [
      "Introduce digital financial services",
      "Develop market partnerships",
      "Implement mentorship program"
    ],
    timeline: "2025",
    metrics: [
      "Number of active loans",
      "Business success rate",
      "Average income increase"
    ]
  },
  {
    area: "Education",
    target: "95% literacy rate among participants",
    strategies: [
      "Introduce e-learning platforms",
      "Implement retention programs",
      "Develop educational partnerships"
    ],
    timeline: "2025",
    metrics: [
      "Literacy rate improvement",
      "School enrollment rates",
      "Program completion rates"
    ]
  }
];