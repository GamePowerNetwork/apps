// Copyright 2017-2021 @polkadot/app-parachains authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParaId } from '@polkadot/types/interfaces';

import BN from 'bn.js';
import React, { useCallback, useState } from 'react';

import { InputAddress, InputFile, InputNumber, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { BN_ZERO, compactAddLength } from '@polkadot/util';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  onClose: () => void;
}

const LOWEST_PUBLIC_ID = new BN(2_000);

function RegisterThread ({ className, onClose }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [paraId, setParaId] = useState<BN | undefined>();
  const nextParaId = useCall<ParaId>(api.query.registrar?.nextFreeParaId);
  const [wasm, setWasm] = useState<Uint8Array | null>(null);
  const [genesisState, setGenesisState] = useState<Uint8Array | null>(null);

  const _setGenesisState = useCallback(
    (data: Uint8Array) => setGenesisState(compactAddLength(data)),
    []
  );

  const _setWasm = useCallback(
    (data: Uint8Array) => setWasm(compactAddLength(data)),
    []
  );

  return (
    <Modal
      className={className}
      header={t<string>('Register parathread')}
      size='large'
    >
      <Modal.Content>
        <Modal.Columns hint={t<string>('This account will be associated with the parachain and pay the deposit.')}>
          <InputAddress
            label={t<string>('register from')}
            onChange={setAccountId}
            type='account'
            value={accountId}
          />
        </Modal.Columns>
        <Modal.Columns hint={t<string>('The id of this parachain as known on the network')}>
          {api.tx.registrar.registerNext
            ? (
              <InputNumber
                defaultValue={(nextParaId && !nextParaId.isZero()) ? nextParaId : LOWEST_PUBLIC_ID}
                isDisabled
                isZeroable={false}
                label={t<string>('parachain id')}
              />
            )
            : (
              <InputNumber
                autoFocus
                isZeroable={false}
                label={t<string>('parachain id')}
                onChange={setParaId}
              />
            )
          }
        </Modal.Columns>
        <Modal.Columns hint={t<string>('The WASM validation function for this parachain.')}>
          <InputFile
            autoFocus={!!api.tx.registrar.registerNext}
            help={t<string>('The compiled runtime WASM for the parachain you wish to register.')}
            isError={!wasm}
            label={t<string>('code')}
            onChange={_setWasm}
          />
        </Modal.Columns>
        <Modal.Columns hint={t<string>('The genesis state for this parachain.')}>
          <InputFile
            help={t<string>('The genesis state for the parachain.')}
            isError={!genesisState}
            label={t<string>('initial state')}
            onChange={_setGenesisState}
          />
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={accountId}
          icon='plus'
          isDisabled={!wasm || !genesisState || !(paraId || nextParaId)?.gt(BN_ZERO)}
          onStart={onClose}
          params={
            api.tx.registrar.registerNext
              ? [genesisState, wasm]
              : [paraId, genesisState, wasm]
          }
          tx={api.tx.registrar.registerNext || api.tx.registrar.register}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(RegisterThread);
