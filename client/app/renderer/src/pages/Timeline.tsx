import { motion } from 'framer-motion';
import { Clock, Code, GitPullRequest, MessageCircle, FileText, Bug, Sparkles } from 'lucide-react';
import { Timeline } from '../components/ui/timeline';
import { Highlight } from '../components/ui/hero-highlight';
import { AppBackground } from '../components/ui/app-background';

export default function TimelinePage() {
  const timelineData = [
    {
      title: "Started refactoring authentication",
      description: "Began modernizing the auth flow with JWT tokens and refresh mechanisms. Implemented secure token storage and rotation strategies.",
      time: "10:30 AM",
      icon: <Code className="w-5 h-5 text-blue-400" />,
      badge: "Development"
    },
    {
      title: "Reviewed PR #234",
      description: "Provided feedback on database migration scripts and suggested optimizations for better performance and data integrity.",
      time: "11:45 AM",
      icon: <GitPullRequest className="w-5 h-5 text-purple-400" />,
      badge: "Code Review"
    },
    {
      title: "Meeting: Architecture discussion",
      description: "Discussed microservices architecture and service mesh implementation. Explored API gateway patterns and service discovery.",
      time: "2:15 PM",
      icon: <MessageCircle className="w-5 h-5 text-pink-400" />,
      badge: "Meeting"
    },
    {
      title: "Fixed bug in payment gateway",
      description: "Resolved race condition in payment processing that was causing duplicate charges. Added proper locking mechanisms.",
      time: "3:30 PM",
      icon: <Bug className="w-5 h-5 text-green-400" />,
      badge: "Bug Fix"
    },
    {
      title: "Updated documentation",
      description: "Added API documentation for new endpoints and updated deployment guide with latest infrastructure changes.",
      time: "4:45 PM",
      icon: <FileText className="w-5 h-5 text-yellow-400" />,
      badge: "Documentation"
    },
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Clock className="w-16 h-16 text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <Highlight className="text-slate-100">
              Activity Timeline
            </Highlight>
          </h1>
          
          <p className="text-slate-400 text-lg">
            Your memory evolution and activity stream
          </p>
        </motion.div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <Timeline data={timelineData} />
        </div>
      </div>
    </div>
  );
}
              
