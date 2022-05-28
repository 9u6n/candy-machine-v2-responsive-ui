import {useEffect, useState} from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {GatewayProvider} from '@civic/solana-gateway-react';
import Countdown from "react-countdown";
import {Snackbar, Paper, LinearProgress, Chip} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {toDate, AlertState, getAtaForMint} from './utils';
import {MintButton} from './MintButton';
import {
    CandyMachine,
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken,
    CANDY_MACHINE_PROGRAM,
} from "./candy-machine";

import { Expandable } from './Expandable';
import { ExpandableContent } from './Expandable';


const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString() : 9;
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString() : "TOKEN";

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
  height: 64px;

  div{
    display: flex;
    flex-direction: row;
  }

  #right-side-header{
    justify-content: flex-end;
    flex-wrap: wrap-reverse;
    gap: 10px;
  }

`;

const WalletAmount = styled.div`
  color: var(--main-text-color);
  width: auto;
  padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 2px;
  background-color: var(--card-background-color);
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0 0 auto 0;
  padding: 0;
  height: 64px;
  display: flex;
  align-items: flex-end;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 2px !important;
  padding: 6px 16px;
  color: var(--button-text-color) !important;
  background-color: var(--button-background-color) !important;
  margin: 0 auto;
  font-family: 'Squarewave'; 
  font-size: 1rem;
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);

  :not([disabled]):hover{
    color: var(--button-text-color) !important;
  }
`;

const NFT = styled(Paper)`
  
  width: auto;
  padding: 5px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  background-color: var(--card-background-color) !important;
  border-radius: 2px !important;
`;
const Des = styled(NFT)`
  text-align: left;
  padding-top: 0px;
  padding-bottom: 1rem;
  border-radius: 2px !important;

  p {
      height: 1rem;
     
  }
`;

const Card = styled(Paper)`
  display: inline-block;
  color: var(--title-text-color) !important;
  background-color: var(--card-background-lighter-color) !important;
  margin: 5px;
  font-size: 0.8rem;
  padding-bottom: .5rem;
  width: 4rem;
`;

const MintButtonContainer = styled.div`
  button.MuiButton-contained:not(.MuiButton-containedPrimary).Mui-disabled {
    color: #464646;
  }

  button.MuiButton-contained:not(.MuiButton-containedPrimary):hover,
  button.MuiButton-contained:not(.MuiButton-containedPrimary):focus {
    -webkit-animation: pulse 1s;
    animation: pulse 1s;
    animation-iteration-count: infinite;
    box-shadow: 0 0 .5rem 2rem rgba(246,90,167,0);
  }

  @-webkit-keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--highlight-color);
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 var(--highlight-color);
    }
  }
`;

const Logo = styled.div`
  flex: 0 0 auto;
  
  height: 64px;
  img {
    border: 3px solid var(--main-background-color);
    border-radius: 50%;
    height: 64px;
  }
`;

const Menu = styled.ul`
  list-style: none;
  display: flex;
  margin: 0 0 0 0;
  flex: 1 0 auto;
  height: 64px;
  
  align-items: flex-end;

  li {
    margin: 0 12px;

    a {
      color: var(--main-text-color);
      list-style-image: none;
      list-style-position: outside;
      list-style-type: none;
      outline: none;
      text-decoration: none;
      text-size-adjust: 100%;
      touch-action: manipulation;
      
      padding-bottom: 5px;

      display: flex;
      font-size: 1.2rem;

      img {
        height: 2rem;
      }
    }

    a:hover, a:active {
      color: var(--highlight-color);
      border-bottom: 4px solid var(--highlight-color);
    }

  }
`;

const MediaList = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 10px;

    a {
        width: 1.8rem;
        min-height: 1.5rem;
        border: 0;

        justify-content: center;
        display: flex;
        
        :hover {
            background-color: var(--card-background-color);
            box-shadow: 0px 3px 5px 1px rgb(0 0 0 / 20%);
        }

        img{
            display: flex;
            align-self: center;
        }
    }
`

const ITEMCOUNT = styled.span`
    color: var(--highlight-color);
    font-size: 1.5rem;
`

const SolExplorerLink = styled.a`
  color: var(--highlight-color);
  
  
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;
  font-size: 1rem;

  :hover {
    text-decoration: underline;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 4%;
  margin-left: 4%;
  text-align: center;
  justify-content: center;
`;

const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  
  gap: 20px;
`;

const DesContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
  
`;

const NFTContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 20px;
  min-width: 50%;
`;

const NFTTitle = styled.h2`
  display: inline-block;
  align-self: center;
  border-bottom: 5px solid var(--highlight-color);
`

const SectionText = styled(ExpandableContent)`
  font-size: 1.2rem;
