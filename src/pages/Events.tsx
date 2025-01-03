import React from 'react';
import { motion } from 'framer-motion';

interface Event {
  id: number;
  title: string;
  description: string;
  progress: number;
  image: string;
}

const Events = () => {
  const events: Event[] = [
    {
      id: 1,
      title: "HIV/Maternal Health Training",
      description: "HopeCareTz HIV/Maternal Health Community Facilitator, delivering a training on maternal health and HIV to a group of identified community-based outreach teams in Kiteto district, Manyara region, Tanzania.",
      progress: 45,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Home-Based Care Training",
      description: "Home-Based Care givers, in a practical gloves wearing test during the maternal and HIV/AIDS training in Kiteto, Manyara region-Tanzania.",
      progress: 50,
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Women's Land Rights Meeting",
      description: "A meeting with traditional leaders, participating in a mobilization meeting for women access top land and decision making in Longido district, Arusha region, Tanzania.",
      progress: 65,
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      title: "Adult Education Program",
      description: "A group of Maasai women adult education learners attentively following-up adult literacy class session facilitated by HopeCareTz organization in Monduli district, Arusha region-Tanzania",
      progress: 72,
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      title: "Water Infrastructure Inspection",
      description: "HopeCareTz Executive Director (Mr. Paul W. Mlemya) inspecting the water harvesting tanks construction to primary schools in Ngorongoro, Arusha region-Tanzania.",
      progress: 86,
      image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      title: "Volunteer Connection Program",
      description: "A group of volunteers participating at HopeCareTz's volunteer connection program activities in Arusha, Tanzania",
      progress: 68,
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 7,
      title: "Market Connect Project",
      description: "A beneficiary of HopeCareTz's market connect project under the economic empowerment program showcasing her tomato farm located at Mlangarini village in Arusha, Tanzania",
      progress: 61,
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 8,
      title: "VSLA Training",
      description: "HopeCareTz's Executive Director facilitating a TOT class on village Saving and Lending Associations (VSLAs) commonly known as VICOBA at Dodoma district, Tanzania",
      progress: 73,
      image: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 9,
      title: "Youth VSLA Training",
      description: "A trained VSLA TOT facilitating practical savings and lending activities to one of the youth group in Dodoma district, Tanzania",
      progress: 75,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 10,
      title: "Enyoro Women VSLA Group",
      description: "Enyoro Women VSLA group in action. Money counter verifying group members' shares in Simanjiro district, Manyara region, Tanzania",
      progress: 70,
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 11,
      title: "VSLA Documentation",
      description: "A beneficiary of the VSLAs showcase her shares register book",
      progress: 48,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 12,
      title: "Income Generation Visit",
      description: "Field Visit Income Generating Activity at Moivaro Ward, Arusha",
      progress: 52,
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 13,
      title: "Water Facility Inauguration",
      description: "Inauguration of the Water Facility at Ngurumausi village, Arusha DC",
      progress: 72,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 14,
      title: "Ngurumausi Site Visit",
      description: "Site visit at Ngurumausi village",
      progress: 61,
      image: "https://images.unsplash.com/photo-1552664688-cf412ec27db2?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 15,
      title: "VSLA Training Success",
      description: "Group photo with Mshikamano & Osotwa Members after a successful VSLA Training session at Moivaro Village.",
      progress: 85,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 16,
      title: "VSLA Training Session",
      description: "Hopecaretz Executive Director trying to facilitate VSLA Training session with Osotwa & Mshikamano Group",
      progress: 85,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 17,
      title: "VSLA Member Engagement",
      description: "Members engagement during the VSLA Training Session",
      progress: 80,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">HopeCareTz Events</h1>
          <p className="text-lg text-gray-600">Making a difference in our communities through various initiatives</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{event.title}</span>
                    <span className="text-white bg-primary/80 px-2 py-1 rounded text-sm">
                      {event.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${event.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;