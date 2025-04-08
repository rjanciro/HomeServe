import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUsers, FaHandshake, FaStar, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import RenzProfilePic from '../../assets/images/GC-ID-PIC.jpg';

const AboutUsPage: React.FC = () => {
  useDocumentTitle('About Us | HomeServe');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-24">
        <div className="container mx-auto px-[5%] text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About <span className="text-green-500">HomeServe</span></h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're connecting homeowners with trusted service providers to make home maintenance simple, reliable, and stress-free.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-[5%]">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0">
              <span className="text-green-500 font-semibold">Our Mission</span>
              <h2 className="text-4xl font-bold mt-2 mb-6">Simplifying Home Services</h2>
              <p className="text-gray-600 text-lg mb-6">
                At HomeServe, we believe maintaining your home should be simple. Our mission is to create a seamless connection between homeowners and qualified service providers, ensuring every home service experience is reliable, transparent, and satisfying.
              </p>
              <p className="text-gray-600 text-lg">
                We're transforming the home services industry by building a platform that values quality work, clear communication, and customer satisfaction above all else.
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/about-mission.jpg" 
                alt="HomeServe mission" 
                className="rounded-xl shadow-xl w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-[5%]">
          <div className="text-center mb-16">
            <span className="text-green-500 font-semibold">Our Story</span>
            <h2 className="text-4xl font-bold mt-2 mb-4">How We Started</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              HomeServe was developed as a capstone project by our team at Integrated College, addressing real-world challenges in the home services industry.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
              <div className="bg-white p-8 rounded-xl shadow-md h-full">
                <h3 className="text-2xl font-semibold mb-4">The Academic Challenge</h3>
                <p className="text-gray-600 mb-4">
                  As part of our Bachelor of Science in Information Technology program, we were tasked with creating a solution that addresses a significant market need and demonstrates our technical and business skills.
                </p>
                <p className="text-gray-600">
                  After researching various industries, we identified the home services sector as one that could greatly benefit from technological innovation and a more streamlined approach to connecting service providers with homeowners.
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2 md:pl-8">
              <div className="bg-white p-8 rounded-xl shadow-md h-full">
                <h3 className="text-2xl font-semibold mb-4">Our Solution</h3>
                <p className="text-gray-600 mb-4">
                  We developed HomeServe as a comprehensive platform where homeowners can easily find verified service providers, read authentic reviews, and book services with confidence.
                </p>
                <p className="text-gray-600">
                  This project allowed us to apply our academic knowledge to a real-world problem while gaining valuable experience in software development, user experience design, and project management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container mx-auto px-[5%]">
          <div className="text-center mb-16">
            <span className="text-green-500 font-semibold">Our Values</span>
            <h2 className="text-4xl font-bold mt-2 mb-4">What We Stand For</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do at HomeServe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <FaHandshake size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trust & Reliability</h3>
              <p className="text-gray-600">
                We verify all service providers and maintain high standards for quality and professionalism.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <FaStar size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Satisfaction</h3>
              <p className="text-gray-600">
                We prioritize exceptional experiences for both homeowners and service providers.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <FaLightbulb size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform to make home services more efficient and accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-[5%]">
          <div className="text-center mb-16">
            <span className="text-green-500 font-semibold">Our Team</span>
            <h2 className="text-4xl font-bold mt-2 mb-4">The People Behind HomeServe</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We're a team of dedicated students passionate about improving the home services experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                <img 
                  src={RenzProfilePic} 
                  alt="Team member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Leohyray Belleza</h3>
              <p className="text-green-500 font-medium mb-4">Co-founder & CEO</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                <img 
                  src={RenzProfilePic} 
                  alt="Renz Joshua Anciro" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Renz Joshua Anciro</h3>
              <p className="text-green-500 font-medium mb-4">Specialist (Developer)</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                <img 
                  src={RenzProfilePic} 
                  alt="Team member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Mark Fredel Aducal</h3>
              <p className="text-green-500 font-medium mb-4">Communications Officer</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6">
                <img 
                  src={RenzProfilePic} 
                  alt="Team member" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">Timothy Lance Dela Cruz</h3>
              <p className="text-green-500 font-medium mb-4">Quality Assurance Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-[5%] text-center">
          <h2 className="text-4xl font-bold mb-6">Join the HomeServe Community</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Whether you're a homeowner looking for reliable services or a service provider ready to grow your business, HomeServe is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white text-green-500 px-8 py-4 rounded-full hover:bg-gray-100 inline-block font-semibold shadow-lg hover:shadow-xl transition-all">
              Sign Up as Homeowner
            </Link>
            <Link to="/signup?type=provider" className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-full hover:bg-white/10 inline-block font-semibold transition-all">
              Register as Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage; 