`

// margin: 5px auto 5px;
const Price = styled(Chip)`
  border-radius: 2px !important;
  position: absolute;
  margin: -40px 0;
  color: var(--main-text-color) !important;
  font-weight: bold;
  font-family: 'Squarewave' !important;
  font-size: 1rem !important;
  background-color: var(--card-background-lighter-color) !important;
`;

const Image = styled.img`
  height: auto;
  width: auto;
`;

const BorderLinearProgress = styled(LinearProgress)`
  margin: 20px 0;
  height: 20px !important;
  border-radius: 2px;
  border: 2px solid var(--main-text-color);
  
  background-color:var(--main-text-color) !important;
  
  > div.MuiLinearProgress-barColorPrimary{
    background-color:var(--main-background-color) !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 2px !important;
    background-image: linear-gradient(270deg, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.5));
  }
`;

const ShimmerTitle = styled.h1`
  margin: 50px auto;
  text-transform: uppercase;
  animation: glow 2s ease-in-out infinite alternate;
  color: var(--main-text-color);
  @keyframes glow {
    from {
      text-shadow: 0 0 20px var(--main-text-color);
    }
    to {
      text-shadow: 0 0 30px var(--main-text-color), 0 0 10px var(--title-text-color);
    }
  }
`;

const GoldTitle = styled.span`
  color: var(--title-text-color);
  font-size: 2rem;
  margin-bottom: -0.175rem;
  border-bottom: 5px solid var(--highlight-color);
`;

const LogoAligner = styled.div`
  display: flex;
  align-items: flex-end;
  gap: .5rem;
  height: 2rem;
  margin: 10px auto 0 0;
  img {
    border: 3px solid var(--main-background-color);
    border-radius: 50%;
    height: auto;
  }
