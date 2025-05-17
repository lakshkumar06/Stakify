import React, { useState } from 'react';
import { ChallengeData } from '../hooks/useChallengeContract';
import { formatEther } from 'ethers';

interface JoinChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeData | null;
  onSubmit: (challengeAddress: string, proofURL: string) => Promise<void>;
}

const JoinChallengeForm: React.FC<JoinChallengeFormProps> = ({ 
  isOpen, 
  onClose, 
  challenge,
  onSubmit 
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [proofURL, setProofURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoinClick = () => {
    setShowUpload(true);
  };

  const handleBackClick = () => {
    setShowUpload(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !proofURL) return;

    try {
      setIsSubmitting(true);
      await onSubmit(challenge.address, proofURL);
      setProofURL('');
    } catch (error) {
      console.error('Failed to submit proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) return null;

  const progressPercentage = Number(formatEther(challenge.remainingPool)) / Number(formatEther(challenge.initialPool)) * 100;

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
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 transition-colors duration-200  cursor-pointer"
        >
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg ">
            <path d="M5.64411 16.9323L16.9323 5.6441M5.64411 5.6441L16.9323 16.9323" stroke="#9A00A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="relative">
          {!showUpload ? (
            <>
              <h2 className="text-[16px] font-semibold mb-4">Challenge Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
                    Description
                  </label>
                  <p className="text-[12px] text-gray-600">{challenge.description}</p>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
                    Reward Pool
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#9A00A8] transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-gray-600">
                      {formatEther(challenge.remainingPool)}/{formatEther(challenge.initialPool)} LYX
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
                    Reward Percentage
                  </label>
                  <p className="text-[12px] text-gray-600">{challenge.rewardPercent}% per completion</p>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={handleJoinClick}
                    className="px-4 py-2 text-[12px] font-medium text-white bg-[#9A00A8] rounded-md hover:bg-[#7A007A] transition-colors duration-200"
                  >
                    Join Challenge
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={handleBackClick}
                  className="text-[#9A00A8] hover:text-[#7A007A] transition-colors duration-200"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h2 className="text-[16px] font-semibold">Upload Proof</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
                    Link to Proof
                  </label>
                  <input
                    type="url"
                    value={proofURL}
                    onChange={(e) => setProofURL(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A00A8] text-[12px]"
                    placeholder="Enter link to your proof"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="px-4 py-2 text-[12px]  cursor-pointer font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[12px] font-medium text-white bg-[#9A00A8] rounded-md hover:bg-[#7A007A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinChallengeForm; 