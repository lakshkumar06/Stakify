import './App.css';
import { useState, useEffect } from 'react';
import { useUpProvider } from './context/UpProvider';
import { useChallengeContract, ChallengeData } from './hooks/useChallengeContract';
import UploadForm from './components/UploadForm';
import JoinChallengeForm from './components/JoinChallengeForm';
import ManageChallengeForm from './components/ManageChallengeForm';
import { formatEther } from 'ethers';

function App() {
  const { walletConnected, accounts } = useUpProvider();
  const {
    allChallenges,
    myChallenges,
    loading,
    error,
    getChallengeDetails,
    createChallenge,
    completeChallenge,
    approveProof,
    disapproveProof,
    endChallenge,
    refreshChallenges
  } = useChallengeContract();

  const [popularExpanded, setPopularExpanded] = useState(false);
  const [myChallengesExpanded, setMyChallengesExpanded] = useState(false);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeData | null>(null);
  const [isJoinFormOpen, setIsJoinFormOpen] = useState(false);
  const [isManageFormOpen, setIsManageFormOpen] = useState(false);
  const [selectedManageChallenge, setSelectedManageChallenge] = useState<ChallengeData | null>(null);
  const [challengeDetails, setChallengeDetails] = useState<Map<string, ChallengeData>>(new Map());

  // Add debug logging
  useEffect(() => {
    console.log('App State:', {
      walletConnected,
      accounts,
      allChallenges,
      myChallenges,
      loading,
      error
    });
  }, [walletConnected, accounts, allChallenges, myChallenges, loading, error]);

  // Fetch details for all challenges
  useEffect(() => {
    const fetchDetails = async () => {
      const details = new Map<string, ChallengeData>();
      for (const address of [...allChallenges, ...myChallenges]) {
        const details = await getChallengeDetails(address);
        if (details) {
          challengeDetails.set(address, details);
        }
      }
      setChallengeDetails(new Map(challengeDetails));
    };

    if (walletConnected && (allChallenges.length > 0 || myChallenges.length > 0)) {
      fetchDetails();
    }
  }, [walletConnected, allChallenges, myChallenges, getChallengeDetails]);

  const handleCloseForm = () => {
    setIsUploadFormOpen(false);
  };

  const handleJoinClick = async (challengeAddress: string) => {
    const details = await getChallengeDetails(challengeAddress);
    if (details) {
      setSelectedChallenge(details);
      setIsJoinFormOpen(true);
    }
  };

  const handleCloseJoinForm = () => {
    setIsJoinFormOpen(false);
    setSelectedChallenge(null);
  };

  const handleManageClick = async (challengeAddress: string) => {
    const details = await getChallengeDetails(challengeAddress);
    if (details) {
      setSelectedManageChallenge(details);
      setIsManageFormOpen(true);
    }
  };

  const handleCloseManageForm = () => {
    setIsManageFormOpen(false);
    setSelectedManageChallenge(null);
  };

  const handleCreateChallenge = async (description: string, stake: string) => {
    const stakeWei = BigInt(parseFloat(stake) * 1e18);
    await createChallenge(description, stakeWei);
    handleCloseForm();
    refreshChallenges();
  };

  const handleCompleteChallenge = async (challengeAddress: string, proofURL: string) => {
    await completeChallenge(challengeAddress, proofURL);
    handleCloseJoinForm();
    refreshChallenges();
  };

  const handleApproveProof = async (challengeAddress: string, participant: string) => {
    await approveProof(challengeAddress, participant);
    refreshChallenges();
  };

  const handleDisapproveProof = async (challengeAddress: string, participant: string) => {
    await disapproveProof(challengeAddress, participant);
    refreshChallenges();
  };

  const handleEndChallenge = async (challengeAddress: string) => {
    await endChallenge(challengeAddress);
    handleCloseManageForm();
    refreshChallenges();
  };

  if (!walletConnected) {
    console.log('Wallet not connected, showing connect wallet message');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please Connect your Universal Profile wallet to continue</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('Loading state active, showing loading message');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A00A8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Error state active:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#9A00A8] text-white rounded-md hover:bg-[#7A007A] transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main app content');
  return (
    <div className='w-screen'>
      <div className="w-screen">
        <img src="/image.png" alt="" className="w-screen h-[100px] object-cover" />      
      </div>
      <div className="px-[2%] py-[40px]">
        <div className="flex gap-[1em] justify-between">
          <div className="w-[80%] boxdefault">
            <h3 className="">Current</h3>
          </div>
          <div className="">
            <button 
              className="bg-[#9A00A8] p-[15px] aspect-square rounded-[100px] hover:bg-[#7A007A] transition-colors duration-200"
              onClick={() => setIsUploadFormOpen(true)}
            >
              <svg className='h-[25px]' viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.40002 11H20.6M11 1.39999V20.6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="boxdefault mt-[20px]">
          <div className="flex justify-between">
            <h3 className="">Popular Challenges</h3>
            <button 
              className="dropdown" 
              onClick={() => setPopularExpanded(!popularExpanded)}
            > 
              <svg 
                className={`h-[10px] transition-transform duration-300 ${popularExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 11 7" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 1L5.5 6L1 1" stroke="#ADADAD" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>           
          </div>
          <div className="">
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                popularExpanded ? 'h-[100px] max-h-[150px] overflow-y-auto' : 'h-[0px]'
              }`}
            >
              <div className="pt-[10px]"></div>
              {allChallenges.map((address) => {
                const challenge = challengeDetails.get(address);
                if (!challenge || challenge.ended) return null;
                
                return (
                  <div key={address}>
                    <div className="w-full flex justify-between text-[12px] text-black font-light gap-[1em]">
                      <div className="truncate w-1/2">{challenge.description}</div>
                      <div>LYX {formatEther(challenge.remainingPool)}</div>
                      {!challenge.completed && (
                        <button 
                          className="font-medium text-[#9A00A8] hover:text-[#7A007A] transition-colors duration-200"
                          onClick={() => handleJoinClick(address)}
                        >
                          Join
                        </button>
                      )}
                      {challenge.completed && !challenge.approved && (
                        <span className="text-yellow-600">Pending</span>
                      )}
                      {challenge.approved && (
                        <span className="text-green-600">Approved</span>
                      )}
                    </div>
                    <hr className="h-[1px] border-[#ebebeb] my-[5px]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="boxdefault mt-[20px]">
          <div className="flex justify-between">
            <h3 className="">My Challenges</h3>
            <button 
              className="dropdown" 
              onClick={() => setMyChallengesExpanded(!myChallengesExpanded)}
            > 
              <svg 
                className={`h-[10px] transition-transform duration-300 ${myChallengesExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 11 7" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 1L5.5 6L1 1" stroke="#ADADAD" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>           
          </div>
          <div className="">
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                myChallengesExpanded ? 'h-[100px] max-h-[150px] overflow-y-auto' : 'h-[0px]'
              }`}
            >
              <div className="pt-[10px]"></div>
              {myChallenges.map((address) => {
                const challenge = challengeDetails.get(address);
                if (!challenge) return null;

                return (
                  <div key={address}>
                    <div className="w-full flex justify-between text-[12px] text-black font-light gap-[1em]">
                      <div className="truncate w-1/2">{challenge.description}</div>
                      <div>{formatEther(challenge.remainingPool)}/{formatEther(challenge.initialPool)}</div>
                      {!challenge.ended && (
                        <button 
                          className="font-medium text-[#9A00A8] hover:text-[#7A007A] transition-colors duration-200"
                          onClick={() => handleManageClick(address)}
                        >
                          Manage
                        </button>
                      )}
                      {challenge.ended && (
                        <span className="text-gray-600">Ended</span>
                      )}
                    </div>
                    <hr className="h-[1px] border-[#ebebeb] my-[5px]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <UploadForm 
        isOpen={isUploadFormOpen} 
        onClose={handleCloseForm}
        onSubmit={handleCreateChallenge}
      />

      <JoinChallengeForm
        isOpen={isJoinFormOpen}
        onClose={handleCloseJoinForm}
        challenge={selectedChallenge}
        onSubmit={handleCompleteChallenge}
      />

      <ManageChallengeForm
        isOpen={isManageFormOpen}
        onClose={handleCloseManageForm}
        challenge={selectedManageChallenge}
        onApprove={handleApproveProof}
        onDisapprove={handleDisapproveProof}
        onEnd={handleEndChallenge}
      />
    </div>
  );
}

export default App;
