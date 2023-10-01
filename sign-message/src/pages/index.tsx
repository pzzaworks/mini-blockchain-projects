import { useEffect, useState } from 'react';
import ButtonC from '../components/ButtonC';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected';

const Index = () => {
  const account = useAccount();
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect, isSuccess: isDisconnectSuccess } = useDisconnect();
  const { isSuccess: isSignMessageSuccess, signMessage } = useSignMessage()
 
  const [buttonState, setButtonState] = useState(0);
  const [message, setMessage] = useState("Test Message");

  const buttonOnClickHandler = (() => {
    if(account.isConnected) {
      if(buttonState === 1) {
        signMessage({ message });
      } else {
        disconnect();
      }
    } else {
      connect();
    }
  });

  useEffect(() => {
    if (account.isConnected) {
      setButtonState(1);
    }
  }, [account.isConnected])

  useEffect(() => {
    if (buttonState === 1 && isSignMessageSuccess) {
      setButtonState(2);
    }
  }, [isSignMessageSuccess])

  useEffect(() => {
    if (buttonState === 2 && isDisconnectSuccess) {
      setButtonState(0);
    }
  }, [isDisconnectSuccess])

  return (
    <div className="w-full flex flex-col items-center">
      <div className="animate-in flex flex-col gap-14 opacity-0 max-w-4xl px-3 py-16 lg:py-24 text-foreground">
        <div className="flex flex-col items-center mb-4 lg:mb-12">
          <h1 className="text-4xl mx-auto max-w-xl text-center my-8">
            <strong>Connect Wallet</strong> and <strong>Sign Message</strong>
          </h1>
          {account.address && 
            <p className="text-xl my-4">
              Connected wallet address: <span className='text-xl'>{account.address}</span>
            </p>
          }
          <ButtonC className='my-8' onClick={() => buttonOnClickHandler()}>
            {buttonState === 1 ? "Sign Message" : (buttonState === 2 ? "Disconnect" : "Connect")}
          </ButtonC>
        </div>
      </div>
    </div>
  )
}

export default Index;