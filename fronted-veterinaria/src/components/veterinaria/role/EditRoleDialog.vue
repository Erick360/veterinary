<script setup>

import { ref, onMounted, watch } from 'vue';

// Props
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

// Emits
const emit = defineEmits(["update:isDialogVisible", "addRole"]);

// Constants
const LIST_PERMISSIONS = PERMISOS; // Ensure PERMISOS is defined elsewhere

// Refs
const role = ref('');
const permissions = ref([]);
const warning = ref(null);
const error_exist = ref(null);
const success = ref(null);
const role_selected = ref(null);

// Methods
const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};

const addPermission = (permiso) => {
  const index = permissions.value.findIndex((perm) => perm === permiso);
  if (index !== -1) {
    permissions.value.splice(index, 1); // Remove permission if already selected
  } else {
    permissions.value.push(permiso); // Add permission if not selected
  }
  console.log("Selected Permissions:", permissions.value);
};

const validateForm = () => {
  if (!role.value) {
    warning.value = "Please enter the name of the role.";
    return false;
  }
  if (permissions.value.length === 0) {
    warning.value = "Please select at least one permission.";
    return false;
  }
  return true;
};

const store = async () => {
  warning.value = null;
  error_exist.value = null;
  success.value = null;

  if (!validateForm()) return;

  const data = {
    name: role.value,
    permissions: permissions.value,
  };

  try {
    const resp = await $api(`/roles/${role_selected.value.id}`, {
      method: 'PATCH',
      body: data,
      onResponseError({ response }) {
        console.error("API Error:", response);
        error_exist.value = response._data.error || "An error occurred while updating the role.";
      },
    });

    if (resp.message === 400) {
      warning.value = resp.message_text || "Invalid request.";
    } else {
      success.value = 'Role updated successfully.';
      emit('addRole', true); // Notify parent component
      dialogVisibleUpdate(false); // Close the dialog
    }
  } catch (error) {
    console.error("Unexpected Error:", error);
    error_exist.value = "An unexpected error occurred. Please try again.";
  }
};

// Lifecycle Hooks
onMounted(() => {
  if (props.roleSelected) {
    role_selected.value = props.roleSelected;
    role.value = role_selected.value.name;
    permissions.value = role_selected.value.permissions_puck || [];
  }
});

// Watcher for roleSelected
watch(
  () => props.roleSelected,
  (newVal) => {
    if (newVal) {
      role_selected.value = newVal;
      role.value = newVal.name;
      permissions.value = newVal.permissions_puck || [];
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
            Edit Role {{ role_selected.id }}
          </h4>
        </div>

        <VTextField label="Role:" v-model="role" placeholder="Admin" />

        <!-- Warning message-->
        <VAlert type="warning" class="mt-3" v-if="warning">
          <strong>{{ warning }}</strong>
        </VAlert>
        <!-- Error message-->
        <VAlert type="error" class="mt-3" v-if="error_exist">
          <strong>Error to save</strong>
        </VAlert>
        <!-- Success message-->
        <VAlert type="success" class="mt-3" v-if="success">
          <strong>{{ success }}</strong>
        </VAlert>
      </VCardText>

      <VCardText class="pa-5">
        <VBtn 
          color="primary"
          class="mb-4"
          @click="store()"
        >
          Edit
        </VBtn>
        <VTable>
          <thead>
            <tr>
              <th class="text-uppercase">Modules</th>
              <th class="text-uppercase">Permissions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in LIST_PERMISSIONS" :key="index">
              <td>
                {{ item.name }}
              </td>
              <td>
                <ul>
                  <li
                    v-for="(permiso, index2) in item.permisos"
                    :key="index2"
                    style="list-style: none"
                  >
                    <VCheckbox
                      v-model="permissions"
                      :label="permiso.name"
                      :value="permiso.permiso"
                      @click="addPermission(permiso.permiso)"                         
                    />
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </VTable>
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
