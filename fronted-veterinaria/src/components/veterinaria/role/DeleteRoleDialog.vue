<script setup>
import { onMounted, ref, watch } from "vue";
import { VBtn, VTextField, VAlert } from "vuetify/components"; 

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roleSelected: {
    type: Object,
    required: true,
    default: () => ({}), // Default to an empty object
  },
});


const emit = defineEmits(["update:isDialogVisible", "addRole"]);


const warning = ref(false);
const error_exist = ref(null);
const success = ref(null);
const role_selected = ref(null);


const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};

const deleted = async () => {
  warning.value = false;
  error_exist.value = null;
  success.value = null;

  if (!role_selected.value?.id) {
    warning.value = "No role selected for deletion.";
    return;
  }

  try {
    const resp = await $api(`/roles/${role_selected.value.id}`, {
      method: "DELETE",
      onResponseError({ response }) {
        console.error("API Error:", response);
        error_exist.value = response._data.error || "An error occurred while deleting the role.";
      },
    });

    console.log(resp);
    success.value = "Role deleted successfully.";
    emit("addRole", true); // Notify parent component
    emit("update:isDialogVisible", false); // Close the dialog
  } catch (error) {
    console.error("Unexpected Error:", error);
    error_exist.value = "An unexpected error occurred. Please try again.";
  }
};


onMounted(() => {
  if (props.roleSelected) {
    role_selected.value = props.roleSelected;
    console.log("Role Selected:", role_selected.value);
  }
});


watch(
  () => props.roleSelected,
  (newVal) => {
    if (newVal) {
      role_selected.value = newVal;
      console.log("Role Selected Updated:", role_selected.value);
    }
  },
  { immediate: true }
);
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="750"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="refer-and-earn-dialog pa-3 pa-sm-11">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pa-5">
        <div class="mb-6">
          <h4 class="text-h4 text-center mb-2" v-if="role_selected">
            Delete Role {{ role_selected.name }}
          </h4>
        </div>

        <p v-if="roleSelected">Are you sure to delete {{ role_selected.name }}?</p>
        <!-- Warning message -->
        <VAlert type="warning" class="mt-3" v-if="warning">
          <strong>{{ warning }}</strong>
        </VAlert>

        <!-- Error message -->
        <VAlert type="error" class="mt-3" v-if="error_exist">
          <strong>{{ error_exist }}</strong>
        </VAlert>

        <!-- Success message -->
        <VAlert type="success" class="mt-3" v-if="success">
          <strong>{{ success }}</strong>
        </VAlert>
      </VCardText>

      <VCardText class="pa-5">
        <!-- Delete Button -->
        <VBtn color="error" class="mb-4" @click="deleted">
          Delete Role
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.refer-link-input {
  .v-field--appended {
    padding-inline-end: 0;
  }

  .v-field__append-inner {
    padding-block-start: 0.125rem;
  }
}
</style>
