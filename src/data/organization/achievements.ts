export interface ProgramAchievement {
  title: string;
  metrics: string[];
  description: string;
}

export interface ProjectImpact {
  name: string;
  beneficiaries: number;
  outcomes: string[];
}

export const programAchievements: ProgramAchievement[] = [
  {
    title: "Economic Empowerment",
    metrics: [
      "250+ active groups",
      "7,500+ members",
      "9 districts covered"
    ],
    description: "Successfully implemented micro-financing initiatives and market linkages, improving income stability and food security for community members."
  },
  {
    title: "Education",
    metrics: [
      "Increased enrollment rates",
      "Adult literacy programs",
      "Improved infrastructure"
    ],
    description: "Enhanced access to education through enrollment programs, adult literacy initiatives, and infrastructure improvements."
  },
  {
    title: "Health",
    metrics: [
      "Network of volunteers",
      "HIV/AIDS awareness",
      "Maternal health services"
    ],
    description: "Established comprehensive health programs including HIV/AIDS prevention, maternal care, and adolescent health services."
  }
];

export const projectImpacts: ProjectImpact[] = [
  {
    name: "Abstinence Behavior Change for Youth (ABY)",
    beneficiaries: 2050,
    outcomes: [
      "Successful HIV behavioral change interventions",
      "Community economic empowerment initiatives"
    ]
  },
  {
    name: "Prevention of HIV Infections",
    beneficiaries: 1400,
    outcomes: [
      "Increased condom use among high-risk populations",
      "Behavior change promotion"
    ]
  },
  {
    name: "Save the Kids and Youths (SKY)",
    beneficiaries: 1150,
    outcomes: [
      "HIV testing and counseling",
      "Nutrition support for vulnerable children"
    ]
  },
  {
    name: "Old Age is Cool (OAC)",
    beneficiaries: 425,
    outcomes: [
      "Food and health support for elderly",
      "Enhanced well-being in Chamwino Districts"
    ]
  }
];