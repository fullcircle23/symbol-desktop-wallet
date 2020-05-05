<template>
  <div>
    <button @click="hasHarvestingWizard = !hasHarvestingWizard">
      Show remote harvesting wizard
    </button>
    <ModalHarvestingWizard
      v-if="hasHarvestingWizard"
      :visible="hasHarvestingWizard"
      @close="hasHarvestingWizard = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import ModalHarvestingWizard from '@/views/modals/ModalHarvestingWizard/ModalHarvestingWizard.vue'

@Component({ components: { ModalHarvestingWizard } })
export default class Harvesting extends Vue {
  protected hasHarvestingWizard = false
}
</script>
