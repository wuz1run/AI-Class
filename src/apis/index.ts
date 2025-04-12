import loginAPI from "./Server/loginAPI";
import registerAPI from "./Server/registerAPI";
import findPasswordAPI from "./Server/findPasswordAPI";
import sendVerificationCodeAPI from "./Server/sendVerificationCodeAPI";
import changePassAPI from "./Server/changePassAPI";
import getTopicListAPI from "./Server/chat/getTopicListAPI";
import deleteTopicAPI from "./Server/chat/deleteTopicAPI";
import modifyTitleAPI from "./Server/chat/modifyTitleAPI";
import createTopicAPI from "./Server/chat/createTopicAPI";
import getChatHistoryAPI from "./Server/chat/getChatHistoryAPI";
import getUserInfoAPI from "./Server/getUserInfoAPI";
import changeUserInfoAPI from "./Server/changeUserInfoAPI";
import createDirectoryAPI from "./Server/myResources/createDirectoryAPI";
import getFileListAPI from "./Server/myResources/getFileListAPI";
import getFileInfoAPI from "./Server/myResources/getFileInfoAPI";
import modifyFileNameAPI from "./Server/myResources/modifyFileNameAPI";
import deleteFileAPI from "./Server/myResources/deleteFileAPI";
import uploadFileAPI from "./Server/myResources/uploadFileAPI";
import collectFileAPI from "./Server/myResources/collectFileAPI";
import moveFileAPI from "./Server/myResources/moveFileAPI";
import searchFileAPI from "./Server/myResources/searchFileAPI";
import filterFileTypeAPI from "./Server/myResources/filterFileTypeAPI";
import userUploadAPI from "./Server/userUploadAPI";
import getRecycleListAPI from "./Server/myResources/getRecycleListAPI";
import restoreFileAPI from "./Server/myResources/restoreFileAPI";
import completelyDelAPI from "./Server/myResources/completelyDelAPI";
import getNotificationAPI from "./Server/getNotificationAPI";
import getAIResponseAPI from "./Server/chat/getAIResponseAPI"
import uploadQuizAPI from "./Server/uploadQuizAPI";
import getQuizAPI from "./Server/getQuizAPI";
import releaseQuizAPI from "./Server/releaseQuizAPI";
import uploadChatHistoryAPI from "./Server/chat/uploadChatHistoryAPI";
import getClassMembersAPI from "./Server/getClassMembersAPI";
import uploadAnswerAPI from "./Server/uploadAnswerAPI";
import getClassesAPI from "./Server/getClassesAPI";
import createClassAPI from "./Server/createClassAPI";
import joinClassAPI from "./Server/joinClassAPI";
import getStudentClassesAPI from "./Server/getStudentClassesAPI";
import studentGetQuizAPI from "./Server/studentGetQuizAPI";
import getTestIDAPI from "./Server/getTestIDAPI";
import checkAnswerAPI from "./Server/myResources/checkAnswerAPI"
import downloadDocAPI from "./Server/myResources/downloadDocAPI";
import getAIResponseStreamAPI from "./Server/chat/getAIResponseStreamAPI";
export {
    loginAPI,//finished
    registerAPI,//finished
    findPasswordAPI,//finished
    changePassAPI,//finished
    getTopicListAPI,//finished
    deleteTopicAPI,//finished
    modifyTitleAPI,//finished
    createTopicAPI,//finished
    getChatHistoryAPI,//finished
    getUserInfoAPI,//finished
    changeUserInfoAPI,//finished
    getNotificationAPI,//self-made
    getAIResponseAPI,//self-made
    uploadQuizAPI,//self-made
    getQuizAPI,//self-made
    getClassMembersAPI,//self-made
    releaseQuizAPI,//self-made
    uploadChatHistoryAPI,//self-made
    uploadAnswerAPI,//self-made
    getClassesAPI,//self-made
    createClassAPI,//self-made
    joinClassAPI,//self-made
    getStudentClassesAPI,//self-made
    studentGetQuizAPI,//self-made
    getTestIDAPI,//self-made
    getAIResponseStreamAPI,//self-made
    downloadDocAPI,
    createDirectoryAPI,//Maybe Unused
    getFileListAPI,//Maybe Unused
    getFileInfoAPI,//Maybe Unused
    modifyFileNameAPI,//Maybe Unused
    deleteFileAPI,//Maybe Unused
    uploadFileAPI,//Maybe Unused
    collectFileAPI,//Maybe Unused
    moveFileAPI,//Maybe Unused
    searchFileAPI,//Maybe Unused
    filterFileTypeAPI,//Maybe Unused
    userUploadAPI,//Maybe Unused
    getRecycleListAPI,//Maybe Unused
    restoreFileAPI,//Maybe Unused
    completelyDelAPI,//Maybe Unused
    sendVerificationCodeAPI,//Maybe Unused
    checkAnswerAPI,

}
