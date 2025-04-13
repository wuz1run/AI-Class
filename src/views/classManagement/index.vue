<template>
  <div class="h-screen w-screen bg-base-200 flex">
    <div class="flex flex-1 items-center justify-center">
      <classUserManagement v-show="isUserManage" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from "vue";
import { myMenu, classUserManagement, classCoursesManagement } from "../../components"

const isUserManage = ref<boolean>(true)
</script>

<style scoped>

</style>