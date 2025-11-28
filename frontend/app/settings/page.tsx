"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, User, Settings as SettingsIcon, Bell, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "notifications">("account");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Settings page - loading:", loading, "user:", user ? "exists" : "null");
  }, [loading, user]);

  // Redirect to home if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !user) {
      console.log("Redirecting to home - no user");
      router.push('/');
    }
  }, [loading, user, router]);

  // Show loading state while checking auth
  if (loading) {
    console.log("Showing loading screen");
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect via useEffect)
  if (!user) {
    console.log("No user, returning null");
    return null;
  }

  console.log("Rendering settings page for user:", user.email);

  const tabs = [
    { id: "account" as const, label: "Account", icon: User },
    { id: "preferences" as const, label: "Preferences", icon: SettingsIcon },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  const handleChangeName = async () => {
    if (!newName.trim() || !user) return;

    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateUserProfile(newName.trim());

      // Also update Firestore if user document exists
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: newName.trim(),
          updatedAt: new Date().toISOString(),
        });
      }

      setShowNameModal(false);
      setNewName("");
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim() || !user) return;

    setIsSaving(true);
    try {
      // Update username in Firestore
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          username: newUsername.trim(),
          updatedAt: new Date().toISOString(),
        });
      }

      setShowUsernameModal(false);
      setNewUsername("");

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-[#1a1a1a] border-r border-gray-800">
          {/* Back button */}
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
          </div>

          {/* Settings title */}
          <div className="p-4">
            <h2 className="text-sm text-gray-500 mb-4">Settings</h2>

            {/* Navigation tabs */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 pl-16 pt-12">
          <div className="max-w-3xl mx-auto">
            {/* Account Tab */}
            {activeTab === "account" && (
              <div>
                <h1 className="text-2xl font-semibold mb-12">Account</h1>

                {/* Profile section */}
                <div className="space-y-0">
                  {/* Profile picture */}
                  <div className="flex items-center py-4 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: '#20808D' }}>
                          {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-medium text-gray-200">{user.displayName || 'User'}</h3>
                        <p className="text-sm text-gray-500">{user.email?.split('@')[0] || ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Full name */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Full Name
                      </label>
                      <p className="text-sm text-gray-500">{user.displayName || 'Not set'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewName(user.displayName || '');
                        setShowNameModal(true);
                      }}
                      className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Change Name
                    </button>
                  </div>

                  {/* Username */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Username
                      </label>
                      <p className="text-sm text-gray-500">{user.email?.split('@')[0] || 'Not set'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNewUsername(user.email?.split('@')[0] || '');
                        setShowUsernameModal(true);
                      }}
                      className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Change Username
                    </button>
                  </div>

                  {/* Email */}
                  <div className="py-4 border-b border-gray-800">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                {/* Permissions section */}
                <div className="mt-12">
                  <h2 className="text-lg font-semibold mb-6">Permissions</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#2a2a2a] border border-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-200 mb-2">
                        Pro Features Access
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Unlock advanced features with a Pro subscription
                      </p>
                      <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ backgroundColor: '#20808D', color: 'white' }}>
                          Upgrade Now
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Occupation section */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-6">Occupation</h2>
                  <div className="p-6 bg-[#2a2a2a] border border-gray-700 rounded-lg">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Occupation *
                      </label>
                      <div className="relative">
                        <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                          <option>Select your occupation</option>
                          <option>Veterinarian</option>
                          <option>Veterinary Student</option>
                          <option>Veterinary Nurse</option>
                          <option>Veterinary Technician</option>
                          <option>Researcher</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="p-4 bg-[#1a1a1a] border border-gray-700 rounded-lg">
                      <h3 className="text-center text-base font-semibold text-gray-200 mb-3">
                        Veterinary Credentials
                      </h3>
                      <p className="text-xs text-gray-400 text-center mb-6">
                        Ruleout is free for verified veterinary professionals and students. Provisional access will be granted for 48 hours, and expanded access will be granted after verification.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            School *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your school name"
                            className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              Graduation Year *
                            </label>
                            <div className="relative">
                              <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                                <option>2024</option>
                                <option>2025</option>
                                <option>2026</option>
                                <option>2027</option>
                                <option>2028</option>
                                <option>2029</option>
                                <option>2030</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              Month *
                            </label>
                            <div className="relative">
                              <select className="appearance-none w-full px-4 py-2.5 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer">
                                <option>January</option>
                                <option>February</option>
                                <option>March</option>
                                <option>April</option>
                                <option>May</option>
                                <option>June</option>
                                <option>July</option>
                                <option>August</option>
                                <option>September</option>
                                <option>October</option>
                                <option>November</option>
                                <option>December</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs text-gray-400">
                            A verification document is already on record.{' '}
                            <button className="text-[#20808D] hover:underline">
                              Click here
                            </button>{' '}
                            to upload a new file.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div>
                <h1 className="text-2xl font-semibold mb-12">Preferences</h1>

                <div className="space-y-8">
                  {/* General Section */}
                  <div className="space-y-0">
                    {/* Theme */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Theme</h3>
                        <p className="text-xs text-gray-500 mt-1">Choose how Ruleout looks to you</p>
                      </div>
                      <div className="relative">
                        <select className="appearance-none px-4 py-2 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer min-w-[120px]">
                          <option>Dark</option>
                          <option>Light</option>
                          <option>System</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Language</h3>
                        <p className="text-xs text-gray-500 mt-1">Language used in the interface</p>
                      </div>
                      <div className="relative">
                        <select className="appearance-none px-4 py-2 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer min-w-[120px]">
                          <option>English</option>
                          <option>Korean</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Preferred Language */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Preferred Language</h3>
                        <p className="text-xs text-gray-500 mt-1">Language used by AI</p>
                      </div>
                      <div className="relative">
                        <select className="appearance-none px-4 py-2 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer min-w-[160px]">
                          <option>Auto (detect)</option>
                          <option>English</option>
                          <option>Korean</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Auto-save */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Auto-save</h3>
                        <p className="text-xs text-gray-500 mt-1">Automatically save all responses to chat history</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                      </label>
                    </div>

                    {/* Homepage Widget */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-300">Homepage Widget</h3>
                        <p className="text-xs text-gray-500 mt-1">Show widget on the homepage</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Advanced Section */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Advanced</h2>

                    <div className="space-y-0">
                      {/* Model */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">Model</h3>
                        </div>
                        <button className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm hover:bg-gray-800 transition-colors min-w-[120px] text-left flex items-center justify-between">
                          <span>Open in New Tab</span>
                        </button>
                      </div>

                      {/* Image Generation Model */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div>
                          <h3 className="text-sm font-medium text-gray-300">Image Generation Model</h3>
                        </div>
                        <div className="relative">
                          <select className="appearance-none px-4 py-2 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gray-600 cursor-pointer min-w-[140px]">
                            <option>Default</option>
                            <option>DALL-E 3</option>
                            <option>Stable Diffusion</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* AI Data Usage */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-800">
                        <div className="flex-1 max-w-xl">
                          <h3 className="text-sm font-medium text-gray-300">AI Data Usage</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Allow Ruleout to use conversations to improve AI models. You can opt out anytime in settings.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div>
                <h1 className="text-2xl font-semibold mb-12">Notifications</h1>

                <div className="space-y-0">
                  {/* Email notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">Email Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Push notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">Push Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">Receive push notifications on this device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* New features */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">New Features</h3>
                      <p className="text-xs text-gray-500 mt-1">Get notified about new features and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* System updates */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">System Updates</h3>
                      <p className="text-xs text-gray-500 mt-1">Important system notifications and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>

                  {/* Tips and suggestions */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300">Tips & Suggestions</h3>
                      <p className="text-xs text-gray-500 mt-1">Helpful tips to get the most out of the platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#20808D]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Change Name</h2>
              <button
                onClick={() => setShowNameModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                placeholder="Enter your full name"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeName}
                disabled={!newName.trim() || isSaving}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#20808D', color: 'white' }}
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Change Username</h2>
              <button
                onClick={() => setShowUsernameModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-gray-600"
                placeholder="Enter your username"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUsernameModal(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeUsername}
                disabled={!newUsername.trim() || isSaving}
                className="flex-1 px-4 py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#20808D', color: 'white' }}
              >
                {isSaving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
