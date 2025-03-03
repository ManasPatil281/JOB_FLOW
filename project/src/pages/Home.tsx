import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Brain, Users, CheckCircle, ArrowRight, ChevronRight, LogIn, UserCircle } from 'lucide-react';

function Home() {
  const features = [
    {
      icon: <Bot className="w-12 h-12 text-purple-400" />,
      title: "AI-Powered Job Posts",
      description: "Generate professional job descriptions instantly with our advanced AI technology"
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      title: "Smart Resume Processing",
      description: "Analyze and rank resumes automatically based on job requirements"
    },
    {
      icon: <Users className="w-12 h-12 text-purple-400" />,
      title: "Instant Candidate Connect",
      description: "Connect with potential candidates directly through WhatsApp integration"
    }
  ];

  const benefits = [
    "Reduce hiring time by 60%",
    "Improve candidate quality",
    "Streamline recruitment process",
    "Enhanced communication",
    "Data-driven decisions",
    "Cost-effective solution"
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Hiring Process</span> with AI
              </h1>
              <p className="text-xl text-gray-300">
                Streamline your recruitment workflow with our AI-powered platform. Create job posts, process resumes, and connect with candidates instantly.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-lg">
                  Try it Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center text-lg">
                  Watch Demo <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <Link to="/login" className="flex items-center hover:text-purple-400 transition-colors">
                  <LogIn className="w-5 h-5 mr-1" /> Login
                </Link>
                <span>•</span>
                <Link to="/user-dashboard" className="flex items-center hover:text-purple-400 transition-colors">
                  <UserCircle className="w-5 h-5 mr-1" /> My Dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80" 
                alt="AI Recruitment" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300">Everything you need to streamline your recruitment process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-1">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">Why Choose JobFlow AI?</h2>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <span className="text-lg text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
                alt="Team collaboration" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Hiring Process?</h2>
          <p className="text-xl text-gray-300 mb-8">Join thousands of companies using JobFlow AI to streamline their recruitment</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-lg">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/user-dashboard" className="bg-white/10 text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-colors flex items-center text-lg">
              View Dashboard <UserCircle className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;