<template>
  <div class="FormTransferTransaction">
    <FormWrapper>
      <ValidationObserver v-slot="{ handleSubmit }" ref="observer" slim>
        <form onsubmit="event.preventDefault()">
          <!-- Transaction fee selector and submit button -->
          <MaxFeeAndSubmit v-model="formItems.maxFee" @button-clicked="handleSubmit(onSubmit)" />
        </form>
      </ValidationObserver>

      <ModalTransactionConfirmation
        v-if="hasConfirmationModal"
        :visible="hasConfirmationModal"
        @success="onConfirmationSuccess"
        @error="onConfirmationError"
        @close="onConfirmationCancel"
      />
    </FormWrapper>
  </div>
</template>

<script lang="ts">
import { FormPersistentDelegationRequestTransactionTs } from './FormPersistentDelegationRequestTransactionTs'
export default class FormPersistentDelegationRequestTransaction extends FormPersistentDelegationRequestTransactionTs {}
</script>
