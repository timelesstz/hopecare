import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <div className="flex items-center">
                <div className="bg-hopecare-blue rounded-full p-2">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div className="bg-hopecare-orange rounded-full p-2 -ml-2">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">Easing the pain of poverty in Tanzania</p>
            <div className="space-y-2 text-gray-400">
              <p>New Safari Hotel, 402</p>
              <p>Boma Road</p>
              <p>P O Box 303</p>
              <p>Arusha-Tanzania</p>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-2" />
                <span>Tel/Fax: +255 (0) 27 2509720</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-2" />
                <span>Mobile: +255 769 297925</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-2" />
                <span>director@hopecaretz.org</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Globe className="h-5 w-5 mr-2" />
                <span>www.hopecaretz.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Programs</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/programs/economic-empowerment" className="text-gray-400 hover:text-hopecare-orange">
                  Economic Empowerment
                </Link>
              </li>
              <li>
                <Link to="/programs/education" className="text-gray-400 hover:text-hopecare-orange">
                  Education Program
                </Link>
              </li>
              <li>
                <Link to="/programs/health" className="text-gray-400 hover:text-hopecare-orange">
                  Health Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-hopecare-orange">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-hopecare-orange">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-hopecare-orange">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-hopecare-orange">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>Registered as an NGO in 2012 with registration No.00NGO/00005291</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} HopeCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;