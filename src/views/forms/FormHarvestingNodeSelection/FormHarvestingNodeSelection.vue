<template>
  <FormWrapper class="account-unlock-container" :whitelisted="true">
    <ValidationObserver ref="form" slim>
      <form action="processSubmit" onsubmit="event.preventDefault()" class="form-line-container mt-3">
        <FormRow>
          <template v-slot:label> {{ $t('Node_URL') }}: </template>
          <template v-slot:inputs>
            <div class="row-75-25 inputs-container">
              <ValidationProvider
                v-slot="{ errors }"
                mode="lazy"
                vid="endpoint"
                :name="$t('endpoint')"
                :rules="validationRules.url"
                slim
              >
                <ErrorTooltip :errors="errors">
                  <input
                    v-model="formItems.nodeUrl"
                    v-focus
                    class="input-size input-style"
                    :data-vv-as="$t('endpoint')"
                    data-vv-name="endpoint"
                    :placeholder="$t('please_enter_a_custom_nod_address')"
                  />
                </ErrorTooltip>
              </ValidationProvider>
              <button class="button-style validation-button right-side-button" type="submit" @click="onSubmit">
                {{ $t('harvesting_node_get_node_info') }}
              </button>
            </div>
          </template>
        </FormRow>
      </form>
    </ValidationObserver>
  </FormWrapper>
</template>
<script lang="ts">
import { FormHarvestingNodeSelectionTs } from './FormHarvestingNodeSelectionTs'
export default class FormHarvestingNodeSelection extends FormHarvestingNodeSelectionTs {}
</script>
