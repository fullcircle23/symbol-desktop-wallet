// external dependencies
import { Account, AccountInfo, AccountType } from 'symbol-sdk'
import { AccountModel } from '@/core/database/entities/AccountModel'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

// child components
// @ts-ignore
import Stepper from '@/views/modals/Stepper/Stepper.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
// @ts-ignore
import FormRemoteAccountCreation from '@/views/forms/FormRemoteAccountCreation/FormRemoteAccountCreation.vue'
// @ts-ignore
import FormAccountLinkTransaction from '@/views/forms/FormAccountLinkTransaction/FormAccountLinkTransaction.vue'
// @ts-ignore
import FormHarvestingNodeSelection from '@/views/forms/FormHarvestingNodeSelection/FormHarvestingNodeSelection.vue'
// @ts-ignore
import FormPersistentDelegationRequestTransaction from '@/views/forms/FormPersistentDelegationRequestTransaction/FormPersistentDelegationRequestTransaction.vue'

/**
 * Wizard steps
 */
enum HarvestingWizardSteps {
  REMOTE_ACCOUNT = 0,
  ACCOUNT_LINK = 1,
  NODE_SELECTION = 2,
  DELEGATION_REQUEST = 3,
}

@Component({
  components: {
    Stepper,
    FormRow,
    FormRemoteAccountCreation,
    FormAccountLinkTransaction,
    FormHarvestingNodeSelection,
    FormPersistentDelegationRequestTransaction,
  },
  computed: mapGetters({
    currentAccount: 'account/currentAccount',
    currentAccountAccountInfo: 'account/currentAccountAccountInfo',
  }),
})
export class ModalHarvestingWizardTs extends Vue {
  /**
   * Enum representing the wizard steps
   */
  protected wizardSteps = HarvestingWizardSteps

  /**
   * Current account
   */
  private currentAccount: AccountModel

  /**
   * Current account account info
   */
  private currentAccountAccountInfo: AccountInfo

  /**
   * Items that will be shown in the stepper
   */
  protected stepperItems = Object.keys(HarvestingWizardSteps).filter((key) => Number.isNaN(parseFloat(key)))

  /**
   * Currently active step
   */
  protected currentStepIndex = 0

  /**
   * Sets the disabled property of the next button
   */
  protected isNextEnabled = false

  /**
   * Remote account
   */
  protected remoteAccount: Account = null

  /**
   * Node public key
   */
  protected nodePublicKey: string = null

  /**
   * Modal visibility state from parent
   * @type {string}
   */
  @Prop({ default: false }) visible: boolean

  /**
   * Internal visibility state
   * @type {boolean}
   */
  protected get show(): boolean {
    return this.visible
  }

  /**
   * Emits close event
   */
  protected set show(val) {
    if (!val) {
      this.$emit('close')
    }
  }

  /**
   * Hook called when the next button is clicked
   */
  protected onNextClicked(): void {
    let nextStepIndex = (this.currentStepIndex += 1)

    // skip the account link step if the current account is already linked
    if (nextStepIndex === this.wizardSteps.ACCOUNT_LINK && this.isCurrentAccountLinked) {
      nextStepIndex += 1
    }

    this.currentStepIndex = nextStepIndex
  }

  private get isCurrentAccountLinked(): boolean {
    return this.currentAccountAccountInfo && this.currentAccountAccountInfo.accountType === AccountType.Main
  }

  /**
   * Hook called when the previous button is called
   */
  protected onPreviousClicked(): void {
    this.currentStepIndex = this.currentStepIndex -= 1
  }

  /**
   * Hook called when a child component toggles the disabled state of the next button
   * @param {boolean} bool
   */
  protected onNextToggled(bool: boolean): void {
    this.isNextEnabled = bool
  }

  /**
   * Hook called when a child component sets the remote account
   * @param {Account} remoteAccount
   */
  protected onSetRemoteAccount(remoteAccount: Account): void {
    this.remoteAccount = remoteAccount
  }

  /**
   * Hook called when a child component sets the node public key
   * @param {string} nodePublicKey
   */
  protected onSetNodePublicKey(nodePublicKey: string): void {
    this.nodePublicKey = nodePublicKey
  }

  /**
   * Hook called when the component is created
   */
  public created() {
    this.$emit('toggleNext', false)
  }
}
