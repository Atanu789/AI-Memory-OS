import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Lock, Palette, Database, Zap } from 'lucide-react';
import { HoverEffect } from '../components/ui/card-hover-effect';
import { AppBackground } from '../components/ui/app-background';

export default function Settings() {
  const settingsCategories = [
    {
      title: "Notifications",
      description: "Configure alerts, insights frequency, and notification preferences for your memory system.",
      icon: <Bell className="w-10 h-10 text-blue-400" />,
    },
    {
      title: "Privacy & Security",
      description: "Manage data retention policies, encryption settings, and access controls for your memories.",
      icon: <Lock className="w-10 h-10 text-green-400" />,
    },
    {
      title: "Appearance",
      description: "Customize theme, colors, and visual preferences to match your workflow style.",
      icon: <Palette className="w-10 h-10 text-purple-400" />,
    },
    {
      title: "Data Management",
      description: "Control storage, backups, exports, and data retention policies for your knowledge graph.",
      icon: <Database className="w-10 h-10 text-pink-400" />,
    },
    {
      title: "Integrations",
      description: "Connect external services like GitHub, Slack, Calendar, and other productivity tools.",
      icon: <Zap className="w-10 h-10 text-yellow-400" />,
    },
    {
      title: "AI Settings",
      description: "Configure AI model preferences, insight generation frequency, and automation rules.",
      icon: <SettingsIcon className="w-10 h-10 text-cyan-400" />,
    },
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      <AppBackground />
      
      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <SettingsIcon className="w-10 h-10 text-slate-400 drop-shadow-[0_0_20px_rgba(148,163,184,0.5)]" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-slate-400 text-lg ml-14">
            Configure your AI Memory OS experience
          </p>
        </motion.div>

        <HoverEffect items={settingsCategories} className="mt-8" />
      </div>
    </div>
  );
}
