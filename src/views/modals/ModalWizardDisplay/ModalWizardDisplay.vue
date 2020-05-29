<template>
  <Steps :current="currentItemIndex" size="small">
    <Step v-for="(item, index) in items" :key="index" :title="$t(item)" />
  </Steps>
</template>
<script lang="ts">
// external dependencies
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class ModalWizardDisplay extends Vue {
  protected isDisplayed = false

  @Prop({ default: () => [] }) items: string[]
  @Prop({ default: 0 }) currentItemIndex: number

  protected showWizard(): void {
    this.isDisplayed = true
  }
}
</script>
