import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Globe, Target, Award } from 'lucide-react';
import PageHero from '../components/PageHero';
import TeamMember from '../components/about/TeamMember';
import ValueCard from '../components/about/ValueCard';
import Timeline from '../components/about/Timeline';
import Partners from '../components/about/Partners';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We act with empathy and understanding, putting the needs of our communities first."
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in the power of community-driven development and collective action."
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "Our programs are designed to create lasting, sustainable impact for generations."
    },
    {
      icon: Target,
      title: "Impact",
      description: "We measure our success by the tangible difference we make in people's lives."
    }
  ];

  const teamMembers = [
    {
      name: "Paul Wilson Mlemya",
      role: "Executive Director",
      bio: "A qualified Development Practitioner with over 15 years of experience in Project Management, Grants Writing, Monitoring, Evaluation and Research.",
      detailedBio: "Mr. Paul is a qualified Development Practitioner in Project Management, Grants Writing, Monitoring, Evaluation and Research. He brings over 15 years of diversified working experience with various international NGOs and grass-roots organizations in East Africa around thematic areas of Inclusive Education, Economic Empowerment, Health, Democratic Governance, Human Rights, and Gender Equality. He is very energetic individual with Master Degree in Project Planning Monitoring and Evaluation (MPPME) and a Bachelor of Arts Degree in Public Administration.\n\nCurrently, he is working with HopeCare Organization as the founder and Executive Director, also working with the United Nations Development Programme (UNDP Tanzania) as the Programme Specialist and an Associate Partner for Noble Associates, LLC, a corporate and development consulting firm headquartered in Arusha-Tanzania.\n\nWorking with USAID Tanzania, Paul has managed to nurture over 63 innovative youth-centred businesses with Digital tools to support resilience amidst Covid-19 pandemic n Iringa, Mbeya and Zanzibar (Unguja and Pemba). In addition, through Noble Associates, Paul was the lead consultant of the assignment commissioned by Bain & Company (an American management consulting company) headquartered in Boston, Massachusetts through Dairy Nourishes Africa (DNA) Program that focuses on supporting small emerging Dairy enterprises.\n\nIn addition, Paul has requisite experience in Data Sciences including Mobile Data App development/Coding to suit data collection needs for Project and Program Management, Database Design and Management, and Quality data analysis.",
      image: "/images/team/paul-mlemya.jpeg"
    },
    {
      name: "Mr. Onesmo Peter",
      role: "Finance and Administration Manager",
      bio: "A highly experienced Finance Manager specializing in Financial Reporting, Taxation, and Business Consultation.",
      detailedBio: "Mr. Onesmo is a highly experienced Finance Manager with a proven track record of success in Financia Reporting, Taxation, Business Consultation, Budgeting preparation and control. He has a strong aptitude for data driven decision making and passion for streamlining process for maximize efficiency. Mr. Onesmo possess Masters of Accounting (MA) Institute of Accountancy Arusha, Certified Public Accountant (CPA), Certified Public Bankers (CPB).",
      image: "/images/team/onesmo-peter.jpeg"
    },
    {
      name: "Ms. Catherine Renatus",
      role: "Programs Manager",
      bio: "An experienced Project Management Specialist with expertise in Monitoring, Evaluation and Research.",
      detailedBio: "Ms. Catherine Renatus joins HopeCare Organization as the Programs Manager. She brings on board vast experience as a Project management Specialist, Monitoring, Evaluation and Research. Prior to joining HopeCare, she has been involved in various development works in a wide range of Projects Management. Ms. Catherine holds a bachelor degree of Accounting from Institute of Accountancy Arusha (IAA) and a Post Graduate Diploma in Project Management as a Researcher and Project Management specialist.",
      image: "/images/team/catherine-renatus.png"
    },
    {
      name: "Mr. Benson Laizer",
      role: "Monitoring, Evaluation and Learning Officer",
      bio: "A qualified development specialist with over 10 years of experience in Accounting, Auditing, Research, and M&E.",
      detailedBio: "Mr. Benson Laizer is a qualified development specialist for over 10 years in the field of Accounting, Auditing, Research, Monitoring and Evaluation. His career evolves through engagement in various International and Local NGOs like MM Micro Business Consulting, Double R Investment, and Ifakara Health Institute (IHI). Mr. Benson has joined HopeCare as the Monitoring, Evalutaion and Learning Officer holding a Bachelor Degree in Accounting and a Diploma in Project Management. He is a committed and professional M&E Specialist with the vast experience, skills and qualifications to support Monitoring, Evaluation, Accountability and Learning across various projects.",
      image: "/images/team/benson-laizer.jpg"
    }
  ];

  const timelineEvents = [
    {
      year: "2018",
      title: "Foundation",
      description: "HopeCare was established with a vision to transform communities through sustainable development."
    },
    {
      year: "2019",
      title: "First Programs",
      description: "Launched our initial education and health programs in Arusha region."
    },
    {
      year: "2020",
      title: "Expansion",
      description: "Extended our reach to Mwanza and Dodoma regions, impacting more communities."
    },
    {
      year: "2021",
      title: "Economic Initiative",
      description: "Introduced economic empowerment programs to support sustainable livelihoods."
    },
    {
      year: "2022",
      title: "Recognition",
      description: "Received national award for community development excellence."
    },
    {
      year: "2023",
      title: "Digital Innovation",
      description: "Implemented technology solutions to enhance program delivery and impact measurement."
    }
  ];

  const partners = [
    {
      name: "Ipolili Farms",
      logo: "logos/ipolile.jpeg",
    },
    {
      name: "NGO source",
      logo: "logos/NGOsource.jpeg",
    },
    {
      name: "Vibrant Village Foundation",
      logo: "logos/vibrantvillage.jpeg",
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "10,000+",
      description: "Lives impacted across Tanzania"
    },
    {
      icon: Globe,
      title: "3 Regions",
      description: "Active program presence"
    },
    {
      icon: Users,
      title: "50+",
      description: "Community partnerships"
    },
    {
      icon: Heart,
      title: "95%",
      description: "Beneficiary satisfaction"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageHero
        title="About Us"
        image="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1920"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <section className="py-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8">
              To empower communities through sustainable development initiatives in health,
              education, and economic empowerment, creating lasting positive change
              across Tanzania.
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-xl text-gray-600">
              A Tanzania where every community has access to quality healthcare,
              education, and economic opportunities, enabling all individuals to
              reach their full potential.
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="py-12 bg-gray-50 rounded-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ValueCard key={index} {...value} />
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <achievement.icon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                <p className="text-gray-600">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-xl text-gray-600">
                Dedicated professionals working to make a difference
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {teamMembers.map((member, index) => (
                <TeamMember key={index} {...member} />
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Journey</h2>
          </div>
          <Timeline events={timelineEvents} />
        </section>

        {/* Partners */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Partners</h2>
            <p className="text-xl text-gray-600 mt-4">
              Working together for community development
            </p>
          </div>
          <Partners partners={partners} />
        </section>

        {/* Call to Action */}
        <section className="py-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center bg-rose-50 rounded-xl p-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Together, we can create lasting positive change in communities across Tanzania.
              Join us in our mission to empower and transform lives.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/volunteer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
              >
                Volunteer With Us
              </a>
              <a
                href="/donate"
                className="inline-flex items-center px-6 py-3 border border-rose-600 text-base font-medium rounded-md text-rose-600 hover:bg-rose-50"
              >
                Support Our Work
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
};

export default About;