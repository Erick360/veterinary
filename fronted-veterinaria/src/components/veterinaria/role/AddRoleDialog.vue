<script setup>
import { PERMISOS } from "@/utils/constants";
import { ref } from "vue";
import { VBtn, VTextField } from "vuetify/components";

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isDialogVisible","addRole"]);

const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};

const LIST_PERMISSIONS = PERMISOS;
const role = ref(null);
const permissions = ref([]);
const warning = ref(false);
const error_exist = ref(null);
const success = ref(null);

const addPermission = (permiso) => {
  let INDEX = permissions.value.findIndex((perm) => perm == permiso);
  if (INDEX != -1) {
    permissions.value.splice(INDEX, 1);
  } else {
    permissions.value.push(permiso);
  }
  console.log(permissions.value);
};

const store = async () => {
  warning.value = null;
  if (!role.value) {
    warning.value = "we need to write the name of the role";
    return;
  }
  if (permissions.value.length == 0) {
    warning.value = "we need to select at least one permission";
    return;
  }

  let data = {
    name: role.value,
    permissions: permissions.value,
  }

  try{
      const resp = await $api('/roles',{
      method: 'POST',
      body: data,
      onResponseError({response}){
        console.log(response);
        error_exist.value = response._data.error;
      }
    });

    console.log(resp);
    
    if(resp.message == 400){
      warning.value = resp.message_text;
    }else{
      success.value = 'Role created successfully';
    }

    setTimeout(() => {
      success.value = null;
      warning.value = null;
      role.value = null;
      permissions.value = [];
      emit("update:isDialogVisible", false);
      emit("addRole", true);
    }, 2000);

  }catch(error){
    console.log(error);
    error_exist.value = error;
  }
  
};


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
          <h4 class="text-h4 text-center mb-2">Add Role</h4>
          <!--
          <p class="text-sm-body-1 text-center">
            Supported payment methods
          </p>
        --></div>

        <VTextField label="Role:" v-model="role" placeholder="Admin" />
        <!-- Warning message-->
        <VAlert type="warning" class="mt-3" v-if="warning">
          <strong>{{ warning }}</strong>
        </VAlert>
        <!-- Error message-->
        <VAlert type="error" class="mt-3" v-if="error_exist">
          <strong> error to save </strong>
        </VAlert>
        <!-- Success message-->
        <VAlert type="success" class="mt-3" v-if="success">
          <strong>{{ success }}</strong>
        </VAlert>

      </VCardText>

      <VCardText class="pa-5">
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
        <VBtn 
        color="primary"
         class="my-4"
          @click="store()"
          >
           Create 
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
