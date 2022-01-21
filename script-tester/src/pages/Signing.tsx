import { useState, useContext, FC, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import clsx from 'clsx';
import isNil from 'lodash/isNil';
import padEnd from 'lodash/padEnd';
import { apdu, Transport, tx } from '@coolwallet/core';
import { Button, ButtonInputs } from '@/components';
import { executeScript, executeUtxoScript } from '@/utils/execute';
import Context from '@/store';
import * as txUtil from '@coolwallet/core/lib/transaction/txUtil';
//additional
import cwsETH from '@coolwallet/eth';
import * as ethUtil from '@coolwallet/eth/lib/utils/ethUtils';
import { signTx, Transaction } from '@coolwallet/eth/lib/config/types';

const SIGNATURE = padEnd('FA', 144, '0');

const row = clsx('border-t-2', 'border-gray-400', 'mt-4', 'pt-4', 'text-center', 'text-2xl');

interface Props {
  transport: Transport | null;
  appId: string | null;
  appPrivateKey: string;
}

const Signing: FC<Props> = (props: Props) => {
  const { connected, isLocked, setIsLocked } = useContext(Context);

  const [transaction, setTransaction] = useState('');

  const [argument, setArgument] = useState('');
  const [script, setScript] = useState('');
  const [Signature, setSignature] = useState('');

  const [segmentArgument, setSegmentArgument] = useState('');
  const [segmentData, setSegmentData] = useState('');
  const [segmentScript, setSegmentScript] = useState('');
  const [segmentSignature, setSegmentSignature] = useState('');

  const [utxoInputArgument, setUtxoInputArgument] = useState('');
  const [utxoOutputArgument, setUtxoOutputArgument] = useState('');
  const [utxoScript, setUtxoScript] = useState('');
  const [utxoSignature, setUtxoSignature] = useState('');

  const signTx = async () => {
    if (isNil(props.transport)) return;
    setIsLocked(true);
    try {
      const fullScript = script + SIGNATURE;

      console.log('fullScript: ', fullScript);

      await apdu.tx.sendScript(props.transport, fullScript);

      const encryptedSignature = await apdu.tx.executeScript(
        props.transport,
        props.appId ?? '',
        props.appPrivateKey,
        argument
      );
      console.log(encryptedSignature);

      // finish prepare
      await apdu.tx.finishPrepare(props.transport);

      // get tx detail
      await apdu.tx.getTxDetail(props.transport);

      const decryptingKey = await apdu.tx.getSignatureKey(props.transport);
      console.log(decryptingKey);

      const sig = tx.util.decryptSignatureFromSE(encryptedSignature!, decryptingKey, false, false);

      console.log(sig);

      await apdu.tx.clearTransaction(props.transport);
      // await apdu.mcu.control.powerOff(props.transport);

      const decryptedSignature = await txUtil.decryptSignatureFromSE(encryptedSignature!, decryptingKey, false, true);
      console.log('decryptedSignature: ', decryptedSignature);

      setSignature(encryptedSignature ?? '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocked(false);
    }
  };

  const signSegmentData = async () => {
    if (isNil(props.transport)) return;
    setIsLocked(true);
    try {
      const fullScript = segmentScript + SIGNATURE;

      await apdu.tx.sendScript(props.transport, fullScript);

      const dataLengthHex = (segmentData.length / 2).toString(16).padStart(8, '0');

      await executeScript(props.transport, props.appId ?? '', props.appPrivateKey, segmentArgument + dataLengthHex);

      const encryptedSignatureArray = await apdu.tx.executeSegmentScript(
        props.transport,
        props.appId ?? '',
        props.appPrivateKey,
        segmentData
      );

      // finish prepare
      await apdu.tx.finishPrepare(props.transport);

      await apdu.tx.clearTransaction(props.transport);
      await apdu.mcu.control.powerOff(props.transport);

      setSegmentSignature(encryptedSignatureArray ?? 'Error!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocked(false);
    }
  };

  const signUtxoTx = async () => {
    if (isNil(props.transport)) return;
    setIsLocked(true);
    try {
      console.log('utxoIntputArgument: ', utxoInputArgument);
      console.log('utxoOutputArgument: ', utxoOutputArgument);

      const fullScript = utxoScript + SIGNATURE;

      console.log('fullScript: ', fullScript);

      await apdu.tx.sendScript(props.transport, fullScript);

      await executeScript(props.transport, props.appId ?? '', props.appPrivateKey, utxoOutputArgument);

      const encryptedSignatureArray = await executeUtxoScript(props.transport, utxoInputArgument);

      console.log('encryptedSignatureArray: ', encryptedSignatureArray);

      // finish prepare
      await apdu.tx.finishPrepare(props.transport);

      // get tx detail
      await apdu.tx.getTxDetail(props.transport);

      await apdu.tx.clearTransaction(props.transport);
      await apdu.mcu.control.powerOff(props.transport);

      setUtxoSignature(encryptedSignatureArray);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocked(false);
    }
  };
  const main = async (): Promise<void> => {
    // if (props.transport && props.appPrivateKey && props.appId) {
    //   const ecdsaCoin = new ECDSACoin('8000003c');
    //   const publicKey = await ecdsaCoin.getPublicKey(
    //     props.transport || null,
    //     props.appPrivateKey,
    //     props.appId,
    //     0o00000000
    //   );
    //   console.log(publicKey);
    // }
    if (isNil(props.transport) || isNil(props.appId)) return;
    const eth = new cwsETH();
    // const address = await eth.getAddress(
    //   props.transport as Transport.default,
    //   props.appPrivateKey,
    //   props.appId as string,
    //   0o00000000
    // );
    const transaction = {
      nonce: '0x0e3',
      gasPrice: '0x59682f00',
      gasLimit: '0x5208',
      to: '0x81bb32e4A7e4d0500d11A52F3a5F60c9A6Ef126C',
      value: '0x5af3107a4000',
      data: '0x00',
      chainId: 1,
    };
    const signTxData = {
      transport: props.transport as Transport,
      appPrivateKey: props.appPrivateKey,
      appId: props.appId as string,
      transaction,
      addressIndex: 0o00000000,
    };

    const signedTx = await eth.signTransaction(signTxData as signTx);
    console.log(signedTx);
  };
  useEffect(() => {
    // main();
  }, [props]);

  const getTransaction = async () => {
    if (isNil(props.transport)) return;
    setIsLocked(true);
    try {
      const signed = await apdu.tx.getSignedHex(props.transport);
      setTransaction(signed.signedTx);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLocked(false);
    }
  };

  const disabled = !connected || isLocked;
  // (title, content, onClick, disabled, input, setInput, placeholder, input2, setInput2, placeholder2)
  return (
    <Container>
      <Row className={row}>
        <p>Scriptable Signing</p>
      </Row>
      <ButtonInputs
        title="Signature"
        content={Signature}
        onClick={signTx}
        disabled={disabled}
        inputs={[
          {
            value: argument,
            onChange: setArgument,
            placeholder: 'argument',
          },
          {
            value: script,
            onChange: setScript,
            placeholder: 'script',
          },
        ]}
      />
      <ButtonInputs
        title="Segment Signature"
        content={segmentSignature}
        onClick={signSegmentData}
        disabled={disabled}
        inputs={[
          {
            value: segmentArgument,
            onChange: setSegmentArgument,
            placeholder: 'segment arg',
          },
          {
            value: segmentData,
            onChange: setSegmentData,
            placeholder: 'data arg',
          },
          {
            value: segmentScript,
            onChange: setSegmentScript,
            placeholder: 'script',
          },
        ]}
      />
      <ButtonInputs
        title="UTXO Signature"
        content={utxoSignature}
        onClick={signUtxoTx}
        disabled={disabled}
        inputs={[
          {
            value: utxoInputArgument,
            onChange: setUtxoInputArgument,
            placeholder: 'input arg',
          },
          {
            value: utxoOutputArgument,
            onChange: setUtxoOutputArgument,
            placeholder: 'output arg',
          },
          {
            value: utxoScript,
            onChange: setUtxoScript,
            placeholder: 'script',
          },
        ]}
      />
      <Button title="Transaction" content={transaction} disabled={disabled} onClick={getTransaction} />
    </Container>
  );
};

export default Signing;
