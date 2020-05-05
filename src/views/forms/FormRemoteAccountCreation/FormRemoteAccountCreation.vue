<template>
  <div>
    <div v-if="!remoteAccount">
      <div>{{ $t('harvesting_create_remote_account') }}</div>
      <div>{{ $t('harvesting_remote_account_description_1') }}</div>
      <div>{{ $t('harvesting_remote_account_description_2') }}</div>
      <div>{{ $t('harvesting_remote_account_description_3') }}</div>
      <FormProfileUnlock button-text="create" @success="onAccountUnlocked" @error="onError" />
    </div>

    <div v-if="remoteAccount" class="account-details-grid">
      {{ $t('harvesting_remote_account_creation_successful_1') }}
      <div class="detail-row">
        <AccountAddressDisplay :address="remoteAccount.address.plain()" />
      </div>

      <div class="detail-row">
        <AccountPublicKeyDisplay :account="remoteAccount" />
      </div>

      <div class="detail-row">
        <ProtectedPrivateKeyDisplay :account="remoteAccount" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { FormRemoteAccountCreationTs } from './FormRemoteAccountCreationTs'
export default class FormRemoteAccountCreation extends FormRemoteAccountCreationTs {}
</script>
