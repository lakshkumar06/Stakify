import React, { useState, useEffect } from 'react';
import { ChallengeData } from '../hooks/useChallengeContract';
import { formatEther } from 'ethers';

interface ManageChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeData | null;
  onApprove: (challengeAddress: string, participant: string) => Promise<void>;
  onDisapprove: (challengeAddress: string, participant: string) => Promise<void>;
  onEnd: (challengeAddress: string) => Promise<void>;
}

interface Participant {
  address: string;
  proofURL: string;
  completed: boolean;
  approved: boolean;
}

const ManageChallengeForm: React.FC<ManageChallengeFormProps> = ({
  isOpen,
  onClose,
  challenge,
  onApprove,
  onDisapprove,
  onEnd
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (participantAddress: string) => {
    if (!challenge) return;
    try {
      setIsSubmitting(true);
      await onApprove(challenge.address, participantAddress);
    } catch (error) {
      console.error('Failed to approve proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisapprove = async (participantAddress: string) => {
    if (!challenge) return;
    try {
      setIsSubmitting(true);
      await onDisapprove(challenge.address, participantAddress);
    } catch (error) {
      console.error('Failed to disapprove proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndChallenge = async () => {
    if (!challenge) return;
    try {
      setIsSubmitting(true);
      await onEnd(challenge.address);
    } catch (error) {
      console.error('Failed to end challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!challenge) return null;

  const progressPercentage = Number(formatEther(challenge.remainingPool)) / Number(formatEther(challenge.initialPool)) * 100;
  const rewardAmount = (Number(formatEther(challenge.initialPool)) * 20) / 100;
  return (
    <div className={`fixed inset-0 bg-[#edededc7] bg-opacity-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 shadowbox rounded-lg w-[90%] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Manage Challenge</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700  cursor-pointer">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
              Description
            </label>
            <p className="text-[12px] text-gray-600">{challenge.description}</p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
              Pool Status
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-[#9A00A8] rounded-full" 
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
              Reward Amount
            </label>
            <p className="text-[12px] text-gray-600">{rewardAmount} LYX (10% of initial pool)</p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-[5px]">
              Participants
            </label>
            <div className="space-y-2">
              {challenge.participants?.map((participant) => (
                <div key={participant.address} className="">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-medium text-gray-700">
                      {participant.address.slice(0, 2)}...{participant.address.slice(-4)}
                    </span>
                    {participant.proofURL && (
                    <a 
                      href={participant.proofURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#9A00A8] hover:text-[#7A007A] transition-colors duration-200"
                    >
                      View Proof
                    </a>
                  )}
                    {participant.completed && !participant.approved && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(participant.address)}
                          disabled={isSubmitting}
                          className=" transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className='h-[20px]' viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.00006 4.81805V12.9794H3.59872C3.8453 12.9788 4.08155 12.8803 4.25566 12.7057C4.42978 12.5311 4.52755 12.2946 4.52755 12.048V5.74946C4.52755 5.62715 4.50346 5.50603 4.45665 5.39303C4.40985 5.28002 4.34124 5.17735 4.25475 5.09086C4.16826 5.00437 4.06559 4.93576 3.95258 4.88895C3.83958 4.84215 3.71846 4.81805 3.59615 4.81805H1.00006Z" stroke="#9A00A8"/>
<path d="M9.5756 5.60544C9.90002 4.59262 10.0734 3.53753 10.0902 2.47416C10.0902 0.835189 8.28913 1.005 8.28913 1.005C8.28913 1.005 7.55585 4.76151 4.53265 5.83443" stroke="#9A00A8"/>
<path d="M7.89044 5.61829H13.1418C13.1418 5.61829 13.8211 5.67746 13.8211 6.5394C13.8211 7.40134 13.1701 7.40391 13.1701 7.40391H11.8322" stroke="#9A00A8"/>
<path d="M11.8322 9.32586H13.1418C13.1418 9.32586 13.8854 9.32586 13.8854 8.36101C13.8854 7.39615 13.1418 7.40387 13.1418 7.40387" stroke="#9A00A8"/>
<path d="M11.8322 11.2659H13.1418C13.1418 11.2659 13.8854 11.2659 13.8854 10.3011C13.8854 9.33622 13.1418 9.32593 13.1418 9.32593" stroke="#9A00A8"/>
<path d="M4.52759 12.0481L6.88954 12.8199C6.88954 12.8199 7.47617 13.0438 9.66574 12.9923C11.8553 12.9409 11.4436 12.9563 11.9814 12.9383C12.8948 12.9383 13.6641 11.9786 12.6015 11.2787" stroke="#9A00A8"/>
</svg>

                        </button>
                        <button
                          onClick={() => handleDisapprove(participant.address)}
                          disabled={isSubmitting}
                          className=" text-[12px] font-medium  transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className='h-[20px]' viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.8853 9.18195V1.02055H11.2867C11.0401 1.02123 10.8038 1.11966 10.6297 1.29426C10.4556 1.46886 10.3578 1.70538 10.3578 1.95196V8.25054C10.3578 8.37285 10.3819 8.49397 10.4287 8.60697C10.4755 8.71998 10.5441 8.82265 10.6306 8.90914C10.7171 8.99563 10.8198 9.06424 10.9328 9.11105C11.0458 9.15785 11.1669 9.18195 11.2892 9.18195H13.8853Z" stroke="#9A00A8"/>
<path d="M5.30977 8.39456C4.98535 9.40738 4.81196 10.4625 4.79519 11.5258C4.79519 13.1648 6.59624 12.995 6.59624 12.995C6.59624 12.995 7.32953 9.23849 10.3527 8.16557" stroke="#9A00A8"/>
<path d="M6.99493 8.38171H1.74358C1.74358 8.38171 1.06432 8.32254 1.06432 7.4606C1.06432 6.59866 1.71528 6.59609 1.71528 6.59609H3.0532" stroke="#9A00A8"/>
<path d="M3.05322 4.67414H1.7436C1.7436 4.67414 1.00002 4.67414 1.00002 5.63899C1.00002 6.60385 1.7436 6.59613 1.7436 6.59613" stroke="#9A00A8"/>
<path d="M3.05322 2.73407H1.7436C1.7436 2.73407 1.00002 2.73407 1.00002 3.69892C1.00002 4.66378 1.7436 4.67407 1.7436 4.67407" stroke="#9A00A8"/>
<path d="M10.3578 1.95194L7.99584 1.18006C7.99584 1.18006 7.40921 0.95621 5.21964 1.00767C3.03007 1.05913 3.44174 1.04369 2.904 1.0617C1.99061 1.0617 1.2213 2.02141 2.28392 2.72125" stroke="#9A00A8"/>
</svg>

                        </button>
                      </div>
                    )}
                    {participant.approved && (
                      <span className="text-[12px] text-green-600">Approved</span>
                    )}
                  </div>
                  
                </div>
              ))}
              {(!challenge.participants || challenge.participants.length === 0) && (
                <p className="text-[12px] text-gray-500 text-center py-2">No participants yet</p>
              )}
            </div>
          </div>

          {!challenge.ended && (
            <button
              onClick={handleEndChallenge}
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-[12px] font-medium text-white bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex justify-center"
            >
              <svg className="h-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20.5001 6H3.5" stroke="#d71d1d" stroke-width="1.5" stroke-linecap="round"></path> <path d="M18.8332 8.5L18.3732 15.3991C18.1962 18.054 18.1077 19.3815 17.2427 20.1907C16.3777 21 15.0473 21 12.3865 21H11.6132C8.95235 21 7.62195 21 6.75694 20.1907C5.89194 19.3815 5.80344 18.054 5.62644 15.3991L5.1665 8.5" stroke="#d71d1d" stroke-width="1.5" stroke-linecap="round"></path> <path d="M6.5 6C6.55588 6 6.58382 6 6.60915 5.99936C7.43259 5.97849 8.15902 5.45491 8.43922 4.68032C8.44784 4.65649 8.45667 4.62999 8.47434 4.57697L8.57143 4.28571C8.65431 4.03708 8.69575 3.91276 8.75071 3.8072C8.97001 3.38607 9.37574 3.09364 9.84461 3.01877C9.96213 3 10.0932 3 10.3553 3H13.6447C13.9068 3 14.0379 3 14.1554 3.01877C14.6243 3.09364 15.03 3.38607 15.2493 3.8072C15.3043 3.91276 15.3457 4.03708 15.4286 4.28571L15.5257 4.57697C15.5433 4.62992 15.5522 4.65651 15.5608 4.68032C15.841 5.45491 16.5674 5.97849 17.3909 5.99936C17.4162 6 17.4441 6 17.5 6" stroke="#d71d1d" stroke-width="1.5"></path> </g></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageChallengeForm; 