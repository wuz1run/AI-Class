<template>
  <div class="h-screen bg-base-200">
    <navBar v-if="loginstore.loginSession"></navBar>
    <div class="flex mt-1">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "./stores";
import { navBar } from "./components"
import {onMounted} from "vue";
import router from "./router";

const loginstore = useMainStore().loginStore();
onMounted(()=>{
  if(!loginstore.loginSession){
    router.push("/login");
  }
})

</script>

<style>
page{
  background-color: #161622;
}
</style>