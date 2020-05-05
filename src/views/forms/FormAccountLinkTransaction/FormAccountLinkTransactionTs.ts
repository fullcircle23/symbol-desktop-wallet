/**
 * Copyright 2020 NEM Foundation (https://nem.io)
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
import { UInt64, LinkAction, AccountLinkTransaction } from 'symbol-sdk'
import { Component, Prop } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

// internal dependencies
import { Formatters } from '@/core/utils/Formatters'
import { FormTransactionBase } from '@/views/forms/FormTransactionBase/FormTransactionBase'
import { TransactionFactory } from '@/core/transactions/TransactionFactory'
import {
  ViewAccountLinkTransactionFormFieldsType,
  ViewAccountLinkTransaction,
} from '@/core/transactions/ViewAccountLinkTransaction'

// child components
import { ValidationObserver } from 'vee-validate'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import MaxFeeAndSubmit from '@/components/MaxFeeAndSubmit/MaxFeeAndSubmit.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'

const defaultFormItems = {
  signerPublicKey: '',
  linkAction: LinkAction.Link,
  maxFee: 0,
}

@Component({
  components: {
    FormWrapper,
    FormRow,
    ValidationObserver,
    MaxFeeAndSubmit,
  },
  computed: mapGetters({
    currentAccountAccountInfo: 'account/currentAccountAccountInfo',
    currentPeer: 'network/currentPeer',
  }),
})
export class FormAccountLinkTransactionTs extends FormTransactionBase {
  @Prop({ required: true }) remoteAccountPublicKey: string

  /**
   * Formatters helpers
   */
  public formatters = Formatters

  /**
   * Form items
   */
  public formItems = { ...defaultFormItems }

  /**
   * Reset the form with properties
   */
  protected resetForm() {
    this.formItems = {
      ...defaultFormItems,
      signerPublicKey: this.currentAccount.publicKey,
    }
  }

  /**
   * Getter for transactions that will be staged
   * @see {FormTransactionBase}
   * @return {AccountLinkTransaction[]}
   */
  protected getTransactions(): AccountLinkTransaction[] {
    this.factory = new TransactionFactory(this.$store)
    try {
      // - read form
      const data: ViewAccountLinkTransactionFormFieldsType = {
        remotePublicKey: this.remoteAccountPublicKey,
        linkAction: this.formItems.linkAction,
        maxFee: UInt64.fromUint(this.formItems.maxFee),
      }

      // - prepare transaction parameters
      let view = new ViewAccountLinkTransaction(this.$store)
      view = view.parse(data)

      // - prepare transfer transaction
      const transactions = [this.factory.build(view)]

      this.$emit('toggleNext', true)

      return transactions
    } catch (error) {
      console.error('Error happened in FormAccountLink.getTransactions(): ', error)
    }
  }

  /**
   * Setter for transactions that will be staged
   * @see {FormTransactionBase}
   * @param {AccountLinkTransaction[]} transactions
   * @throws {Error} If not overloaded in derivate component
   */
  protected setTransactions(transactions: AccountLinkTransaction[]) {
    // - this form creates only 1 transaction
    const [transaction] = transactions
    this.remoteAccountPublicKey = transaction.remotePublicKey
    this.formItems.linkAction = transaction.linkAction
    this.formItems.maxFee = transaction.maxFee.compact()
  }

  /**
   * Getter for whether forms should aggregate transactions
   * @see {FormTransactionBase}
   * @return {boolean} True if creating alias for multisig
   */
  protected isAggregateMode(): boolean {
    return false
  }

  /**
   * Hook called when the component is mounted
   */
  public mounted() {
    this.$emit('toggleNext', false)
  }
}
