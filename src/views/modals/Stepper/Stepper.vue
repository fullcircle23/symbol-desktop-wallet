<template>
  <Steps :current="currentItemIndex" size="small">
    <Step v-for="(item, index) in items" :key="index" :title="$t(item)" />
  </Steps>
</template>
<script lang="ts">
// external dependencies
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Stepper extends Vue {
  protected hasHarvestingWizard = false

  @Prop({ default: () => [] }) items: string[]
  @Prop({ default: 0 }) currentItemIndex: number

  protected showWizard(): void {
    this.hasHarvestingWizard = true
  }
}
</script>
