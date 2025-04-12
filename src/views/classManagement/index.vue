<template>
<div class="h-screen w-screen bg-base-200 flex gap-0">
  <div class="flex flex-col gap-0 w-[100px] mt-4">
  </div>
  <classUserManagement v-show="isUserManage"></classUserManagement>
  <classCoursesManagement v-show="!isUserManage"></classCoursesManagement>
</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { myMenu, classUserManagement, classCoursesManagement } from "../../components"

const isUserManage = ref<boolean>(true)
</script>

<style scoped>

</style>