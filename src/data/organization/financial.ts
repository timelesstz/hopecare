export interface FinancialPolicy {
  category: string;
  policies: {
    title: string;
    description: string;
    procedures: string[];
  }[];
}

export const financialPolicies: FinancialPolicy[] = [
  {
    category: "Financial Management",
    policies: [
      {
        title: "Financial Manual",
        description: "Comprehensive guide for financial processes and controls",
        procedures: [
          "Regular updates to reflect current regulations",
          "Mandatory staff training",
          "Clear documentation of all procedures"
        ]
      },
      {
        title: "Segregation of Duties",
        description: "Clear separation of financial responsibilities",
        procedures: [
          "Multiple approvals for transactions",
          "Regular duty rotation",
          "Clear accountability structure"
        ]
      }
    ]
  },
  {
    category: "Budgeting",
    policies: [
      {
        title: "Annual Budget Process",
        description: "Bottom-up approach for budget development",
        procedures: [
          "Departmental input collection",
          "Strategic alignment review",
          "Board approval process"
        ]
      },
      {
        title: "Financial Planning",
        description: "Multi-year financial projections and planning",
        procedures: [
          "Three-year rolling projections",
          "Scenario planning",
          "Regular review and updates"
        ]
      }
    ]
  }
];