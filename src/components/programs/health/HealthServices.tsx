import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Baby, Brain, FirstAid, Stethoscope, Pill } from 'lucide-react';

const services = [
  {
    icon: Baby,
    title: "Maternal & Child Health",
    description: "Comprehensive care for mothers and children, including prenatal services, immunizations, and pediatric care.",
    features: [
      "Prenatal check-ups",
      "Child immunization programs",
      "Nutritional support",
      "Growth monitoring"
    ]
  },
  {
    icon: Heart,
    title: "Primary Healthcare",
    description: "Essential health services including preventive care, health screenings, and treatment for common conditions.",
    features: [
      "Regular health check-ups",
      "Disease prevention",
      "Health screenings",
      "Basic treatments"
    ]
  },
  {
    icon: Brain,
    title: "Mental Health Support",
    description: "Mental health services and counseling to support emotional and psychological well-being.",
    features: [
      "Counseling services",
      "Support groups",
      "Mental health education",
      "Crisis intervention"
    ]
  },
  {
    icon: FirstAid,
    title: "Emergency Care",
    description: "24/7 emergency medical services and rapid response care for urgent health needs.",
    features: [
      "Emergency response",
      "First aid services",
      "Urgent care",
      "Medical transport"
    ]
  },
  {
    icon: Stethoscope,
    title: "Specialist Care",
    description: "Access to specialized medical services through our network of healthcare professionals.",
    features: [
      "Specialist consultations",
      "Chronic disease management",
      "Specialized treatments",
      "Follow-up care"
    ]
  },
  {
    icon: Pill,
    title: "Pharmacy Services",
    description: "Access to essential medicines and pharmaceutical care at affordable prices.",
    features: [
      "Essential medicines",
      "Prescription services",
      "Medicine counseling",
      "Affordable pricing"
    ]
  }
];

const HealthServices = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Health Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive healthcare services designed to meet the diverse needs of our
            community members at every stage of life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-center mb-4">
                <div className="bg-rose-100 rounded-lg p-3">
                  <service.icon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 ml-4">{service.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-rose-600 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthServices;