import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaBolt, FaTint, FaBroom, FaArrowRight, FaCheckCircle, FaStar, FaUserCheck, FaEllipsisH } from 'react-icons/fa';
import Logo from '../../assets/icons/HomeServe_Transparent_Logo.png';

interface ServiceCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100">
    <div className="text-4xl mb-6 text-[#1ED760] flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface ServicesProps {
  services: Array<{name: string, description: string, icon: React.ReactElement}>;
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  return (
    <section className="py-24 bg-gray-50" id="services">
      <div className="container mx-auto px-[5%]">
        <div className="text-center mb-16">
          <span className="text-[#1ED760] font-semibold">Our Services</span>
          <h2 className="text-4xl font-bold mt-2 mb-4">What We Offer</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose from our wide range of professional home services delivered by verified experts in your area.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.name}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Navbar: React.FC = () => {
  return (
    <nav className="fixed w-full bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#1ED760] flex items-center">
          <span className="text-3xl mr-2">HomeServe</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About Us</Link>
          <a href="/login" className="bg-[#1ED760] text-white px-6 py-2 rounded-full hover:bg-[#19b050] transition-colors font-medium">
            Login
          </a>
        </div>
        <button className="md:hidden text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

const Hero: React.FC = () => {
  return (
    <div className="pt-20 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-[5%] py-20">
        <div className="flex flex-wrap items-center">
          {/* Homeowner section (left side) */}
          <div className="w-full md:w-1/2 pr-4 mb-12 md:mb-0">
            <span className="bg-[#e6f9ee] text-[#1ED760] px-4 py-1 rounded-full text-sm font-medium">Home Services Platform</span>
            <h1 className="text-[3.5rem] font-bold text-gray-900 mt-6 mb-6 leading-tight">
              Your Home Services, <span className="text-[#1ED760]">Simplified</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Connect with verified service providers for all your home maintenance needs. Real-time tracking, instant booking, and reliable service - all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="bg-[#1ED760] text-white px-8 py-4 rounded-full hover:bg-[#19b050] inline-block text-center font-medium shadow-lg hover:shadow-xl transition-all">
                Book a Service
              </Link>
              <a href="#how-it-works" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 inline-block text-center font-medium transition-all">
                Learn How It Works
              </a>
            </div>
            <div className="mt-8 flex items-center space-x-4">
            </div>
          </div>
          
          {/* Service Provider section (right side) */}
          <div className="w-full md:w-1/2 pl-4 md:pl-16 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Are you a service provider?
            </h2>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center">
                <FaCheckCircle className="text-[#1ED760] mr-3" />
                <span className="text-gray-700">Connect with homeowners in your area</span>
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-[#1ED760] mr-3" />
                <span className="text-gray-700">Grow your business with new customers</span>
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-[#1ED760] mr-3" />
                <span className="text-gray-700">Manage appointments efficiently</span>
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-[#1ED760] mr-3" />
                <span className="text-gray-700">Get paid faster and more securely</span>
              </li>
            </ul>
            <Link to="/signup?type=provider" className="bg-[#1ED760] text-white px-8 py-4 rounded-full hover:bg-[#19b050] flex items-center justify-center max-w-xs font-medium shadow-lg hover:shadow-xl transition-all">
              Join as Provider <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="how-it-works">
      <div className="container mx-auto px-[5%]">
        <div className="text-center mb-16">
          <span className="text-[#1ED760] font-semibold">Simple Process</span>
          <h2 className="text-4xl font-bold mt-2 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Get your home services done in just a few simple steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#e6f9ee] rounded-full flex items-center justify-center text-[#1ED760] text-xl font-bold mx-auto mb-6">1</div>
            <h3 className="text-xl font-semibold mb-3">Book a Service</h3>
            <p className="text-gray-600">Choose the service you need and select your preferred time slot.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#e6f9ee] rounded-full flex items-center justify-center text-[#1ED760] text-xl font-bold mx-auto mb-6">2</div>
            <h3 className="text-xl font-semibold mb-3">Get Matched</h3>
            <p className="text-gray-600">We'll connect you with a qualified service provider in your area.</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-[#e6f9ee] rounded-full flex items-center justify-center text-[#1ED760] text-xl font-bold mx-auto mb-6">3</div>
            <h3 className="text-xl font-semibold mb-3">Service Delivered</h3>
            <p className="text-gray-600">The professional arrives at your home and completes the job.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-[#1ED760] to-[#19b050] text-white">
      <div className="container mx-auto px-[5%] text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto">Join thousands of satisfied homeowners using HomeServe for all their home service needs</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="bg-white text-[#1ED760] px-8 py-4 rounded-full hover:bg-gray-100 inline-block font-semibold shadow-lg hover:shadow-xl transition-all">
            Sign Up as Homeowner
          </Link>
          <Link to="/signup?type=provider" className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full hover:bg-white/10 inline-block font-semibold transition-all">
            Register as Provider
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center space-x-6">
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-[5%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-40 mb-7">
          <div>
            <div className="text-2xl font-bold mb-6 flex items-center">
              HomeServe
            </div>
            <p className="text-gray-400 mb-6">Connecting homeowners with trusted service providers.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Plumbing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Electrical</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cleaning</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Maintenance</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>
          
          {/* <div>
            <h3 className="text-lg font-semibold mb-6">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div> */}
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HomeServe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const LandingPage: React.FC = () => {
  const services = [
    {
      name: 'Plumbing',
      icon: <FaTint size={28} />,
      description: 'Expert plumbing services for leaks, installations, and repairs'
    },
    {
      name: 'Electrical',
      icon: <FaBolt size={28} />,
      description: 'Safe and reliable electrical services for your home'
    },
    {
      name: 'Cleaning',
      icon: <FaBroom size={28} />,
      description: 'Professional cleaning services for a spotless home'
    },
    {
      name: 'Maintenance',
      icon: <FaTools size={28} />,
      description: 'Regular maintenance to keep your home in perfect condition'
    },
    {
      name: 'Many More',
      icon: <FaEllipsisH size={28} />,
      description: 'Discover our full range of services for all your home needs'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services services={services} />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
