import { defineStore } from "pinia";
import { reactive, } from "vue";

const userInfoStore = defineStore('userInfo',
    ()=>{
        const userInfo = reactive({
            userid: -1,
            username: "",
            email: "",
            avatar: "",
            created_at: "",
            character: "",
        })
        const setInfo = (data) => {
            if(data['character']==0)
            {
                data['character'] = "teacher";
            }
            else if(data['character']==1)
            {
                data['character'] = "student";
            }
            Object.assign(userInfo,data);
        }
        const changeInfo = (key,value) => {
            userInfo[key] = value;
        }
        const clearInfo = () => {
            userInfo['user_id'] = -1;
            userInfo['username'] = "";
            userInfo['email'] = "";
            userInfo['avatar'] = "";
            userInfo['created_at'] = "";
            userInfo['character'] = "";
        }
        return {
            userInfo,
            setInfo,
            changeInfo,
            clearInfo,
        };
    },
    {
        persist: true
    }
)

export default userInfoStore;