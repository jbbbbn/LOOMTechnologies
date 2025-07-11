import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Upload, 
  Users, 
  Shield, 
  Zap, 
  Database,
  StickyNote,
  Calendar,
  Search,
  Mail,
  MessageCircle,
  Images,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import loomLogo from "@assets/LOOM_logo_2_1752244843559.jpg";

export default function Landing() {
  const features = [
    {
      icon: Brain,
      title: "Consciousness Upload",
      description: "Revolutionary technology to upload and clone human consciousness to the cloud"
    },
    {
      icon: Database,
      title: "Digital Twin Creation",
      description: "AI analyzes your behavior across all apps to create your complete digital personality"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Military-grade encryption protects your consciousness data and personal information"
    },
    {
      icon: Zap,
      title: "AI-Powered Apps",
      description: "Integrated suite of intelligent applications that learn and adapt to your needs"
    }
  ];

  const apps = [
    { icon: StickyNote, name: "LOOM Notes", description: "AI-enhanced note-taking with smart tagging" },
    { icon: Calendar, name: "LOOM Calendar", description: "Intelligent scheduling and event management" },
    { icon: Search, name: "LOOM Search", description: "Personalized internet search with learning" },
    { icon: Mail, name: "LOOM Mail", description: "Smart email management and insights" },
    { icon: MessageCircle, name: "LOOM Chat", description: "AI assistant with full context awareness" },
    { icon: Images, name: "LOOM Gallery", description: "Intelligent media organization and analysis" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={loomLogo} alt="LOOM" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-2xl font-bold text-gray-900">LOOM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden sm:inline-flex">
                About
              </Button>
              <Button variant="ghost" className="hidden sm:inline-flex">
                Technology
              </Button>
              <Button variant="ghost" className="hidden sm:inline-flex">
                Contact
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)] text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-[var(--loom-orange)] border-[var(--loom-orange)]">
            Revolutionary Technology
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Upload Your <span className="text-[var(--loom-orange)]">Consciousness</span>
            <br />to the Cloud
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            LOOM is pioneering the future of human consciousness preservation and cloning. 
            Our AI-powered platform creates your complete digital twin by learning from your daily activities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)] text-white"
              onClick={() => window.location.href = '/login'}
            >
              Start Your Digital Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Future of Human Consciousness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology that captures, analyzes, and preserves your unique personality and behavior patterns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-[var(--loom-orange)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-[var(--loom-orange)]" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integrated AI-Powered Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our suite of intelligent applications work together to understand and learn from your behavior.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="w-10 h-10 bg-[var(--loom-orange)]/10 rounded-lg flex items-center justify-center mr-3">
                    <app.icon className="w-5 h-5 text-[var(--loom-orange)]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {app.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--loom-orange)] to-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Upload Your Consciousness?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of human consciousness preservation. Create your digital twin today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.location.href = '/login'}
              className="bg-white text-[var(--loom-orange)] hover:bg-gray-50"
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--loom-orange)]">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={loomLogo} alt="LOOM" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xl font-bold">LOOM</span>
              </div>
              <p className="text-gray-400">
                Revolutionary consciousness uploading and cloning technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Technology</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Consciousness Upload</li>
                <li>Digital Twin Creation</li>
                <li>AI Learning</li>
                <li>Data Security</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Applications</h3>
              <ul className="space-y-2 text-gray-400">
                <li>LOOM Notes</li>
                <li>LOOM Calendar</li>
                <li>LOOM Search</li>
                <li>LOOM Mail</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Privacy</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LOOM Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}