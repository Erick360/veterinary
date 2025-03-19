<script setup>
import { onMounted, ref } from "vue";
//import data  from '@/views/js/datatable';
import {
  VBtn,
  VCard,
  VDataTable,
  VSpacer,
  VTextField,
} from "vuetify/components";

const data = ref([]);

const headers = [
  {
    title: "ID",
    key: "id",
  },
  {
    title: "Role",
    key: "name",
  },
  {
    title: "Permisos",
    key: "permissions_pluck",
  },
  {
    title: "Date",
    key: "created_at",
  },
  {
    title: "Op",
    key: "action",
  },
];

const searchQuery = ref(null);
const isAddRoleDialogVisible = ref(false);
const isEditRoleDialogVisible = ref(false);
const isDeleteRoleDialogVisible = ref(false);
const role_selected = ref(null);
const role_selected_deleted = ref(null);
const isLoading = ref(false);


const list = async () => {
    isLoading.value = true;
    try {
        const resp = await $api("/roles?search=" + (searchQuery.value || ""), {
            method: "GET",
            onResponseError({ response }) {
                console.log(response);
            },
        });
        //data.value = Array.isArray(resp.roles) ? resp.roles : [];
       data.value = resp.roles;
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false;
    }
};    ;

const editItem = (item) => {
  isEditRoleDialogVisible.value = true;
  role_selected.value = item;
};

const deleteItem = (item) => {
  isDeleteRoleDialogVisible.value = true;
  role_selected_deleted.value = item;
};

onMounted(() => {
  list();
});

</script>

<template>
  <div>
    <h1>Roles</h1>
    <VCard title="Roles y Permisos">
      <VCardText class="d-felx flex-wrap ga-4">
        <div d-flex align-center>
          <VTextField
            v-model="searchQuery"
            placeholder="Search Role"
            style="inline-size: 300px"
            density="compact"
            class="me-3"
            @keyup.enter="list"
          />
        </div>

        <VSpacer />

        <div class="d-flex gap-x-4 align-center">
          <!--
                    <VBtn
                        variant="outlined"
                        color="secondary"
                        prepend-icon="ri-upload-2-line"
                    >
                    Export    
                    </VBtn>
                -->
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            @click="isAddRoleDialogVisible = !isAddRoleDialogVisible"
          >
            Add Role
          </VBtn>
        </div>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="data"
        :items-per-page="5"
        class="text-no--wrap"
      >
        <template #item.id="{ item }">
          <span class="text-h6">{{ item.id }}</span>
        </template>
        <template #item.permissions_pluck="{ item }">
          <ul>
            <li
              v-for="(permisos, index) in item.permissions_pluck"
              :key="index"
            >
              {{ permisos }}
            </li>
          </ul>
        </template>
        <!-- Actions -->
        <template #item.action="{ item }">
          <div class="d-flex gap-1">
            <IconBtn size="small" @click="editItem(item)">
              <VIcon icon="ri-pencil-line" />
            </IconBtn>
            <IconBtn size="small" @click="deleteItem(item)">
              <VIcon icon="ri-delete-bin-line" />
            </IconBtn>
          </div>
        </template>
      </VDataTable>

      <AddRoleDialog v-model:is-dialog-visible="isAddRoleDialogVisible" @addRole="list()"/>
      <EditRoleDialog v-if="role_selected" :roleSelected="role_selected" v-model:is-dialog-visible="isEditRoleDialogVisible"  @addRole="list()"/>
      <DeleteRoleDialog v-if="role_selected_deleted" :roleSelected="role_selected" @addRole="list()" v-model:is-dialog-visible="isDeleteRoleDialogVisible" />
    </VCard>
  </div>
</template>
