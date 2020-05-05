// external dependencies
import { Component, Vue } from 'vue-property-decorator'
import { NodeHttp, RoleType, NodeInfo } from 'symbol-sdk'
import { mapGetters } from 'vuex'

// internal dependencies
import { ValidationRuleset } from '@/core/validation/ValidationRuleset'

// child components
import { ValidationObserver, ValidationProvider } from 'vee-validate'
// @ts-ignore
import FormWrapper from '@/components/FormWrapper/FormWrapper.vue'
// @ts-ignore
import FormRow from '@/components/FormRow/FormRow.vue'
// @ts-ignore
import ErrorTooltip from '@/components/ErrorTooltip/ErrorTooltip.vue'

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
    FormWrapper,
    FormRow,
    ErrorTooltip,
  },
  computed: {
    ...mapGetters({
      repositoryFactory: 'network/repositoryFactory',
    }),
  },
})
export class FormHarvestingNodeSelectionTs extends Vue {
  /**
   * Validation rules
   */
  public validationRules = ValidationRuleset

  /**
   * Easy access to the component's form refs
   */
  private form: any

  /**
   * Form items
   */
  protected formItems = { nodeUrl: '' }

  /**
   * Hook called when the submit button is clicked
   * @protected
   * @returns {Promise<void>}
   */
  protected async onSubmit(): Promise<void> {
    try {
      const publicKey = await this.checkNode()
      // emit the node public key
      this.$emit('setNodePublicKey', publicKey)
      // enable the next button in the parent wizard
      this.$emit('toggleNext', true)
    } catch (error) {
      // set error in the error tooltip
      this.form.setErrors({ endpoint: this.$t(error.message) })
    }
  }

  /**
   * Checks if the given node is eligible for harvesting
   * @protected
   * @returns {Promise<void>}
   */
  protected async checkNode(): Promise<string> {
    let nodeInfo: NodeInfo

    try {
      nodeInfo = await new NodeHttp(this.formItems.nodeUrl).getNodeInfo().toPromise()
    } catch (error) {
      throw new Error('Node_connection_failed')
    }

    if (nodeInfo.roles === RoleType.PeerNode) throw new Error('harvesting_node_not_eligible')
    return nodeInfo.publicKey
  }

  /**
   * Hook called when the component is created
   */
  public created() {
    // disable the next button in the parent wizard
    this.$emit('toggleNext', false)
  }

  /**
   * Hook called when the component is mounted
   */
  public mounted() {
    // affect the refs once the DOM has been created
    this.form = this.$refs.form
  }
}
