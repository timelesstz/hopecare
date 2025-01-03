export interface MELObjective {
  title: string;
  description: string;
}

export interface KPI {
  program: string;
  indicators: string[];
}

export interface DataCollection {
  method: string;
  description: string;
  frequency: string;
}

export const melObjectives: MELObjective[] = [
  {
    title: "Progress Tracking",
    description: "Track progress towards program goals and objectives"
  },
  {
    title: "Impact Measurement",
    description: "Measure the impact of interventions on beneficiaries and communities"
  },
  {
    title: "Continuous Improvement",
    description: "Identify areas for improvement and innovation"
  },
  {
    title: "Accountability",
    description: "Ensure accountability to stakeholders, including donors and communities"
  }
];

export const programKPIs: KPI[] = [
  {
    program: "Economic Empowerment",
    indicators: [
      "Number of individuals accessing micro-finance services",
      "Percentage increase in household income",
      "Number of sustainable businesses established",
      "Market linkages created and sustained"
    ]
  },
  {
    program: "Education",
    indicators: [
      "Enrollment rates for vulnerable children",
      "Adult literacy rates among participants",
      "Number of school infrastructure projects completed",
      "Student retention rates"
    ]
  },
  {
    program: "Health",
    indicators: [
      "HIV/AIDS prevalence rates in target communities",
      "Maternal mortality rates",
      "Number of individuals accessing health services",
      "Behavioral change indicators"
    ]
  }
];

export const dataCollectionMethods: DataCollection[] = [
  {
    method: "Baseline Surveys",
    description: "Conducted at the start of new programs or in new geographic areas",
    frequency: "At program start"
  },
  {
    method: "Regular Monitoring Visits",
    description: "Conducted by program staff",
    frequency: "Monthly or quarterly"
  },
  {
    method: "Beneficiary Feedback",
    description: "Suggestion boxes and satisfaction surveys",
    frequency: "Ongoing"
  }
];