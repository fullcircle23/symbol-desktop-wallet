<template>
  <ValidationProvider
    v-slot="{ errors }"
    vid="selectedMosaic"
    :name="$t(label)"
    :rules="'required'"
    tag="div"
    class="select-container"
  >
    <ErrorTooltip :errors="errors">
      <select v-model="selectedMosaic" v-focus class="select-size select-style">
        <option v-for="m in displayedMosaics" :key="m.mosaicIdHex" :value="m.mosaicIdHex">
          {{ m.name || m.mosaicIdHex }}
        </option>
      </select>
    </ErrorTooltip>
  </ValidationProvider>
</template>

<script lang="ts">
import { MosaicSelectorTs } from './MosaicSelectorTs'

export default class MosaicSelector extends MosaicSelectorTs {}
</script>
