
<template>
  <div class="h-[600px]">
  </div>
  <homeNotification >{{notification}}</homeNotification>
</template>

<script setup lang="ts">
import {homeNotification} from "../../components"
import {onMounted, reactive, watch} from "vue"
import {useRequest} from "vue-hooks-plus";
import {getNotificationAPI} from "../../apis";
import {ElNotification} from "element-plus";
import {ref} from "vue"
let notification = ref("")
onMounted(()=>{
  useRequest(()=>getNotificationAPI(),{
    onSuccess(res){
      if(res['code']===200){
        if(!res['data']) return
        notification.value= res['data']['notification']
      }else{
        ElNotification({title: 'Warning', message: res['msg'], type: 'warning',})
        notification.value = "Unable to get notification"
      }
    },
    onError(err){
      ElNotification({title: 'Error', message: err.toString(), type: 'error',})
      notification.value = "Unable to get notification"
    }})
})


</script>


<style scoped>

</style>