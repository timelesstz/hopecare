export interface BoardMember {
  name: string;
  position: string;
  biography: string;
  contact: string;
  qualifications: string[];
}

export const boardMembers: BoardMember[] = [
  {
    name: "Nuru Aron Ngoteya",
    position: "Chairman",
    biography: "Certified Public Accountant working as an Accountant at MS TCDC and a Freelance Consultant in Financial Management.",
    contact: "0788 180 186",
    qualifications: [
      "CPA-Ongoing",
      "MSc Finance and Investment",
      "Post Graduate Diploma in Microfinance",
      "Advanced Diploma in Accountancy"
    ]
  },
  {
    name: "Ayesiga Buberwa",
    position: "Vice Chairperson",
    biography: "Programs Manager at Tanzania Horticultural Association (TAHA), managing 8 different donor funded projects.",
    contact: "0762 542 253",
    qualifications: [
      "Masters in Community Development",
      "BSc Nutrition"
    ]
  },
  {
    name: "Paul Wilson Mlemya",
    position: "Secretary",
    biography: "Development Practitioner with over 15 years of experience, currently Executive Director at HopeCare Organization and Programme Specialist at UNDP Tanzania.",
    contact: "0769 297 925",
    qualifications: [
      "Master Degree in Project Planning Monitoring and Evaluation",
      "Bachelor of Arts in Public Administration"
    ]
  }
];