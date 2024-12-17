export interface HRPolicy {
  category: string;
  policies: {
    name: string;
    description: string;
    guidelines: string[];
  }[];
}

export const hrPolicies: HRPolicy[] = [
  {
    category: "Recruitment",
    policies: [
      {
        name: "Equal Opportunity",
        description: "Commitment to non-discriminatory hiring practices",
        guidelines: [
          "Diverse interview panels",
          "Standardized evaluation criteria",
          "Regular bias training for hiring managers"
        ]
      },
      {
        name: "Local Hiring",
        description: "Priority for local community members",
        guidelines: [
          "Community outreach programs",
          "Skills development initiatives",
          "Partnership with local institutions"
        ]
      }
    ]
  },
  {
    category: "Professional Development",
    policies: [
      {
        name: "Training Programs",
        description: "Continuous learning opportunities",
        guidelines: [
          "Annual training needs assessment",
          "Individual development plans",
          "Skills enhancement workshops"
        ]
      },
      {
        name: "Career Progression",
        description: "Clear career advancement pathways",
        guidelines: [
          "Regular performance reviews",
          "Mentorship opportunities",
          "Leadership development programs"
        ]
      }
    ]
  }
];