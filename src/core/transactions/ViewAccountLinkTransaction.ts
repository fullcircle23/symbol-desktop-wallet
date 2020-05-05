/**
 *
 * Copyright 2020 Grégory Saive for NEM (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// external dependencies
import { LinkAction, AccountLinkTransaction, UInt64 } from 'symbol-sdk'

// internal dependencies
import { TransactionView } from './TransactionView'

export type ViewAccountLinkTransactionFormFieldsType = {
  remotePublicKey: string
  linkAction: LinkAction
  maxFee: UInt64
}

// eslint-disable-next-line max-len
export class ViewAccountLinkTransaction extends TransactionView<ViewAccountLinkTransactionFormFieldsType> {
  /**
   * Fields that are specific to transfer transactions
   */
  protected readonly fields: string[] = ['remotePublicKey', 'linkAction', 'maxFee']

  /**
   * Parse form items and return a ViewAccountLinkTransaction
   * @param {ViewAccountLinkTransactionFormFieldsType} formItems
   * @return {ViewAccountLinkTransaction}
   */
  public parse(formItems: ViewAccountLinkTransactionFormFieldsType): ViewAccountLinkTransaction {
    this.values.set('remotePublicKey', formItems.remotePublicKey)
    this.values.set('linkAction', formItems.linkAction)
    this.values.set('maxFee', formItems.maxFee)
    return this
  }

  /**
   * Use a transaction object and return a ViewTransferTransaction
   * @param {ViewAccountLinkTransaction} transaction
   * @returns {ViewAccountLinkTransaction}
   */
  public use(transaction: AccountLinkTransaction): ViewAccountLinkTransaction {
    // - set transaction
    this.transaction = transaction

    // - populate common values
    this.initialize(transaction)

    this.values.set('remotePublicKey', transaction.remotePublicKey)
    this.values.set('linkAction', transaction.linkAction)

    return this
  }
}
