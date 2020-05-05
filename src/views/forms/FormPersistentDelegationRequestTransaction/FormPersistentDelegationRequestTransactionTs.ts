/*
 * Copyright 2020 NEM Foundation (https://nem.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */
import { Address, TransferTransaction, UInt64, PersistentHarvestingDelegationMessage, Account } from 'symbol-sdk'
import { Component, Prop } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

// internal dependencies
import { Formatters } from '@/core/utils/Formatters'
import { TransferFormFieldsType, ViewTransferTransaction } from '@/core/transactions/ViewTransferTransaction'
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase'
import { TransactionFactory } from '@/core/transactions/TransactionFactory'

// child components
import { ValidationObserver } from 'vee-validate'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import ModalTransactionConfirmation from '@/views/modals/ModalTransactionConfirmation/ModalTransactionConfirmation.vue'
// @ts-ignore
import SignerSelector from '@/components/SignerSelector/SignerSelector.vue'
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'

@Component({
  components: {
    FormWrapper,
    ModalTransactionConfirmation,
    SignerSelector,
    ValidationObserver,
    MaxFeeAndSubmit,
    FormRow,
  },
  computed: {
    ...mapGetters({
      balanceMosaics: 'mosaic/balanceMosaics',
      networkConfiguration: 'network/networkConfiguration',
    }),
  },
})
export class FormPersistentDelegationRequestTransactionTs extends FormTransactionBase {
  @Prop({ required: true }) remoteAccount: Account
  @Prop({ required: true }) nodePublicKey: string
  @Prop({ default: null }) signerPublicKey: string

  /**
   * Formatters helpers
   */
  public formatters = Formatters

  /**
   * Form items
   */
  public formItems = {
    nodePublicKey: '',
    signerPublicKey: '',
    maxFee: 0,
  }

  /**
   * Reset the form with properties
   * @return {void}
   */
  protected resetForm() {
    // - set default form values
    this.formItems.signerPublicKey = this.signerPublicKey || this.selectedSigner.publicKey
    this.formItems.nodePublicKey = this.nodePublicKey
    // - maxFee must be absolute
    this.formItems.maxFee = this.defaultFee
  }

  /**
   * Getter for whether forms should aggregate transactions
   * @see {FormTransactionBase}
   * @return {boolean} True if creating transfer for multisig
   */
  protected isAggregateMode(): boolean {
    return false
  }

  /**
   * Getter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @return {TransferTransaction[]}
   */
  protected getTransactions(): TransferTransaction[] {
    this.factory = new TransactionFactory(this.$store)
    try {
      const message = PersistentHarvestingDelegationMessage.create(
        this.remoteAccount.publicKey,
        this.formItems.nodePublicKey,
        this.networkType,
      )

      // - read form
      const data: TransferFormFieldsType = {
        recipient: this.instantiatedRecipient,
        mosaics: [],
        message,
        maxFee: UInt64.fromUint(this.formItems.maxFee),
      }

      // - prepare transaction parameters
      let view = new ViewTransferTransaction(this.$store)
      view = view.parse(data)

      // - prepare transfer transaction
      return [this.factory.build(view)]
    } catch (error) {
      console.error('Error happened in FormTransferTransaction.transactions(): ', error)
    }
  }

  /**
   * Setter for TRANSFER transactions that will be staged
   * @see {FormTransactionBase}
   * @throws {Error} If not overloaded in derivate component
   */
  protected setTransactions() {
    throw new Error('This transaction can not be staged')
  }

  /**
   * Recipient used in the transaction
   * @readonly
   * @protected
   * @type {Address}
   */
  protected get instantiatedRecipient(): Address {
    return Address.createFromPublicKey(this.formItems.nodePublicKey, this.networkType)
  }
}
