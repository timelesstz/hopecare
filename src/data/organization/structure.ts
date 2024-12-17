export interface Department {
  name: string;
  head: string;
  roles: string[];
}

export interface OrganizationalStructure {
  board: {
    position: string;
    name: string;
  }[];
  executiveDirector: string;
  departments: {
    programs: Department[];
    support: Department[];
  };
}

export const organizationalStructure: OrganizationalStructure = {
  board: [
    { position: "Chairman", name: "Mr. Nuru Aron Ngoteya" },
    { position: "Vice Chairperson", name: "Ms. Ayesiga Buberwa" },
    { position: "Secretary", name: "Mr. Paul Wilson Mlemya" },
    { position: "Treasurer", name: "Mrs. Jane Kayora" },
    { position: "Board Member", name: "Mr. Giovanni John Ndyebonera" },
    { position: "Board Member", name: "Mr. Felician Mutahengerwa" }
  ],
  executiveDirector: "Mr. Paul Wilson Mlemya",
  departments: {
    programs: [
      {
        name: "Economic Empowerment",
        head: "Program Manager",
        roles: [
          "Business Skills Facilitator",
          "Micro-Finance Coordinator",
          "Market Linkage Specialist",
          "Food Security Officer"
        ]
      },
      {
        name: "Education",
        head: "Program Manager",
        roles: [
          "Vulnerable Children Education Coordinator",
          "Adult Literacy Facilitator",
          "School Infrastructure Support Officer"
        ]
      },
      {
        name: "Health",
        head: "Program Manager",
        roles: [
          "HIV/AIDS Prevention and Care Coordinator",
          "Adolescent Reproductive Health Officer",
          "Maternal Health and Child Care Specialist"
        ]
      }
    ],
    support: [
      {
        name: "Finance and Administration",
        head: "Finance Manager",
        roles: [
          "Accountant",
          "Administrative Assistant"
        ]
      },
      {
        name: "Monitoring and Evaluation",
        head: "M&E Manager",
        roles: [
          "Data Analyst",
          "Research Assistant"
        ]
      }
    ]
  }
};