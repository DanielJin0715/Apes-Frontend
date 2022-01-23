import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contract from './contracts/contract.json';

const contractAddress = "0xbdfff5988cb3c84b296b640ce32b537947e248b9";
const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSupply, setCurrentSupply] = useState('-->');
  const [mintAmount, setMintAmount] = useState(1);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamast installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      getTotalSupply();
    } else {
      console.log("No authorized account found!");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address:", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        if(mintAmount < 1 || mintAmount > 20) {
          console.log("mintAmount should be 1 to 20");
          return;
        }

        const etherAmount = 0.055 * mintAmount + 0.01;
        console.log(etherAmount, etherAmount.toString());

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFT(mintAmount, {
          value: ethers.utils.parseEther(etherAmount.toString())
        });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, transaction hash: ${nftTxn.hash}`);
        getTotalSupply();
      } else {
        console.log("Ethereum object does not exit");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='btn btn-wallet-connect'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='btn btn-mint-nft'>
        Mint NFT
      </button>
    )
  }

  const getTotalSupply = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const apesContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await apesContract.totalSupplyByType(0);
        setCurrentSupply(nftTxn.toString());
      } else {
        console.log("Ethereum object does not exit");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const getTotalSupplyButton = () => {
    return (
      <button onClick={getTotalSupply} className='btn btn-mint-nft'>
        Get total supply
      </button>
    )
  }

  const setMintAmountInput = () => {
    return (
      <input value={mintAmount}
        onChange={event => setMintAmount(event.target.value)}
        className='input-amount' />
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="div-wallet-address">
        Wallet Address: {currentAccount ? currentAccount : "No Wallet Connected"}
      </div>
      <div className="div-wallet-button">
        {currentAccount ? mintNftButton() : connectWalletButton()}
        {currentAccount && setMintAmountInput()}
      </div>
      {currentAccount &&
        <div className="div-wallet-button">
          {getTotalSupplyButton()}
        </div>
      }
      {currentSupply &&
        <div className="div-wallet-address">
          Contract Total Supply: {currentSupply}
        </div>
      }
    </div>
  );
}

export default App;
