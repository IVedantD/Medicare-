import heroImage from '@/assets/hero-medical.jpg';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Award,
  Calendar,
  ChevronRight,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Stethoscope,
    title: 'General Medicine',
    description: 'Comprehensive primary care for all your health needs with experienced physicians.',
  },
  {
    icon: Heart,
    title: 'Cardiology',
    description: 'Expert heart care with advanced diagnostics and treatment options.',
  },
  {
    icon: Activity,
    title: 'Diagnostics',
    description: 'State-of-the-art laboratory and imaging services for accurate diagnosis.',
  },
  {
    icon: Shield,
    title: 'Preventive Care',
    description: 'Regular health screenings and wellness programs to keep you healthy.',
  },
];

const doctors = [
  {
    name: 'Dr. Sarah Wilson',
    specialization: 'Cardiologist',
    experience: '15 years',
    rating: 4.9,
  },
  {
    name: 'Dr. Michael Chen',
    specialization: 'General Physician',
    experience: '12 years',
    rating: 4.8,
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialization: 'Pediatrician',
    experience: '10 years',
    rating: 4.9,
  },
  {
    name: 'Dr. James Thompson',
    specialization: 'Orthopedic Surgeon',
    experience: '18 years',
    rating: 4.7,
  },
];

const stats = [
  { value: '25+', label: 'Expert Doctors' },
  { value: '10K+', label: 'Happy Patients' },
  { value: '15+', label: 'Years Experience' },
  { value: '98%', label: 'Patient Satisfaction' },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-32 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="h-4 w-4" />
                Trusted Healthcare Since 2010
              </div>
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Your Health is Our{' '}
                <span className="text-gradient-hero">Top Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Experience world-class healthcare with our team of expert doctors. 
                Book appointments online, access your medical records, and receive 
                personalized care tailored to your needs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Get Started
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <a href="#services">Learn More</a>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl lg:text-3xl font-display font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-in-right hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-hero rounded-3xl opacity-20 blur-3xl" />
              <img
                src={heroImage}
                alt="Modern medical facility"
                className="relative rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-xl p-4 border animate-float">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Easy Booking</p>
                    <p className="text-xs text-muted-foreground">Schedule in minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-32 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Our Services
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-display font-bold text-foreground">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="mt-4 text-muted-foreground">
              We offer a wide range of medical services to cater to all your healthcare needs
              with the latest technology and experienced professionals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="group bg-card rounded-xl p-6 border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-32 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Why Choose Us
              </span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                Healthcare Excellence You Can Trust
              </h2>
              <p className="text-muted-foreground">
                At MediCare, we combine cutting-edge medical technology with compassionate 
                care to deliver the best possible outcomes for our patients.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Clock, title: '24/7 Emergency Care', desc: 'Round-the-clock medical assistance' },
                  { icon: Users, title: 'Expert Medical Team', desc: 'Board-certified specialists' },
                  { icon: Award, title: 'Quality Accreditation', desc: 'Internationally recognized standards' },
                  { icon: Shield, title: 'Patient Privacy', desc: 'Secure and confidential records' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="hero" size="lg" asChild>
                <Link to="/register">Book Appointment</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                    <p className="text-4xl font-display font-bold">25+</p>
                    <p className="text-primary-foreground/80">Expert Doctors</p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 border">
                    <p className="text-4xl font-display font-bold text-accent">50+</p>
                    <p className="text-muted-foreground">Specializations</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-card rounded-2xl p-6 border">
                    <p className="text-4xl font-display font-bold text-primary">10K+</p>
                    <p className="text-muted-foreground">Happy Patients</p>
                  </div>
                  <div className="bg-accent rounded-2xl p-6 text-accent-foreground">
                    <p className="text-4xl font-display font-bold">98%</p>
                    <p className="text-accent-foreground/80">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 lg:py-32 bg-muted/50 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Our Team
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-display font-bold text-foreground">
              Meet Our Expert Doctors
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our team of highly qualified medical professionals is dedicated to 
              providing you with the best healthcare experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor, index) => (
              <div
                key={doctor.name}
                className="group bg-card rounded-xl p-6 border hover:border-primary/30 hover:shadow-lg transition-all duration-300 text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-display font-bold text-2xl mb-4">
                  {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {doctor.name}
                </h3>
                <p className="text-sm text-primary font-medium">
                  {doctor.specialization}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {doctor.experience} experience
                </p>
                <div className="flex items-center justify-center gap-1 mt-3">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link to="/register">Book Appointment</Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">View All Doctors</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                Contact Us
              </span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                Get in Touch With Us
              </h2>
              <p className="text-muted-foreground">
                Have questions? We're here to help. Reach out to us through any of the 
                following channels or fill out the contact form.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
                  { icon: Mail, label: 'Email', value: 'contact@medicare.com' },
                  { icon: MapPin, label: 'Address', value: '123 Healthcare Ave, Medical City, MC 12345' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border shadow-lg">
              <h3 className="text-xl font-display font-semibold text-foreground mb-6">
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button variant="hero" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-16 w-full">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                  <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
                </div>
                <span>MediCare</span>
              </Link>
              <p className="text-sidebar-foreground/70 text-sm">
                Providing quality healthcare services with compassion and expertise since 2010.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">About Us</a></li>
                <li><a href="#services" className="hover:text-sidebar-foreground transition-colors">Services</a></li>
                <li><a href="#doctors" className="hover:text-sidebar-foreground transition-colors">Doctors</a></li>
                <li><a href="#contact" className="hover:text-sidebar-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">General Medicine</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Cardiology</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Pediatrics</a></li>
                <li><a href="#" className="hover:text-sidebar-foreground transition-colors">Diagnostics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-sidebar-foreground/70">
                <li>+1 (555) 123-4567</li>
                <li>contact@medicare.com</li>
                <li>123 Healthcare Ave</li>
                <li>Medical City, MC 12345</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-sidebar-border text-center text-sm text-sidebar-foreground/50">
            <p>© {new Date().getFullYear()} MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