`;

export interface HomeProps {
    candyMachineId: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    txTimeout: number;
    rpcHost: string;
}

const Home = (props: HomeProps) => {
    const [balance, setBalance] = useState<number>();
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
    const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
    const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
    const [itemsAvailable, setItemsAvailable] = useState(0);
    const [itemsRedeemed, setItemsRedeemed] = useState(0);
    const [itemsRemaining, setItemsRemaining] = useState(0);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [payWithSplToken, setPayWithSplToken] = useState(false);
    const [price, setPrice] = useState(0);
    const [priceLabel, setPriceLabel] = useState<string>("SOL");
    const [whitelistPrice, setWhitelistPrice] = useState(0);
    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const wallet = useAnchorWallet();
    const [candyMachine, setCandyMachine] = useState<CandyMachine>();

    const rpcUrl = props.rpcHost;

    const refreshCandyMachineState = () => {
        (async () => {
            if (!wallet) return;

            const cndy = await getCandyMachineState(
                wallet as anchor.Wallet,
                props.candyMachineId,
                props.connection
            );

            setCandyMachine(cndy);
            setItemsAvailable(cndy.state.itemsAvailable);
            setItemsRemaining(cndy.state.itemsRemaining);
            setItemsRedeemed(cndy.state.itemsRedeemed);

            var divider = 1;
            if (decimals) {
                divider = +('1' + new Array(decimals).join('0').slice() + '0');
            }

            // detect if using spl-token to mint
            if (cndy.state.tokenMint) {
                setPayWithSplToken(true);
                // Customize your SPL-TOKEN Label HERE
                // TODO: get spl-token metadata name
                setPriceLabel(splTokenName);
                setPrice(cndy.state.price.toNumber() / divider);
                setWhitelistPrice(cndy.state.price.toNumber() / divider);
            }else {
                setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
                setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
            }


            // fetch whitelist token balance
            if (cndy.state.whitelistMintSettings) {
                setWhitelistEnabled(true);
                if (cndy.state.whitelistMintSettings.discountPrice !== null && cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price) {
                    if (cndy.state.tokenMint) {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider);
                    } else {
                        setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL);
                    }
                }
                let balance = 0;
                try {
                    const tokenBalance =
                        await props.connection.getTokenAccountBalance(
                            (
                                await getAtaForMint(
                                    cndy.state.whitelistMintSettings.mint,
                                    wallet.publicKey,
                                )
                            )[0],
                        );

                    balance = tokenBalance?.value?.uiAmount || 0;
                } catch (e) {
                    console.error(e);
                    balance = 0;
                }
                setWhitelistTokenBalance(balance);
                setIsActive(balance > 0);
            } else {
                setWhitelistEnabled(false);
            }
        })();
    };

    const renderCounter = ({days, hours, minutes, seconds}: any) => {
        return (
            <div><Card elevation={1}><h1>{days}</h1><br/>Days</Card><Card elevation={1}><h1>{hours}</h1>
                <br/>Hours</Card><Card elevation={1}><h1>{minutes}</h1><br/>Mins</Card><Card elevation={1}>
                <h1>{seconds}</h1><br/>Secs</Card></div>
        );
    };

    function displaySuccess(mintPublicKey: any): void {
        let remaining = itemsRemaining - 1;
        setItemsRemaining(remaining);
        setIsSoldOut(remaining === 0);
        if (whitelistTokenBalance && whitelistTokenBalance > 0) {
            let balance = whitelistTokenBalance - 1;
            setWhitelistTokenBalance(balance);
            setIsActive(balance > 0);
        }
        setItemsRedeemed(itemsRedeemed + 1);
        const solFeesEstimation = 0.012; // approx
        if (!payWithSplToken && balance && balance > 0) {
            setBalance(balance - (whitelistEnabled ? whitelistPrice : price) - solFeesEstimation);
        }
        setSolanaExplorerLink(cluster === "devnet" || cluster === "testnet"
            ? ("https://explorer.solana.com/address/" + mintPublicKey + "?cluster=" + cluster)
            : ("https://explorer.solana.com/address/" + mintPublicKey));
        throwConfetti();
    };

    function throwConfetti(): void {
        confetti({
            particleCount: 400,
            spread: 70,
            origin: {y: 0.6},
        });
    }

    const onMint = async () => {
        try {
            setIsMinting(true);
            if (wallet && candyMachine?.program && wallet.publicKey) {
                const mint = anchor.web3.Keypair.generate();
                const mintTxId = (
                    await mintOneToken(candyMachine, wallet.publicKey, mint)
                )[0];

                let status: any = {err: true};
                if (mintTxId) {
                    status = await awaitTransactionSignatureConfirmation(
                        mintTxId,
                        props.txTimeout,
                        props.connection,
                        'singleGossip',
                        true,
                    );
                }

                if (!status?.err) {
                    setAlertState({
                        open: true,
                        message: 'Congratulations! Mint succeeded!',
                        severity: 'success',
                    });

                    // update front-end amounts
                    displaySuccess(mint.publicKey);
                } else {
                    setAlertState({
                        open: true,
                        message: 'Mint failed! Please try again!',
                        severity: 'error',
                    });
                }
            }
        } catch (error: any) {
            // TODO: blech:
            let message = error.msg || 'Minting failed! Please try again!';
            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction Timeout! Please try again.';
                } else if (error.message.indexOf('0x138')) {
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`;
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            setAlertState({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setIsMinting(false);
        }
    };


    useEffect(() => {
        (async () => {
            if (wallet) {
                const balance = await props.connection.getBalance(wallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
        })();
    }, [wallet, props.connection]);

    useEffect(refreshCandyMachineState, [
        wallet,
        props.candyMachineId,
        props.connection,
    ]);

    return (
        <main>
            <MainContainer>
                <WalletContainer>
                    <div>
                        <Logo><a href="https://discord.gg/r9KVehHBZ3" target="_blank" rel="noopener noreferrer"><img alt=""
                            src="logo 46x.png"/></a></Logo>
                        <Menu>
                            <li><a href="#Whitelist">Whitelist</a></li>
                            <li><a href="#FAQ">FAQ</a></li>
                            <li><a href="#About">About</a></li>
                        </Menu> 
                    </div>    
                    <div id="right-side-header">
                        <MediaList>
                            <a href="https://discord.gg/r9KVehHBZ3" target="_blank" rel="noopener noreferrer"><img src="discord-icon.png" alt=""></img></a>
                            <a href="https://twitter.com/1bituncles" target="_blank" rel="noopener noreferrer"><img src="twitter-icon.png" alt=""></img></a>
                        </MediaList>

                        <Wallet>
                            {wallet ?
                                <WalletAmount>{(balance || 0).toLocaleString()} SOL<ConnectButton/></WalletAmount> :
                                <ConnectButton>Connect Wallet</ConnectButton>}
                        </Wallet>
                    </div> 
                </WalletContainer>
                <br/>
                <ShimmerTitle>MINT IS LIVE !</ShimmerTitle>
                <br/>


                <MintContainer id="MintContainer">
                    <NFTContainer>
                        <NFT elevation={3}>
                            <NFTTitle>1-Bit Uncle NFTs</NFTTitle>
                            
                            <div>
                                <Price
                                label={isActive && whitelistEnabled && (whitelistTokenBalance > 0) ? (whitelistPrice + " " + priceLabel) : (price + " " + priceLabel)}/>
                                {/* <br/> */}
                                <Image
                                    src="uncle-list.gif"
                                alt="1-Bit Uncle NFTs"/>
                            </div>
                            <br/>
                            {wallet && isActive && whitelistEnabled && (whitelistTokenBalance > 0) &&
                                <h3>You have {whitelistTokenBalance} whitelist {whitelistTokenBalance === 1 ? "mint" :"mints"} remaining.</h3>}
                            {wallet && isActive &&
                                /* <p>Total Minted : {100 - (itemsRemaining * 100 / itemsAvailable)}%</p>}*/
                                <h3>TOTAL MINTED : <ITEMCOUNT>{itemsRedeemed} / {itemsAvailable}</ITEMCOUNT></h3>}
                            {wallet && isActive && <BorderLinearProgress variant="determinate"
                                                                         value={100 - (itemsRemaining * 100 / itemsAvailable)}/>}
                            <br/>
                            <MintButtonContainer>
                                {!isActive && candyMachine?.state.goLiveDate ? (
                                    <Countdown
                                        date={toDate(candyMachine?.state.goLiveDate)}
                                        onMount={({completed}) => completed && setIsActive(true)}
                                        onComplete={() => {
                                            setIsActive(true);
                                        }}
                                        renderer={renderCounter}
                                    />) : (
                                    !wallet ? (
                                            <ConnectButton>Connect Wallet</ConnectButton>
                                        ) :
                                        candyMachine?.state.gatekeeper &&
                                        wallet.publicKey &&
                                        wallet.signTransaction ? (
                                            <GatewayProvider
                                                wallet={{
                                                    publicKey:
                                                        wallet.publicKey ||
                                                        new PublicKey(CANDY_MACHINE_PROGRAM),
                                                    //@ts-ignore
                                                    signTransaction: wallet.signTransaction,
                                                }}
                                                // // Replace with following when added
                                                // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                                                gatekeeperNetwork={
                                                    candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                                                } // This is the ignite (captcha) network
                                                /// Don't need this for mainnet
                                                clusterUrl={rpcUrl}
                                                options={{autoShowModal: false}}
                                            >
                                                <MintButton
                                                    candyMachine={candyMachine}
                                                    isMinting={isMinting}
                                                    isActive={isActive}
                                                    isSoldOut={isSoldOut}
                                                    onMint={onMint}
                                                />
                                            </GatewayProvider>
                                        ) : (
                                            <MintButton
                                                candyMachine={candyMachine}
                                                isMinting={isMinting}
                                                isActive={isActive}
                                                isSoldOut={isSoldOut}
                                                onMint={onMint}
                                            />
                                        ))}
                            </MintButtonContainer>
                            <br/>
                            {wallet && isActive && solanaExplorerLink &&
                              <SolExplorerLink href={solanaExplorerLink} target="_blank">View on Solana
                                Explorer</SolExplorerLink>}
                        </NFT>
                    </NFTContainer>
                    <DesContainer>
                        <Des id="FAQ" elevation={2}>
                            <LogoAligner><img src="480.png" alt=""></img><GoldTitle>FAQ</GoldTitle></LogoAligner>
                            <br />
                            <Expandable title="How much does each '1-Bit Uncle' cost?">
                                <em>0.2 SOL</em> for whitelist mint, <em>0.3 SOL</em> for public mint
                            </Expandable>
                            <br />
                            <Expandable title="When does pre-sale start?">
                                TBA
                            </Expandable>
                            <br />
                            <Expandable title="When does public mint start?">
                                TBA
                            </Expandable>
                            <br id="Whitelist"/>
                            <Expandable title="How to get whitelisted?">
                                Join our <a href="https://discord.gg/r9KVehHBZ3" target="_blank" rel="noopener noreferrer">discord</a> and get 4 coupons, then you will get whitelisted
                            </Expandable>
                            <br />
                            <Expandable title="What is the supply?">
                                There will be <em>2,048</em> 1-Bit Uncle NFTs.
                            </Expandable>
                            <br />
                        </Des>
                        <Des id="About" elevation={2}>
                            <LogoAligner><img src="801.png" alt=""></img><GoldTitle>About</GoldTitle></LogoAligner>
                            <br/>
                            <SectionText>
                                <em>1-Bit Uncles</em> is an NFT collection
                                Created by <a href="https://twitter.com/_9u6n" target="_blank" rel="noopener noreferrer">9u6n</a>
                                &nbsp;contained <em>2,048</em> uniquely generated Uncles on the <em>Solana Blockchain</em>. 
                            </SectionText>
                            <br/>
                            <SectionText>
                                The Uncles are present in two-colors pixels with a wide range of traits.
                                It is a distinctive brand for every collector with an independent vision.
                            </SectionText>                         
                            <br/>
                            <br/>
                        </Des>
                        <Des elevation={2}>
                            <LogoAligner><img src="474.png" alt=""></img><GoldTitle>The Team</GoldTitle></LogoAligner>
                            <br />
                            <SectionText>
                                Creator: <em>9u6n</em>
                            </SectionText>
                            <SectionText>
                                Community Managers: <em>_Damian</em>, <em>Judith</em>
                            </SectionText>
                            <br />
                            <br />
                        </Des>
                    </DesContainer>
                </MintContainer>
            </MainContainer>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
                    severity={alertState.severity}
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
        </main>
    );
};

export default Home;
