import { useCallback } from "react";
import { BrowserProvider, Contract, ethers, JsonRpcSigner } from "ethers";
import lsp7Json from "../json/lsp7/lsp7.json";
import { useUpProvider } from "../context/UpProvider";
import { lukso } from "viem/chains";

export const useSmartContract = () => {
  const { client, walletConnected, accounts, chainId } = useUpProvider();

  {
    /**
       In order to send a transaction using `up-provider`, we need to target a specific function of the smart contract,
       In this case, the target is the `mint` function. The process involves encoding the required parameters for the
       function in the correct order and then sending the encoded data as part of the transaction.
      
       @params {string} contractAddress - The address of the smart contract we want to interact with.
       @params mintArgs - The arguments for the `mint` function, encoded in the proper format:
         - `contextAccounts[0]` {string}: The recipient address for the minted tokens.
         - `ethers.parseUnits(amount.toString(), "wei")` {BigNumber}: The amount to be minted, converted into the smallest
           unit (e.g., wei or equivalent).
         - `false` {boolean}: A flag indicating whether the recipient should be notified (default is false).
         - `"0x"` {string}: Optional data field, typically used for extra information (default is an empty hex string).
      
       @example
       Here's how we encode the data for the `mint` function and send the transaction:
      
       // Step 1: Encode the function data
       const data = contract.interface.encodeFunctionData("mint", [
         contextAccounts[0],
         ethers.parseUnits(amount.toString(), "wei"),
         false,
         "0x"
       ]);
            
       // Step 2: Send the transaction using the UP provider

       const txResponse = await client.sendTransaction({
         account: contextAccounts[0] as `0x${string}`, // Sender account, msg.sender
         to: contractAddress as `0x${string}`,         // Target smart contract address
         data: data,                                  // Encoded function data
       });
            
       @returns {Promise<void>} Logs the transaction response or throws an error if the transaction fails.
      */
  }

  const executeFunctionWithUProvider = useCallback(async () => {
    try {
      if (!client) {
        return;
      }
      const contractAddressMainnet: `0x${string}` =
        "0xA8Cb54517380B2df303BD00e8a512d478651ac4C";
      const contractAddressTestnet: `0x${string}` =
        "0x4E1Fe6B4085D79F5F500B835f3a2a56F27994338";

      const contractAddress: `0x${string}` =
        chainId === lukso.id ? contractAddressMainnet : contractAddressTestnet; // Example of a custom smart contract LSP7 address already deployed

      const contract = await getContractInstance(contractAddress, client);
      const data: string = contract.interface.encodeFunctionData("allCanMint"); // this is a custom function

      const txResponse = await client.sendTransaction({
        account: accounts[0] as `0x${string}`,
        to: contractAddress as `0x${string}`,
        data: data,
      });
      return txResponse;
    } catch (error) {
      console.error("Transaction failed:", error);
      return;
    }
  }, [client, walletConnected, accounts]);

  const getProvider = async (): Promise<BrowserProvider> => {
    if (!window.lukso) {
      throw new Error("Lukso provider is not available on window object.");
    }
    return new ethers.BrowserProvider(window.lukso);
  };

  {
    /**
   This is the method to interact with the smart contract using ethers.js. While this approach is valid,
   we recommend using the `up-provider` for interacting with the blockchain whenever possible.
  
   Why use `up-provider`?
   - Simplified integration with the Universal Profile ecosystem.
   - Enhanced security by leveraging the UP infrastructure.

   With `up-provider`, the interaction is abstracted, reducing complexity and potential errors.
   */
  }

  const getSigner = useCallback(async (): Promise<JsonRpcSigner> => {
    const browserProvider = await getProvider();
    return browserProvider.getSigner();
  }, []);

  const getContractInstance = useCallback(
    async (
      contractAddress: string,
      signer: ethers.Signer,
      abi: any[] = []
    ): Promise<Contract> => {
      return new ethers.Contract(contractAddress, abi, signer);
    },
    []
  );

  const executeFunction = useCallback(
    async (contractAddress: string, functionName: string, params: any[]) => {
      try {
        const signer = await getSigner();
        const contract = await getContractInstance(contractAddress, signer);
        const tx = await contract[functionName](...params);
        await tx.wait();
        return tx;
      } catch (error) {
        console.error("Transaction failed:", error);
        return;
      }
    },
    [getSigner, getContractInstance]
  );

  return {
    executeFunction,
    executeFunctionWithUProvider,
    getSigner,
    getContractInstance,
  };
};
