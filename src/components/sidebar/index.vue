<template>
<ul class="menu bg-base-300 rounded-box w-[120px] h-screen text-base">
  <li>
    <router-link to="/chat">
      <el-icon size="22"><ChatDotRound /></el-icon>
      对话
    </router-link>
  </li>
  <li>
    <router-link to="/lessonPreparationMaterials">
      <el-icon size="22"><Document /></el-icon>
      素材
    </router-link>
  </li>
  <li>
    <a>
      <el-icon size="22"><User /></el-icon>
      我的
    </a>
  </li>
</ul>
</template>

<script setup lang="ts">

</script>
