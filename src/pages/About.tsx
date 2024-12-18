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
      name: "Dr. Sarah Kimani",
      role: "Executive Director",
      bio: "With over 15 years of experience in community development, Dr. Kimani leads our organization's mission to transform lives.",
      image: "/images/team/sarah-kimani.jpg"
    },
    {
      name: "John Mwangi",
      role: "Programs Director",
      bio: "John brings extensive experience in program management and community engagement to our initiatives.",
      image: "/images/team/john-mwangi.jpg"
    },
    {
      name: "Grace Ochieng",
      role: "Community Relations",
      bio: "Grace ensures our programs remain responsive to community needs and maintain strong local partnerships.",
      image: "/images/team/grace-ochieng.jpg"
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
      name: "Global Health Initiative",
      logo: "/images/partners/global-health.png",
      description: "Supporting healthcare programs worldwide"
    },
    {
      name: "Education First",
      logo: "/images/partners/education-first.png",
      description: "Advancing education accessibility"
    },
    {
      name: "Community Foundation",
      logo: "/images/partners/community-foundation.png",
      description: "Building stronger communities"
    },
    {
      name: "Green Earth Alliance",
      logo: "/images/partners/green-earth.png",
      description: "Environmental sustainability partner"
    },
    {
      name: "Tech for Good",
      logo: "/images/partners/tech-for-good.png",
      description: "Digital empowerment solutions"
    },
    {
      name: "Youth Empowerment Network",
      logo: "/images/partners/youth-network.png",
      description: "Supporting youth initiatives"
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
        description="Transforming communities through sustainable development and empowerment"
        image="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
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
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            <p className="text-xl text-gray-600 mt-4">
              Dedicated professionals working to make a difference
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
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