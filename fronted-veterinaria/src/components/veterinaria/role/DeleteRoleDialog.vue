<script setup>
import { onMounted, ref } from "vue";
import { VBtn, VTextField } from "vuetify/components";

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  roleSelected: {
    type: Object,
    required: true,
  }
});

const emit = defineEmits(["update:isDialogVisible","addRole"]);

const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};



const warning = ref(false);
const error_exist = ref(null);
const success = ref(null);
const role_selected = ref(null);


const deleted = async () => {
 

  try{
      const resp = await $api('/roles/'+role_selected.value.id,{
      method: 'DELETE',
      onResponseError({response}){
        console.log(response);
        error_exist.value = response._data.error;
      }
    });

    console.log(resp);
    success.value = 'Role deleted successfully';
    emit('addRole',true);
    emit('update:isDialogVisible', false);
  }catch(error){
    console.log(error);
    error_exist.value = error;
  }
  
};

onMounted(() => {
  //role.value = props.roleSelected.name;
  role_selected.value = props.roleSelected;
  console.log(role_selected.value);
});

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
            Edit Role{{ role_selected }}
          </h4>
          <!--
          <p class="text-sm-body-1 text-center">
            Supported payment methods
          </p>
        --></div>

        <p v-if="role_selected">Are you sure that you wanted to delete this role "{{ role_selected.name }}"?</p>
        <!-- Warning message-->
        <VAlert type="warning" class="mt-3" v-if="warning">
          <strong>{{ warning }}</strong>
        </VAlert>
        <!-- Error message-->
        <VAlert type="error" class="mt-3" v-if="error_exist">
          <strong> error to save </strong>
        </VAlert>
       

      </VCardText>

      <VCardText class="pa-5">
        <VBtn 
        color="error"
         class="mb-4"
          @click="deleted()"
          >
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
