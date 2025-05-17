import { useCallback, useEffect, useState } from 'react';
import { useUpProvider } from '../context/UpProvider';
import { useSmartContract } from './useSmartContract';
import { Contract, EventLog } from 'ethers';
import ChallengeFactoryABI from '../contracts/ChallengeFactory.json';
import ChallengeABI from '../contracts/Challenge.json';
import { luksoTestnet } from 'viem/chains';
import { encodeFunctionData, decodeFunctionResult, hexToBytes, decodeEventLog, keccak256 } from 'viem';

// Contract addresses for LUKSO testnet
const CHALLENGE_FACTORY_ADDRESS = import.meta.env.VITE_CHALLENGE_FACTORY_ADDRESS;

if (!CHALLENGE_FACTORY_ADDRESS) {
  console.error('Challenge Factory address not found in environment variables');
}

// Convert ABI arrays to the format ethers.js expects
const factoryABI = { abi: ChallengeFactoryABI };
const challengeABI = { abi: ChallengeABI };

export interface ChallengeData {
  address: string;
  creator: string;
  description: string;
  initialPool: bigint;
  remainingPool: bigint;
  rewardPercent: number;
  ended: boolean;
  completed: boolean;
  approved: boolean;
  proofURL: string;
  participants?: ParticipantData[];
}

export interface ParticipantData {
  address: string;
  completed: boolean;
  approved: boolean;
  proofURL: string;
}

