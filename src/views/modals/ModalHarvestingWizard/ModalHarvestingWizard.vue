<template>
  <div class="container">
    <Modal v-model="show" class-name="modal-container" :footer-hide="true">
      <Stepper :items="stepperItems" :current-item-index="currentStepIndex" />
      <div v-if="wizardSteps[currentStepIndex] === 'REMOTE_ACCOUNT'">
        <FormRemoteAccountCreation @setRemoteAccount="onSetRemoteAccount" @toggleNext="onNextToggled" />
      </div>
      <div v-if="wizardSteps[currentStepIndex] === 'ACCOUNT_LINK'">
        <FormAccountLinkTransaction :remote-account-public-key="remoteAccount.publicKey" @toggleNext="onNextToggled" />
      </div>
      <div v-if="wizardSteps[currentStepIndex] === 'NODE_SELECTION'">
        <FormHarvestingNodeSelection @setNodePublicKey="onSetNodePublicKey" @toggleNext="onNextToggled" />
      </div>
      <div v-if="wizardSteps[currentStepIndex] === 'DELEGATION_REQUEST'">
        <FormPersistentDelegationRequestTransaction :remote-account="remoteAccount" :node-public-key="nodePublicKey" />
      </div>

      <div class="previous-next-container">
        <div v-if="currentStepIndex > 0" class="left">
          <button class="button-style info-button back-button" @click="onPreviousClicked">
            {{ $t('previous') }}
          </button>
        </div>
        <span v-else>&nbsp;</span>

        <div v-if="currentStepIndex < stepperItems.length - 1" class="right">
          <button class="button-style validation-button" :disabled="!isNextEnabled" @click="onNextClicked">
            {{ $t('next') }}
          </button>
        </div>
        <span v-else>&nbsp;</span>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import { ModalHarvestingWizardTs } from './ModalHarvestingWizardTs'
export default class ModalHarvestingWizard extends ModalHarvestingWizardTs {}
</script>

<style lang="less" scoped>
.previous-next-container {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 50%);

  .left {
    padding-right: 50%;
  }

  .right {
    padding-left: 50%;
    justify-self: right;
  }
}
</style>
