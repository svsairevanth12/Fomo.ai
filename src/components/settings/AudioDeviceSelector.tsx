import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Speaker, X, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { PythonAudioAPI, type AudioDevice } from '@/services/pythonAudioApi';

interface AudioDeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceSelected?: (deviceId: number) => void;
}

export const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({
  isOpen,
  onClose,
  onDeviceSelected,
}) => {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load devices on mount
  useEffect(() => {
    if (isOpen) {
      loadDevices();
      
      // Load saved device preference
      const savedDeviceId = localStorage.getItem('selectedAudioDevice');
      if (savedDeviceId) {
        setSelectedDeviceId(parseInt(savedDeviceId, 10));
      }
    }
  }, [isOpen]);

  const loadDevices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await PythonAudioAPI.listDevices();

      if (result.success && result.data) {
        setDevices(result.data);
      } else {
        setError(result.error || 'Failed to load audio devices');
      }
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('[AudioDeviceSelector] Error loading devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDevice = (deviceId: number) => {
    setSelectedDeviceId(deviceId);
  };

  const handleSave = () => {
    if (selectedDeviceId !== null) {
      // Save to localStorage
      localStorage.setItem('selectedAudioDevice', selectedDeviceId.toString());
      
      // Notify parent
      if (onDeviceSelected) {
        onDeviceSelected(selectedDeviceId);
      }
      
      console.log(`[AudioDeviceSelector] Selected device ID: ${selectedDeviceId}`);
    }
    
    onClose();
  };

  const handleUseDefault = () => {
    // Clear saved preference
    localStorage.removeItem('selectedAudioDevice');
    setSelectedDeviceId(null);
    
    if (onDeviceSelected) {
      onDeviceSelected(-1); // -1 indicates default device
    }
    
    console.log('[AudioDeviceSelector] Using default device');
    onClose();
  };

  const getDeviceIcon = (device: AudioDevice) => {
    if (device.type === 'output' || device.is_loopback) {
      return <Speaker className="w-5 h-5" />;
    }
    return <Mic className="w-5 h-5" />;
  };

  const getDeviceTypeLabel = (device: AudioDevice) => {
    if (device.is_loopback) {
      return 'System Audio (Loopback)';
    }
    return device.type === 'output' ? 'Output Device' : 'Input Device';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-800">
              <div>
                <h2 className="text-2xl font-bold uppercase">Select Audio Device</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Choose which audio device to capture from
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:text-black transition-all border-2 border-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Refresh Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
                  onClick={loadDevices}
                  disabled={isLoading}
                  className="border-2 border-gray-800"
                >
                  Refresh Devices
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border-2 border-red-500 text-red-500">
                  <p className="font-bold uppercase">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-gray-400">Loading devices...</p>
                </div>
              )}

              {/* Device List */}
              {!isLoading && devices.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => handleSelectDevice(device.id)}
                      className={`w-full p-4 border-2 transition-all text-left ${
                        selectedDeviceId === device.id
                          ? 'border-white bg-white text-black'
                          : 'border-gray-800 hover:border-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={selectedDeviceId === device.id ? 'text-black' : 'text-white'}>
                          {getDeviceIcon(device)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold uppercase">{device.name}</p>
                            {selectedDeviceId === device.id && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            selectedDeviceId === device.id ? 'text-black/70' : 'text-gray-400'
                          }`}>
                            {getDeviceTypeLabel(device)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Devices */}
              {!isLoading && devices.length === 0 && !error && (
                <div className="text-center py-8 text-gray-400">
                  <p>No audio devices found</p>
                  <p className="text-sm mt-2">Make sure the Python backend is running</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-6 border-t-2 border-gray-800">
              <Button
                variant="ghost"
                onClick={handleUseDefault}
                className="border-2 border-gray-800"
              >
                Use Default Device
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="border-2 border-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={selectedDeviceId === null}
                  className="border-2 border-white"
                >
                  Save Selection
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

