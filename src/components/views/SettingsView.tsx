import React, { useState } from 'react';
import { Save, Key, Github, Mic } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useSettingsStore } from '@/stores/settingsStore';
import { api } from '@/services/api';

export const SettingsView: React.FC = () => {
  const { updateGitHubConnection } = useSettingsStore();
  const [assemblyaiKey, setAssemblyaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('assemblyai_key', assemblyaiKey);
      localStorage.setItem('anthropic_key', anthropicKey);
      localStorage.setItem('github_token', githubToken);

      // Send to backend
      await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assemblyai_key: assemblyaiKey,
          anthropic_key: anthropicKey
        })
      });

      if (githubToken) {
        updateGitHubConnection(true);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    setAssemblyaiKey(localStorage.getItem('assemblyai_key') || '');
    setAnthropicKey(localStorage.getItem('anthropic_key') || '');
    setGithubToken(localStorage.getItem('github_token') || '');
  }, []);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight">Settings</h1>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Configure your API keys and preferences
          </p>
        </div>

        {/* API Keys Section */}
        <Card className="border-2 border-gray-800 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6" />
            <h2 className="text-2xl font-black uppercase">API Configuration</h2>
          </div>

          <div className="space-y-6">
            {/* AssemblyAI Key */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider">
                AssemblyAI API Key
              </label>
              <p className="text-xs text-gray-500 mb-2">
                For real-time transcription and speaker diarization.{' '}
                <a
                  href="https://www.assemblyai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline"
                >
                  Get your key →
                </a>
              </p>
              <input
                type="password"
                value={assemblyaiKey}
                onChange={(e) => setAssemblyaiKey(e.target.value)}
                placeholder="Enter your AssemblyAI API key"
                className="w-full px-4 py-3 bg-black border-2 border-gray-800 focus:border-white transition-all text-white placeholder:text-gray-600 outline-none font-mono text-sm"
              />
            </div>

            {/* Anthropic Key */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider">
                Anthropic API Key
              </label>
              <p className="text-xs text-gray-500 mb-2">
                For AI-powered summaries and action item extraction.{' '}
                <a
                  href="https://www.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline"
                >
                  Get your key →
                </a>
              </p>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="Enter your Anthropic API key"
                className="w-full px-4 py-3 bg-black border-2 border-gray-800 focus:border-white transition-all text-white placeholder:text-gray-600 outline-none font-mono text-sm"
              />
            </div>

            {/* GitHub Token */}
            <div className="space-y-2">
              <label className="block text-sm font-bold uppercase tracking-wider">
                GitHub Personal Access Token
              </label>
              <p className="text-xs text-gray-500 mb-2">
                For creating issues from action items.{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline"
                >
                  Generate token →
                </a>
              </p>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-black border-2 border-gray-800 focus:border-white transition-all text-white placeholder:text-gray-600 outline-none font-mono text-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
            className="w-full"
          >
            {saved ? 'Saved!' : 'Save Configuration'}
          </Button>
        </Card>

        {/* Info Card */}
        <Card className="border-2 border-gray-800 p-6 bg-gray-950">
          <h3 className="font-black uppercase text-sm mb-4">🔒 Security Note</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your API keys are stored locally in your browser's localStorage and sent
            to the backend server running on your machine. They are never uploaded to
            any external servers. Keep your keys secure and never share them.
          </p>
        </Card>
      </div>
    </div>
  );
};