export const useChallengeContract = () => {
  const { client, walletConnected, accounts, chainId } = useUpProvider();
  const { executeFunctionWithUProvider, getContractInstance } = useSmartContract();
  const [allChallenges, setAllChallenges] = useState<string[]>([]);
  const [myChallenges, setMyChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify we're on LUKSO testnet
  useEffect(() => {
    if (chainId && chainId !== luksoTestnet.id) {
      setError('Please connect to LUKSO testnet');
    } else {
      setError(null);
    }
  }, [chainId]);

  // Helper function to wait for transaction
  const waitForTransaction = async (hash: string) => {
    let receipt = null;
    while (!receipt) {
      try {
        // Use the correct method from the LUKSO client
        const response = await client.request({
          method: 'eth_getTransactionReceipt',
          params: [hash]
        });
        
        if (response) {
          receipt = response;
          break;
        }
      } catch (err) {
        console.error('Error getting transaction receipt:', err);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return receipt;
  };

  // Helper function to safely convert to BigInt
  const safeBigInt = (value: any): bigint => {
    if (value === undefined || value === null) return BigInt(0);
    try {
      return BigInt(value);
    } catch (err) {
      console.error('Error converting to BigInt:', err);
      return BigInt(0);
    }
  };

  // Fetch all challenges
  const fetchAllChallenges = useCallback(async () => {
    if (!client || !accounts[0]) return;
    try {
      console.log('Fetching all challenges...');
      console.log('Using client:', client);
      console.log('Using account:', accounts[0]);
      console.log('Using factory address:', CHALLENGE_FACTORY_ADDRESS);
      
      // Encode the function call
      const data = encodeFunctionData({
        abi: factoryABI.abi,
        functionName: 'getAllChallenges',
      });
      console.log('Encoded function data:', data);

      // Call the contract using LUKSO client
      console.log('Making eth_call to contract:', CHALLENGE_FACTORY_ADDRESS);
      const response = await client.request({
        method: 'eth_call',
        params: [
          {
            from: accounts[0] as `0x${string}`,
            to: CHALLENGE_FACTORY_ADDRESS as `0x${string}`,
            data,
          },
          'latest'
        ]
      });
      
      // Extract the result from the JSON-RPC response
      const result = response.result;
      console.log('Raw contract response type:', typeof result);
      console.log('Raw contract response:', result);

      if (!result) {
        console.error('No response from contract');
        throw new Error('No response from contract');
      }

      if (typeof result !== 'string') {
        console.error('Invalid response type:', typeof result);
        console.error('Response value:', result);
        throw new Error('Invalid response type from contract');
      }

      if (!result.startsWith('0x')) {
        console.error('Response is not a hex string:', result);
        throw new Error('Response is not a hex string');
      }

      // Decode the result
      console.log('Decoding result...');
      try {
        const decodedResult = decodeFunctionResult({
          abi: factoryABI.abi,
          functionName: 'getAllChallenges',
          data: result as `0x${string}`
        }) as string[];
        console.log('Decoded result:', decodedResult);
        console.log('Decoded result type:', typeof decodedResult);
        console.log('Is array?', Array.isArray(decodedResult));

        // Filter out zero addresses
        const validChallenges = decodedResult.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
        console.log('Valid challenges:', validChallenges);
        setAllChallenges(validChallenges);
      } catch (decodeError) {
        console.error('Error decoding result:', decodeError);
        throw new Error('Failed to decode contract response');
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError('Failed to fetch challenges. Please check console for details.');
    }
  }, [client, accounts]);

  // Fetch my challenges
  const fetchMyChallenges = useCallback(async () => {
    if (!client || !accounts[0]) return;
    try {
      console.log('Fetching my challenges...');
      console.log('Using client:', client);
      console.log('Using account:', accounts[0]);
      console.log('Using factory address:', CHALLENGE_FACTORY_ADDRESS);
      
      // Encode the function call
      const data = encodeFunctionData({
        abi: factoryABI.abi,
        functionName: 'getChallengesByCreator',
        args: [accounts[0]]
      });
      console.log('Encoded function data:', data);

      // Call the contract using LUKSO client
      console.log('Making eth_call to contract:', CHALLENGE_FACTORY_ADDRESS);
      const response = await client.request({
        method: 'eth_call',
        params: [
          {
            from: accounts[0] as `0x${string}`,
            to: CHALLENGE_FACTORY_ADDRESS as `0x${string}`,
            data,
          },
          'latest'
        ]
      });
      
      // Extract the result from the JSON-RPC response
      const result = response.result;
      console.log('Raw contract response type:', typeof result);
      console.log('Raw contract response:', result);

      if (!result) {
        console.error('No response from contract');
        throw new Error('No response from contract');
      }

      if (typeof result !== 'string') {
        console.error('Invalid response type:', typeof result);
        console.error('Response value:', result);
        throw new Error('Invalid response type from contract');
      }

      if (!result.startsWith('0x')) {
        console.error('Response is not a hex string:', result);
        throw new Error('Response is not a hex string');
      }

      // Decode the result
      console.log('Decoding result...');
      try {
        const decodedResult = decodeFunctionResult({
          abi: factoryABI.abi,
          functionName: 'getChallengesByCreator',
          data: result as `0x${string}`
        }) as string[];
        console.log('Decoded result:', decodedResult);
        console.log('Decoded result type:', typeof decodedResult);
        console.log('Is array?', Array.isArray(decodedResult));

        // Filter out zero addresses
        const validChallenges = decodedResult.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
        console.log('Valid challenges:', validChallenges);
        setMyChallenges(validChallenges);
      } catch (decodeError) {
        console.error('Error decoding result:', decodeError);
        throw new Error('Failed to decode contract response');
      }
    } catch (err) {
      console.error('Failed to fetch my challenges:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError('Failed to fetch my challenges. Please check console for details.');
    }
  }, [client, accounts]);

  // Get challenge participants
  const getChallengeParticipants = useCallback(async (challengeAddress: string): Promise<ParticipantData[]> => {
    if (!client) return [];
    
    try {
      console.log('Getting participants for challenge:', challengeAddress);
      
      // Calculate event signatures
      const challengeCompletedSig = '0x' + keccak256('ChallengeCompleted(address,string)' as `0x${string}`).slice(2);
      const proofApprovedSig = '0x' + keccak256('ProofApproved(address,uint256)' as `0x${string}`).slice(2);
      const proofDisapprovedSig = '0x' + keccak256('ProofDisapproved(address)' as `0x${string}`).slice(2);
      
      console.log('Event signatures:', {
        challengeCompleted: challengeCompletedSig,
        proofApproved: proofApprovedSig,
        proofDisapproved: proofDisapprovedSig
      });
      
      // Get all ChallengeCompleted events from block 0
      const completedLogsResponse = await client.request({
        method: 'eth_getLogs',
        params: [{
          address: challengeAddress as `0x${string}`,
          fromBlock: '0x0',
          toBlock: 'latest',
          topics: [
            challengeCompletedSig,
            null // participant address (null to get all)
          ]
        }]
      });
      console.log('Completed logs response:', completedLogsResponse);

      // Get all ProofApproved events from block 0
      const approvedLogsResponse = await client.request({
        method: 'eth_getLogs',
        params: [{
          address: challengeAddress as `0x${string}`,
          fromBlock: '0x0',
          toBlock: 'latest',
          topics: [
            proofApprovedSig,
            null // participant address (null to get all)
          ]
        }]
      });
      console.log('Approved logs response:', approvedLogsResponse);

      // Get all ProofDisapproved events from block 0
      const disapprovedLogsResponse = await client.request({
        method: 'eth_getLogs',
        params: [{
          address: challengeAddress as `0x${string}`,
          fromBlock: '0x0',
          toBlock: 'latest',
          topics: [
            proofDisapprovedSig,
            null // participant address (null to get all)
          ]
        }]
      });
      console.log('Disapproved logs response:', disapprovedLogsResponse);

      // Create a map of participants
      const participantMap = new Map<string, ParticipantData>();

      // Process completed events
      console.log('Processing completed events...');
      for (const log of completedLogsResponse) {
        try {
          console.log('Processing completed log:', log);
          // Decode the log data
          const decodedLog = decodeEventLog({
            abi: challengeABI.abi,
            data: log.data as `0x${string}`,
            topics: [log.topics[0], log.topics[1]] as [`0x${string}`, `0x${string}`],
            strict: false
          });
          console.log('Decoded completed log:', decodedLog);

          if (decodedLog.eventName === 'ChallengeCompleted' && decodedLog.args && 'participant' in decodedLog.args && 'proofURL' in decodedLog.args) {
            const participant = decodedLog.args.participant as string;
            const proofURL = decodedLog.args.proofURL as string;
            console.log('Adding participant from completed event:', { participant, proofURL });
            
            participantMap.set(participant, {
              address: participant,
              completed: true,
              approved: false,
              proofURL
            });
          }
        } catch (err) {
          console.error('Error decoding completed event:', err);
        }
      }

      // Process approved events
      console.log('Processing approved events...');
      for (const log of approvedLogsResponse) {
        try {
          console.log('Processing approved log:', log);
          // Decode the log data
          const decodedLog = decodeEventLog({
            abi: challengeABI.abi,
            data: log.data as `0x${string}`,
            topics: [log.topics[0], log.topics[1]] as [`0x${string}`, `0x${string}`],
            strict: false
          });
          console.log('Decoded approved log:', decodedLog);

          if (decodedLog.eventName === 'ProofApproved' && decodedLog.args && 'participant' in decodedLog.args) {
            const participant = decodedLog.args.participant as string;
            console.log('Updating participant approval status:', participant);
            const existing = participantMap.get(participant);
            if (existing) {
              existing.approved = true;
              participantMap.set(participant, existing);
            }
          }
        } catch (err) {
          console.error('Error decoding approved event:', err);
        }
      }

      // Process disapproved events
      console.log('Processing disapproved events...');
      for (const log of disapprovedLogsResponse) {
        try {
          console.log('Processing disapproved log:', log);
          // Decode the log data
          const decodedLog = decodeEventLog({
            abi: challengeABI.abi,
            data: log.data as `0x${string}`,
            topics: [log.topics[0], log.topics[1]] as [`0x${string}`, `0x${string}`],
            strict: false
          });
          console.log('Decoded disapproved log:', decodedLog);

          if (decodedLog.eventName === 'ProofDisapproved' && decodedLog.args && 'participant' in decodedLog.args) {
            const participant = decodedLog.args.participant as string;
            console.log('Removing disapproved participant:', participant);
            participantMap.delete(participant);
          }
        } catch (err) {
          console.error('Error decoding disapproved event:', err);
        }
      }

      const participants = Array.from(participantMap.values());
      console.log('Final participants list:', participants);
      return participants;
    } catch (err) {
      console.error('Failed to get challenge participants:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      return [];
    }
  }, [client]);

  // Get challenge details
  const getChallengeDetails = useCallback(async (challengeAddress: string): Promise<ChallengeData | null> => {
    if (!client || !accounts[0]) return null;
    try {
      console.log('Getting challenge details for:', challengeAddress);
      
      // Get all the data in parallel using eth_call
      const [
        creatorResponse,
        descriptionResponse,
        initialPoolResponse,
        remainingPoolResponse,
        rewardPercentResponse,
        endedResponse,
        participantsResponse
      ] = await Promise.all([
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'creator'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'description'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'initialPool'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'remainingPool'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'REWARD_PERCENT'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'ended'
            })
          }, 'latest']
        }),
        client.request({
          method: 'eth_call',
          params: [{
            from: accounts[0] as `0x${string}`,
            to: challengeAddress as `0x${string}`,
            data: encodeFunctionData({
              abi: challengeABI.abi,
              functionName: 'participants',
              args: [accounts[0]]
            })
          }, 'latest']
        })
      ]);

      // Log raw responses for debugging
      console.log('Raw responses:', {
        creator: creatorResponse,
        description: descriptionResponse,
        initialPool: initialPoolResponse,
        remainingPool: remainingPoolResponse,
        rewardPercent: rewardPercentResponse,
        ended: endedResponse,
        participants: participantsResponse
      });

      // Extract results from responses
      const creatorResult = creatorResponse.result;
      const descriptionResult = descriptionResponse.result;
      const initialPoolResult = initialPoolResponse.result;
      const remainingPoolResult = remainingPoolResponse.result;
      const rewardPercentResult = rewardPercentResponse.result;
      const endedResult = endedResponse.result;
      const participantsResult = participantsResponse.result;

      // Validate all results
      const validateResult = (result: unknown, field: string): result is `0x${string}` => {
        if (typeof result !== 'string' || !result.startsWith('0x')) {
          console.error(`Invalid response for ${field}:`, result);
          return false;
        }
        return true;
      };

      if (!validateResult(creatorResult, 'creator') ||
          !validateResult(descriptionResult, 'description') ||
          !validateResult(initialPoolResult, 'initialPool') ||
          !validateResult(remainingPoolResult, 'remainingPool') ||
          !validateResult(rewardPercentResult, 'rewardPercent') ||
          !validateResult(endedResult, 'ended') ||
          !validateResult(participantsResult, 'participants')) {
        throw new Error('Invalid response from contract');
      }

      // Decode all results
      try {
        const creator = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'creator',
          data: creatorResult
        }) as string;
        console.log('Decoded creator:', creator);

        const description = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'description',
          data: descriptionResult
        }) as string;
        console.log('Decoded description:', description);

        const initialPool = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'initialPool',
          data: initialPoolResult
        }) as bigint;
        console.log('Decoded initialPool:', initialPool);

        const remainingPool = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'remainingPool',
          data: remainingPoolResult
        }) as bigint;
        console.log('Decoded remainingPool:', remainingPool);

        const rewardPercent = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'REWARD_PERCENT',
          data: rewardPercentResult
        }) as bigint;
        console.log('Decoded rewardPercent:', rewardPercent);

        const ended = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'ended',
          data: endedResult
        }) as boolean;
        console.log('Decoded ended:', ended);

        const participant = decodeFunctionResult({
          abi: challengeABI.abi,
          functionName: 'participants',
          data: participantsResult
        }) as [boolean, boolean, string];
        console.log('Decoded participant:', participant);

        // Get participants data
        const participants = await getChallengeParticipants(challengeAddress);

        return {
          address: challengeAddress,
          creator: creator || '',
          description: description || '',
          initialPool: safeBigInt(initialPool),
          remainingPool: safeBigInt(remainingPool),
          rewardPercent: Number(rewardPercent) || 0,
          ended: Boolean(ended),
          completed: Boolean(participant[0]),
          approved: Boolean(participant[1]),
          proofURL: participant[2] || '',
          participants
        };
      } catch (decodeError) {
        console.error('Error decoding challenge details:', decodeError);
        throw new Error('Failed to decode challenge details');
      }
    } catch (err) {
      console.error('Failed to get challenge details:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      return null;
    }
  }, [client, accounts, getChallengeParticipants]);

  // Create new challenge
  const createChallenge = useCallback(async (description: string, stake: bigint) => {
    if (!client || !accounts[0]) return;
    try {
      setLoading(true);
      const contract = await getContractInstance(CHALLENGE_FACTORY_ADDRESS, client, factoryABI.abi);
      const data = contract.interface.encodeFunctionData("createChallenge", [description]);
      
      // Ensure stake is a valid BigInt
      const safeStake = safeBigInt(stake);
      
      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: CHALLENGE_FACTORY_ADDRESS as `0x${string}`,
        data: data,
        value: safeStake,
      });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(txResponse);
      console.log('Challenge creation receipt:', receipt);

      // Find the ChallengeCreated event
      const event = receipt.logs?.find(
        (log: any) => log.fragment?.name === "ChallengeCreated"
      );

      if (event) {
        console.log('Challenge created:', event.args);
        await fetchAllChallenges();
        await fetchMyChallenges();
      } else {
        throw new Error('ChallengeCreated event not found in receipt');
      }
    } catch (err) {
      console.error('Failed to create challenge:', err);
      setError('Failed to create challenge. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [client, accounts, getContractInstance, fetchAllChallenges, fetchMyChallenges]);

  // Complete challenge
  const completeChallenge = useCallback(async (challengeAddress: string, proofURL: string) => {
    if (!client || !accounts[0]) return;
    try {
      setLoading(true);
      const contract = await getContractInstance(challengeAddress, client, challengeABI.abi);
      const data = contract.interface.encodeFunctionData("completeChallenge", [proofURL]);
      
      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: challengeAddress as `0x${string}`,
        data: data,
      });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(txResponse);
      console.log('Complete challenge receipt:', receipt);
    } catch (err) {
      console.error('Failed to complete challenge:', err);
      setError('Failed to complete challenge. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [client, accounts, getContractInstance]);

  // Add a manual refresh function that shows loading state
  const refreshChallenges = useCallback(async () => {
    setLoading(true);
    try {
      // Add a delay between fetches
      await fetchAllChallenges();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchMyChallenges();
    } finally {
      setLoading(false);
    }
  }, [fetchAllChallenges, fetchMyChallenges]);

  // Helper function to estimate gas
  const estimateGas = async (to: string, data: string, value: bigint): Promise<bigint> => {
    if (!client || !accounts[0]) return BigInt(300000); // Default fallback
    
    try {
      // For UP transactions, we'll use a fixed gas limit since estimation might not work
      // This is a safe default for most UP execute operations
      return BigInt(500000);
    } catch (err) {
      console.error('Error estimating gas:', err);
      // Return a safe default if estimation fails
      return BigInt(500000);
    }
  };

  // Helper function to send transaction through UP
  const sendUPTransaction = async (to: string, data: string, value: bigint): Promise<string> => {
    if (!client || !accounts[0]) return '';
    
    try {
      // For UP transactions, we need to use execute function
      const executeData = encodeFunctionData({
        abi: [{
          inputs: [
            { name: 'operationType', type: 'uint256' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ],
          name: 'execute',
          outputs: [],
          stateMutability: 'payable',
          type: 'function'
        }],
        functionName: 'execute',
        args: [
          BigInt(0), // CALL operation
          to as `0x${string}`,
          value,
          data as `0x${string}`
        ]
      });

      // Use a fixed gas limit for UP transactions
      const gasLimit = BigInt(500000);

      console.log('Sending UP transaction...', {
        to: accounts[0], // Send to UP address
        data: executeData,
        value: value.toString(),
        gas: gasLimit.toString()
      });

      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: accounts[0] as `0x${string}`, // Send to UP address
        data: executeData,
        value: value,
        gas: gasLimit
      });

      console.log('UP transaction sent:', txResponse);
      return txResponse;
    } catch (err) {
      console.error('Error sending UP transaction:', err);
      throw err;
    }
  };

  // Approve proof
  const approveProof = useCallback(async (challengeAddress: string, participant: string) => {
    if (!client || !accounts[0]) return;
    try {
      setLoading(true);
      console.log('Starting proof approval process...', {
        challengeAddress,
        participant,
        approver: accounts[0]
      });

      // First, verify we're the creator
      const creatorResponse = await client.request({
        method: 'eth_call',
        params: [{
          from: accounts[0] as `0x${string}`,
          to: challengeAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: challengeABI.abi,
            functionName: 'creator'
          })
        }, 'latest']
      });
      console.log('Creator response:', creatorResponse);

      if (!creatorResponse.result) {
        throw new Error('Failed to get creator address');
      }

      const creator = decodeFunctionResult({
        abi: challengeABI.abi,
        functionName: 'creator',
        data: creatorResponse.result as `0x${string}`
      }) as string;
      console.log('Decoded creator:', creator);

      if (creator.toLowerCase() !== accounts[0].toLowerCase()) {
        throw new Error('Only the challenge creator can approve proofs');
      }

      // Check if challenge is ended
      const endedResponse = await client.request({
        method: 'eth_call',
        params: [{
          from: accounts[0] as `0x${string}`,
          to: challengeAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: challengeABI.abi,
            functionName: 'ended'
          })
        }, 'latest']
      });
      console.log('Ended response:', endedResponse);

      if (!endedResponse.result) {
        throw new Error('Failed to get ended status');
      }

      const ended = decodeFunctionResult({
        abi: challengeABI.abi,
        functionName: 'ended',
        data: endedResponse.result as `0x${string}`
      }) as boolean;
      console.log('Decoded ended status:', ended);

      if (ended) {
        throw new Error('Challenge has already ended');
      }

      // Check participant status
      const participantResponse = await client.request({
        method: 'eth_call',
        params: [{
          from: accounts[0] as `0x${string}`,
          to: challengeAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: challengeABI.abi,
            functionName: 'participants',
            args: [participant]
          })
        }, 'latest']
      });
      console.log('Participant response:', participantResponse);

      if (!participantResponse.result) {
        throw new Error('Failed to get participant status');
      }

      const participantData = decodeFunctionResult({
        abi: challengeABI.abi,
        functionName: 'participants',
        data: participantResponse.result as `0x${string}`
      }) as [boolean, boolean, string];
      console.log('Decoded participant data:', participantData);

      if (!participantData[0]) {
        throw new Error('Participant has not completed the challenge');
      }

      if (participantData[1]) {
        throw new Error('Participant is already approved');
      }

      // Check remaining pool
      const remainingPoolResponse = await client.request({
        method: 'eth_call',
        params: [{
          from: accounts[0] as `0x${string}`,
          to: challengeAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: challengeABI.abi,
            functionName: 'remainingPool'
          })
        }, 'latest']
      });
      console.log('Remaining pool response:', remainingPoolResponse);

      if (!remainingPoolResponse.result) {
        throw new Error('Failed to get remaining pool');
      }

      const remainingPool = decodeFunctionResult({
        abi: challengeABI.abi,
        functionName: 'remainingPool',
        data: remainingPoolResponse.result as `0x${string}`
      }) as bigint;
      console.log('Decoded remaining pool:', remainingPool.toString());

      // Get initial pool to calculate reward
      const initialPoolResponse = await client.request({
        method: 'eth_call',
        params: [{
          from: accounts[0] as `0x${string}`,
          to: challengeAddress as `0x${string}`,
          data: encodeFunctionData({
            abi: challengeABI.abi,
            functionName: 'initialPool'
          })
        }, 'latest']
      });
      console.log('Initial pool response:', initialPoolResponse);

      if (!initialPoolResponse.result) {
        throw new Error('Failed to get initial pool');
      }

      const initialPool = decodeFunctionResult({
        abi: challengeABI.abi,
        functionName: 'initialPool',
        data: initialPoolResponse.result as `0x${string}`
      }) as bigint;
      console.log('Decoded initial pool:', initialPool.toString());

      // Calculate reward (20% of initial pool)
      const reward = (initialPool * BigInt(20)) / BigInt(100);
      console.log('Calculated reward:', reward.toString());

      if (remainingPool < reward) {
        throw new Error('Insufficient remaining pool for reward');
      }

      const contract = await getContractInstance(challengeAddress, client, challengeABI.abi);
      console.log('Got contract instance');
      
      const data = contract.interface.encodeFunctionData("approveProof", [participant]);
      console.log('Encoded function data:', data);
      
      // Send transaction through UP without value
      console.log('Sending approval transaction through UP');
      const txResponse = await sendUPTransaction(challengeAddress, data, BigInt(0));
      console.log('Transaction sent:', txResponse);

      // Wait for transaction to be mined
      console.log('Waiting for transaction receipt...');
      const receipt = await waitForTransaction(txResponse);
      console.log('Transaction receipt:', receipt);
      
      // Refresh challenges after approval
      console.log('Refreshing challenges...');
      await refreshChallenges();
      console.log('Approval process completed successfully');
    } catch (err) {
      console.error('Failed to approve proof:', err);
      if (err instanceof Error) {
        console.error('Error details:', err.message);
        console.error('Error stack:', err.stack);
      }
      setError('Failed to approve proof. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [client, accounts, getContractInstance, refreshChallenges]);

  // Disapprove proof
  const disapproveProof = useCallback(async (challengeAddress: string, participant: string) => {
    if (!client || !accounts[0]) return;
    try {
      setLoading(true);
      const contract = await getContractInstance(challengeAddress, client, challengeABI.abi);
      const data = contract.interface.encodeFunctionData("disapproveProof", [participant]);
      
      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: challengeAddress as `0x${string}`,
        data: data,
      });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(txResponse);
      console.log('Disapprove proof receipt:', receipt);
      
      // Refresh challenges after disapproval
      await refreshChallenges();
    } catch (err) {
      console.error('Failed to disapprove proof:', err);
      setError('Failed to disapprove proof. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [client, accounts, getContractInstance, refreshChallenges]);

  // End challenge
  const endChallenge = useCallback(async (challengeAddress: string) => {
    if (!client || !accounts[0]) return;
    try {
      setLoading(true);
      const contract = await getContractInstance(challengeAddress, client, challengeABI.abi);
      const data = contract.interface.encodeFunctionData("endChallenge");
      
      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: challengeAddress as `0x${string}`,
        data: data,
      });

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(txResponse);
      console.log('End challenge receipt:', receipt);
      await fetchMyChallenges();
    } catch (err) {
      console.error('Failed to end challenge:', err);
      setError('Failed to end challenge. Please check console for details.');
    } finally {
      setLoading(false);
    }
  }, [client, accounts, getContractInstance, fetchMyChallenges]);

  // Fetch challenges on mount and when wallet connects, but don't block UI
  useEffect(() => {
    let mounted = true;

    const initializeChallenges = async () => {
      if (!walletConnected || chainId !== luksoTestnet.id) return;

      // Set initial empty state
      setAllChallenges([]);
      setMyChallenges([]);
      setLoading(false);

      if (!mounted) return;

      try {
        // Fetch both in parallel since they're view functions
        await Promise.all([
          fetchAllChallenges(),
          fetchMyChallenges()
        ]);
      } catch (err) {
        console.error('Error initializing challenges:', err);
      }
    };

    initializeChallenges();

    return () => {
      mounted = false;
    };
  }, [walletConnected, chainId, fetchAllChallenges, fetchMyChallenges]);

  return {
    allChallenges,
    myChallenges,
    loading,
    error,
    createChallenge,
    getChallengeDetails,
    completeChallenge,
    approveProof,
    disapproveProof,
    endChallenge,
    refreshChallenges
  };
}; 