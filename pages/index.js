import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss'
import { ethers } from "ethers";
import abi from "../utils/WavePortal.json";
import React, { useEffect, useState } from "react";
import { getAddress } from 'ethers/lib/utils';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x3a863Dd66877c667D52b915598520e0b127DD207";
  const contractABI = abi.abi;
  const getAddress = (a) => {
    // Return the first 4 chars, and the last 3
    return a.substring(0, 4) + "**" + a.substring(a.length - 3);
  }
  const getDate = (d) => {
    // Convert timestamp, to dd/mm/yyyy format
    return new Date(d).toLocaleDateString();
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();


        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  useEffect(() => {
    if (currentAccount) {
      getAllWaves();
    }
  }, [currentAccount])
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <section className="mainContainer">
          <section className="dataContainer">
            <h2 className={styles.title}>
              👋 Hey there!
            </h2>

            <p className="bio">
              This’s my first solidity app,  deployed on Rinkeby (Ethereum),
              connect a wallet and send a message to see it in the blockchain
            </p>
            <textarea className={styles.message} onChange={(e) => setMessage(e.target.value)} placeholder="Write here a message..." ></textarea>


            {!currentAccount ? (
              <button className={styles.secondaryBtn} onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <button className={styles.mainBtn} onClick={wave}>
                Wave at Me
              </button>
            )}
            <h3 className={styles.subtitle}>
              📜 All Waves
            </h3>
            {allWaves.map((wave, index) => {
              return (
                <section key={index} className={styles.entry}>
                  <p>Address: <br /><a className={styles.address} href={"https://rinkeby.etherscan.io/address/" + wave.address} target="_blank" rel="noopener noreferrer">{getAddress(wave.address)}</a></p>
                  <p>Time: <br />{getDate(wave.timestamp)}</p>
                  <p>Message: <br /> {wave.message}</p>
                </section>)
            })}
          </section>
        </section>
      </main>

    </div>
  )
}
