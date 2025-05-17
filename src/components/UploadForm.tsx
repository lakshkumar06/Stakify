import React, { useState } from 'react';

interface UploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, stake: string) => Promise<void>;
}

const UploadForm: React.FC<UploadFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !stake) return;

    try {
      setIsSubmitting(true);
      await onSubmit(description, stake);
      setDescription('');
      setStake('');
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-[#edededc7] flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`bg-white shadowbox rounded-lg p-6 w-[90%] max-w-md relative transform transition-all duration-300 ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.64411 16.9323L16.9323 5.6441M5.64411 5.6441L16.9323 16.9323" stroke="#9A00A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className="text-[16px] font-semibold mb-4">Create New Challenge</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
              Challenge Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A00A8] text-[12px]"
              placeholder="Describe what participants need to do"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
              Stake Amount (LYX)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A00A8] text-[12px]"
              placeholder="Enter stake amount in LYX"
              min="0"
              step="0.000000000000000001"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[12px] font-medium text-white bg-[#9A00A8] rounded-md hover:bg-[#7A007A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm; 