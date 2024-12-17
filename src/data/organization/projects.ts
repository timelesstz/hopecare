export interface Project {
  name: string;
  period: {
    start: string;
    end: string;
  };
  targetAudience: string[];
  coverage: string[];
  intervention: string[];
  beneficiaries: number;
  donor: {
    name: string;
    contact: {
      person: string;
      phone?: string;
      email?: string;
    };
  };
  amount: number;
}

export const pastProjects: Project[] = [
  {
    name: "Abstinence Behavior Change for Youth (ABY)",
    period: {
      start: "July 2020",
      end: "ongoing"
    },
    targetAudience: [
      "850 Fly Catchers Youths",
      "1200 young women engaged in transactional sex"
    ],
    coverage: [
      "Karatu District (Karatu, Rhotia, Mangola and Qurus ward)",
      "Babati District (Babati, Magugu, Madunga and Mamire ward)"
    ],
    intervention: [
      "HIV behavioral change and communication interventions",
      "Community Economic Empowerment through VICOBA"
    ],
    beneficiaries: 2050,
    donor: {
      name: "African Wildlife Foundation (AWF)",
      contact: {
        person: "Pastor W. Magingi",
        phone: "+255 754 369 502",
        email: "pmagingi@awf.org"
      }
    },
    amount: 450000
  },
  {
    name: "Save the Kids and Youths (SKY) Program",
    period: {
      start: "May 2019",
      end: "ongoing"
    },
    targetAudience: [
      "500 HIV positive kids (under five)",
      "650 youths below the age of 18 years old"
    ],
    coverage: [
      "Kigoma Refugees Transit Centre",
      "Nyarugusu Refugee Camp"
    ],
    intervention: [
      "HIV Testing",
      "Counseling",
      "Nutrition support"
    ],
    beneficiaries: 1150,
    donor: {
      name: "The United Nations World Food Programme (WFP)",
      contact: {
        person: "John Thobius",
        phone: "+255 755 655 820",
        email: "john.nzwalile@wfp.org"
      }
    },
    amount: 350000
  }
];