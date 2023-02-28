<script setup>
import Loading from './_partials/_modals/Loading.vue';
import AddContact from './_partials/_modals/AddContact.vue';
import Profile from './_partials/_modals/Profile.vue';
import CreateGroup from './_partials/_modals/CreateGroup.vue';
import UnsendMessage from './_partials/_modals/UnsendMessage.vue';
import DeleteMessage from './_partials/_modals/DeleteMessage.vue';
import CreatePoll from './_partials/_modals/CreatePoll.vue';
import GroupInfo from './_partials/_modals/GroupInfo.vue';
import GroupLeave from './_partials/_modals/GroupLeave.vue';
import notificationSound from '../../assets/audio/notification.wav';
</script>
<script>
import {
  firebaseCreateData,
  firebaseDeleteData,
  firebaseUpdateSingleData,
  firebaseGetDataByWhere
} from "@/firebase";
import { serverTimestamp, Timestamp } from "@firebase/firestore";
import { nextTick, watch } from "@vue/runtime-core";
import { firebaseGetSingleData, firebaseSignOut } from '../../firebase';
import { isEmpty } from "lodash";
import { SendNotification } from '../../assets/js/helpers.js';

export default {
  data() {
    return {
      userData: {},
      chatData: [],
      chatDataDetail: [],
      contactData: {},
      rightClickData: {},
      tempTypingData: {},
      currectChatWindowID: -1,
      totalChat: 0,
      isAlreadyRequestUserData: false,
      isFinishRequest: false,
      showSideBar: true,
      showDarkWindow: false,
      showContactInfo: false,
      typingUpdated: false,
      searchChatKeyword: '',
      timeoutTyping: '',
    };
  },
  methods: {
    toggleSidebar() {
      if (!this.showDarkWindow) {
        let btn = document.querySelector('.btn-sidebar');
        let leftContent = document.querySelector('.left-content');
        if (this.showSideBar) {
          btn.classList.add('hide-sidebar');
          leftContent.classList.add('hide-left-content');
          this.showSideBar = false;
        } else {
          btn.classList.remove('hide-sidebar');
          leftContent.classList.remove('hide-left-content');
          this.showSideBar = true;
        }
      } else {
        this.showDarkWindow = false;
        this.showContactInfo = false;
        this.rightClickData = {};
        setTimeout(() => {
          this.contactData = {};
        }, 600);
      }
    },

    checkSearchKeyword(chat, idx) {
      if (!isEmpty(chat) && !isEmpty(chat.user_details) && !isEmpty(this.chatData[idx])) {
        if (Array.isArray(chat.user_details)) {
          return this.chatData[idx].group_data.name.includes(this.searchChatKeyword) ? false : true;
        } else {
          return chat.user_details.displayName.includes(this.searchChatKeyword) ? false : true;
        }
      }
    },

    getChatListPicture(chat, idx) {
      let img = 'https://img.icons8.com/fluency/48/null/test-account.png';
      if (!isEmpty(chat) && !isEmpty(this.chatData[idx])) {
        if (this.chatData[idx].is_group) {
          return (this.chatData[idx].group_data.picture) ? this.chatData[idx].group_data.picture : img;
        } else {
          if (!isEmpty(chat.user_details)) {
            return (chat.user_details.picture) ? chat.user_details.picture : img;
          }
        }
      }
    },

    getChatListName(chat, idx) {
      if (!isEmpty(chat) && !isEmpty(this.chatData[idx])) {
        if (this.chatData[idx].is_group && !isEmpty(this.chatData[idx].group_data)) {
          return this.chatData[idx].group_data.name;
        } else if (!this.chatData[idx].is_group && !isEmpty(chat.user_details)) {
          return chat.user_details.displayName;
        }
      }
    },

    getChatListLastMessage(chat, idx, headerFlag = false) {
      let lastMsg = '';
      if (!isEmpty(chat) && !isEmpty(this.chatData[idx])) {
        if (chat.typing_status.length != 0) {
          chat.typing_status.forEach(list => {
            if (list.user_id != this.userData.id) {
              if (list.is_typing) {
                lastMsg = 'typing..';
              }
            }
          });
        }

        if (lastMsg != '') {
          return lastMsg;
        }
        if (!headerFlag) {
          if (chat.message_details && chat.message_details.length != 0) {
            if (this.chatData[idx].is_group) {
              lastMsg = chat.message_details[chat.message_details.length - 1].user_name + ': ';
            }
            if (chat.message_details[chat.message_details.length - 1].is_photo) {
              lastMsg = lastMsg + 'image';
            } else {
              lastMsg = lastMsg + chat.message_details[chat.message_details.length - 1].message;
            }
          }
          return lastMsg.substring(0, 20);
        }
      }
    },

    getChatNotification(chat, check = true) {
      let unread = 0;
      let flag = false;
      if (chat.message_details.length > 0) {
        chat.message_details.forEach((msg) => {
          if (!this.checkMessage(msg.user_id) && !msg.is_read) {
            unread++;
            flag = true;
          }
        });
      }
      return check ? flag : unread;
    },

    selectWindowChat(window_id) {
      this.currectChatWindowID = window_id;
      // this.toggleSidebar();
      // this.scrollNewMessage();
    },

    getChatGroupMemberHeader(member) {
      let names = '';
      if (Array.isArray(member)) {
        member.forEach((list, idx) => {
          if (!(idx == member.length - 1)) {
            names = names + list.displayName + ', ';
          } else {
            names = names + list.displayName;
          }
        });
      }
      return names;
    },

    getChatGroupMemberPicture(chatData, chat) {
      let pic = 'https://img.icons8.com/fluency/48/null/test-account.png';
      if (!isEmpty(chatData) && !isEmpty(this.chatData[this.currectChatWindowID])) {
        if (this.chatData[this.currectChatWindowID].is_group) {
          chatData.user_details.forEach(list => {
            if (list.id == chat.user_id) {
              if (list.picture) {
                return pic = list.picture;
              } else {
                return pic;
              }
            }
          });
        } else {
          if (chatData.user_details.picture) {
            return pic = chatData.user_details.picture;
          } else {
            return pic;
          }
        }
        return pic;
      }
    },

    checkMessage(uidChat) {
      return uidChat === this.userData.id ? true : false;
    },

    dateConvert(date) {
      if (date != null && "seconds" in date) {
        let dt = new Date(date.seconds * 1000);
        let hour = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
        let minute = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
        return hour + ":" + minute;
      }
    },

    openContactInfo(chat) {
      this.showContactInfo = !this.showContactInfo;
      this.showDarkWindow = !this.showDarkWindow;
      if (!isEmpty(chat)) {
        if (this.chatData[this.currectChatWindowID].is_group) {
          this.chatDataDetail[this.currectChatWindowID].user_details.forEach((list) => {
            if (list.id == chat.user_id) {
              this.contactData = list;
              return;
            }
          });
        } else {
          this.contactData = this.chatDataDetail[this.currectChatWindowID].user_details;
          return;
        }
      }
    },

    getMessage(chat) {
      if (!isEmpty(chat)) {
        if (chat.is_unsend && !chat.is_deleted) {
          return 'this message was unsend';
        } else if (chat.is_deleted) {
          return 'this message was deleted';
        } else {
          return chat.message;
        }
      }
    },

    selectAttach() {
      document.querySelector('.add').fileAttach.click();
    },

    handleFile(evt) {
      try {
        let file = evt.target.files[0];
        let flag = true;
        if (file) {
          if (file.name.substring(file.name.lastIndexOf('.')) == '.jpg' || file.name.substring(file.name.lastIndexOf('.')) == '.png') {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
              if (this.fileAttach != "") {
                await firebaseCreateData('message_details', {
                  user_id: this.userData.id,
                  user_name: this.userData.displayName,
                  is_deleted: false,
                  is_photo: true,
                  is_poll: false,
                  is_unsend: false,
                  messages_id: this.chatData[this.currectChatWindowID].id,
                  message: reader.result,
                  created_at: Timestamp.now(),
                  updated_at: Timestamp.now(),
                });
              } else {
                return;
              }
            };
          } else {
            SendNotification('Wrong File Format', 500);
          }
        }
      } catch (error) {
        SendNotification(error.message, 500);
      }
    },

    async updateIsTyping(evt) {
      if (evt.keyCode != 8 && evt.keyCode != 17) {
        if (this.timeoutTyping != '') {
          clearTimeout(this.timeoutTyping);
          if (!this.typingUpdated) {
            if (this.chatDataDetail[this.currectChatWindowID].typing_status.length != 0) {
              this.chatDataDetail[this.currectChatWindowID].typing_status.forEach(async (list) => {
                if (list.user_id == this.userData.id) {
                  this.tempTypingData = list;
                  this.tempTypingData.is_typing = true;
                  await firebaseUpdateSingleData('message_typing_status', this.tempTypingData.id, this.tempTypingData);
                  this.typingUpdated = true;
                }
              });
            }
          }
        }
        this.timeoutTyping = setTimeout(async () => {
          if (!isEmpty(this.tempTypingData)) {
            this.tempTypingData.is_typing = false;
            await firebaseUpdateSingleData('message_typing_status', this.tempTypingData.id, this.tempTypingData);
            this.tempTypingData = {};
            this.typingUpdated = false;
          }
        }, 500);
      }
    },

    async sendMessage(e) {
      e.preventDefault();
      try {
        if (document.querySelector(".add").message.value != "") {
          await firebaseCreateData('message_details', {
            user_id: this.userData.id,
            user_name: this.userData.displayName,
            is_deleted: false,
            is_photo: false,
            is_poll: false,
            is_unsend: false,
            is_read: false,
            messages_id: this.chatData[this.currectChatWindowID].id,
            message: document.querySelector(".add").message.value,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now(),
          });
          document.querySelector(".add").message.value = "";
        } else {
          return;
        }
      } catch (error) {
        SendNotification(error.message, 500);
      }
    },

    scrollNewMessage() {
      nextTick(() => {
        let chatContent = document.querySelectorAll(".chat-content");
        chatContent[chatContent.length - 1].scrollIntoView({
          behavior: "smooth",
        });
      });
    },

    async updateMessage() {
      await firebaseUpdateSingleData(
        "messages",
        document.querySelector(".update").id.value,
        {
          user_id: 1,
          message: document.querySelector(".update").message.value,
          createdAt: serverTimestamp(),
        }
      );
    },

    async deleteMessage() {
      await firebaseDeleteData(
        "messages",
        document.querySelector(".delete").id.value
      );
    },

    rightClickMessage(evt, chat, idx) {
      if (this.checkMessage(chat.user_id)) {
        if (evt.which == 3 && !this.showDarkWindow) {
          evt.preventDefault();
          this.rightClickData.data = chat;
          this.rightClickData.idx = idx;
          this.showDarkWindow = true;
          document.querySelector('.right-click-message').style.top = (evt.clientY + 10) + 'px';
          document.querySelector('.right-click-message').style.left = evt.clientX + 'px';
        }
      } else return;
    },

    startAudioNotification() {
      const audio = new Audio(notificationSound);
      audio.play();
    },

    resetChatWindow() {
      this.currectChatWindowID = -1;
    },

    async logout() {
      try {
        await firebaseSignOut();
        SendNotification('Successfully Logout', 200);
        this.$router.push('login');
      } catch (error) {
        SendNotification(error.message, 500);
      }
    }
  },
  mounted() {
    document.getElementById('loadingbtn').click();

    this.userData = JSON.parse(localStorage.getItem('userData'));
    firebaseGetSingleData('users', this.userData.uid, this.userData, true);

    watch(this.userData, async () => {
      if (!this.isAlreadyRequestUserData) {
        await firebaseGetDataByWhere('messages', 'users', 'array-contains', this.userData.id, this.chatData, true);
        this.isAlreadyRequestUserData = true;
      } else return;
    });

    watch(this.chatData, async () => {
      try {
        if (this.chatData.length == 1 && isEmpty(this.chatData[0]) && !this.isFinishRequest) {
          this.chatData.length = 0;
          this.totalChat = 0;
          document.getElementById('loadingbtn').click();
          this.isFinishRequest = true;
          return;
        }

        if (!isEmpty(this.chatData) && !this.isFinishRequest) {
          let flag = true;
          this.chatData.forEach(async (list, idx) => {
            if (!list.isAlreadyRequest) {
              this.chatDataDetail[idx] = {};
              this.chatDataDetail[idx].id = list.id;
              this.chatDataDetail[idx].user_details = (list.is_group) ? [] : {};
              this.chatDataDetail[idx].typing_status = [];
              list.users.forEach(async (user, idx2) => {
                if (user != this.userData.id) {
                  if (list.is_group) {
                    this.chatDataDetail[idx].user_details[idx2] = {};
                    await firebaseGetSingleData('users', user, this.chatDataDetail[idx].user_details[idx2], true);
                  } else {
                    await firebaseGetSingleData('users', user, this.chatDataDetail[idx].user_details, true);
                  }
                }
              });
              this.chatDataDetail[idx].message_details = [];
              await firebaseGetDataByWhere('message_details', 'messages_id', '==', list.id, this.chatDataDetail[idx].message_details, true);
              await firebaseGetDataByWhere('message_typing_status', 'messages_id', '==', list.id, this.chatDataDetail[idx].typing_status, true);
              list.isAlreadyRequest = true;
            } else {
              if (this.chatDataDetail[idx].message_details.length == 0) {
                flag = false;
              }
              if (list.is_group) {
                this.chatDataDetail[idx].user_details.forEach((data) => {
                  if (isEmpty(data)) flag = false;
                });
              } else {
                if (this.chatDataDetail[idx].user_details.length == 0) flag = false;
              }
            }
          });
          if (flag) {
            this.totalChat = this.chatData.length;
            document.getElementById('loadingbtn').click();
            this.isFinishRequest = true;
          }
        }

        if (this.isFinishRequest) {
          if (this.totalChat < this.chatData.length) {
            this.chatDataDetail[this.chatData.length - 1] = {};
            this.chatDataDetail[this.chatData.length - 1].id = this.chatData[this.chatData.length - 1].id;
            this.chatDataDetail[this.chatData.length - 1].user_details = (this.chatData[this.chatData.length - 1].is_group) ? [] : {};
            this.chatDataDetail[this.chatData.length - 1].typing_status = [];
            this.chatData[this.chatData.length - 1].users.forEach(async (user, idx2) => {
              if (this.chatData[this.chatData.length - 1].is_group) {
                this.chatDataDetail[this.chatData.length - 1].user_details[idx2] = {};
                await firebaseGetSingleData('users', user, this.chatDataDetail[this.chatData.length - 1].user_details[idx2], true);
              } else {
                await firebaseGetSingleData('users', user, this.chatDataDetail[this.chatData.length - 1].user_details, true);
              }
            });
            this.chatDataDetail[this.chatData.length - 1].message_details = [];
            await firebaseGetDataByWhere('message_details', 'messages_id', '==', this.chatData[this.chatData.length - 1].id, this.chatDataDetail[this.chatData.length - 1].message_details, true);
            await firebaseGetDataByWhere('message_typing_status', 'messages_id', '==', this.chatData[this.chatData.length - 1].id, this.chatDataDetail[this.chatData.length - 1].typing_status, true);
            this.totalChat = this.chatData.length;
          } else if (this.totalChat > this.chatData.length) {
            let flag = false;
            this.chatDataDetail.forEach((list_details, idx) => {
              if (!isEmpty(this.chatData[idx])) {
                if (list_details.id != this.chatData[idx].id) {
                  this.chatDataDetail.splice(idx, 1);
                  flag = true;
                  this.totalChat = this.chatData.length;
                  return;
                }
              }
            });
            if (!flag) {
              this.chatDataDetail.splice(this.chatDataDetail.length - 1, 1);
              this.totalChat = this.chatData.length;
            }
          } else {
            return;
          }
        }
      } catch (error) {
        SendNotification(error.message, 500);
      }
    });
  }
};
</script>

<template>
  <Loading v-if="!isFinishRequest" />
  <div v-if="isFinishRequest" class="d-flex h-100 position-relative">
    <!-- Left Menu -->
    <Profile :userData="userData" />
    <AddContact :userData="userData" :chatData="chatData" />
    <CreateGroup v-if="isFinishRequest" :userData="userData" :chatDataDetail="chatDataDetail" />
    <!-- Right Click Menu -->
    <UnsendMessage :rightClickData="rightClickData" />
    <DeleteMessage :rightClickData="rightClickData" />
    <CreatePoll :chatData="currectChatWindowID != -1 ? chatData[currectChatWindowID] : {}" :userData="userData" />
    <GroupInfo :chatData="chatData[currectChatWindowID] ? chatData[currectChatWindowID] : {}"
      :chatDataDetail="chatDataDetail[currectChatWindowID] ? chatDataDetail[currectChatWindowID] : {}"
      :userData="userData" />
    <GroupLeave @resetChatWindow="resetChatWindow()"
      :chatData="chatData[currectChatWindowID] ? chatData[currectChatWindowID] : {}" :userData="userData" />
    <div class="dropdown right-click-message" style="width: fit-content;">
      <span data-bs-toggle="dropdown" aria-expanded="false"></span>
      <ul class="dropdown-menu right-click-message-dropdown" :class="{ 'show': !isEmpty(rightClickData) }">
        <li><a class="dropdown-item edit-msg" href="#">Edit Message</a>
        </li>
        <li v-if="!isEmpty(rightClickData) && !rightClickData.data.is_unsend"><a class="dropdown-item unsend-msg" href="#"
            data-bs-toggle="modal" data-bs-target="#unsendMessageModal">Unsend
            Message</a>
        </li>
        <li v-if="!isEmpty(rightClickData) && !rightClickData.data.is_deleted"><a class="dropdown-item delete-msg"
            href="#" data-bs-toggle="modal" data-bs-target="#deleteMessageModal">Delete Message</a>
        </li>
      </ul>
    </div>
    <div class="left-content col-lg-3 col-5 bg-secondary-color shadow">
      <div class="d-flex flex-column align-items-center mt-4 position-relative">
        <div class="dropdown position-absolute" style="top: 5px; left: 20px;" :class="{ 'opacity-0': !showSideBar }">
          <i class="bi bi-three-dots-vertical cursor-pointer fs-5" data-bs-toggle="dropdown" aria-expanded="false"></i>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#profileModal">Profile</a>
            </li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#addContactModal">Add
                Contact</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#createGroupModal">Create
                Group</a>
            </li>
            <li><a class="dropdown-item" href="#" @click="logout()">Logout</a>
            </li>
          </ul>
        </div>
        <h3 class="text-left mb-3 text-white fw-bold left-title" :class="{ 'opacity-0': !showSideBar }">Chats</h3>
        <i class="bi bi-arrow-right-short cursor-pointer fs-3 position-absolute btn-sidebar"
          style="right: 20px; top: -1px;" @click="toggleSidebar()"></i>
        <form class="col-12 d-flex justify-content-center searchMsg">
          <input type="text" placeholder="Search"
            class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search" name="searchMsg"
            :class="{ 'opacity-0': !showSideBar }" v-model="searchChatKeyword">
        </form>
      </div>
      <div class="d-flex flex-column mt-4">
        <div v-for="(chat, index) in chatDataDetail" class="d-flex align-items-center chat-list cursor-pointer"
          :class="{ 'chat-list-hide': !showSideBar, 'bg-primary-color shadow': currectChatWindowID == index, 'd-none': checkSearchKeyword(chat, index) }"
          @click="selectWindowChat(index)">
          <div class="d-flex align-items-center gap-2 chat-wrapper px-2 mx-1 py-2"
            :class="{ 'chat-wrapper-hide': !showSideBar }">
            <img :src="getChatListPicture(chat, index)" class="circle mt-1 h-50px w-50px" />
            <div class="d-grid chat-name-msg" :class="{ 'opacity-0': !showSideBar }">
              <span class="fw-bold text-white" :class="{ 'color-grey': currectChatWindowID == index }"
                style="font-size: 18px;">{{ getChatListName(chat, index) }}</span>
              <span style="font-size: 14px;" class="d-flex align-items-center text-white"
                :class="{ 'color-grey': currectChatWindowID == index }">
                <img src="https://img.icons8.com/fluency/48/null/image.png"
                  v-if="!isEmpty(chat) && chat.message_details && chat.message_details[chat.message_details.length - 1] && chat.message_details[chat.message_details.length - 1].is_photo"
                  width="20" class="me-2" />{{
                    getChatListLastMessage(chat, index)
                  }}
              </span>
            </div>
            <span v-if="!isEmpty(chat) && !isEmpty(chat.message_details) && getChatNotification(chat)"
              class="rounded-circle p-2 bg-warning text-white d-flex align-items-center justify-content-center mt-1 shadow"
              style="height: 25px; width: 25px;">{{ getChatNotification(chat, false) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="right-content bg-primary-color">
      <div class="dark-chat-window cursor-pointer" :class="{ 'dark-chat-window-active': showSideBar || showDarkWindow }"
        @click="toggleSidebar()">
      </div>
      <div class="bg-primary-color shadow contact-info-sidebar d-flex flex-column"
        :class="{ 'contact-info-sidebar-show': showContactInfo }">
        <div class="info-header d-grid justify-content-center" style="margin-top: 70px;">
          <img
            :src="!isEmpty(contactData) && contactData.picture ? contactData.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
            class="circle cursor-pointer" width="100" height="100" />
          <h5 class="mt-3 text-center">{{ !isEmpty(contactData) ? contactData.displayName : '-' }}</h5>
        </div>

        <div class="info-body mt-2 d-grid gap-2 py-3 px-4">
          <span><i class="me-2 bi bi-envelope-at-fill"></i> {{ !isEmpty(contactData) ? contactData.email : '-' }}</span>
          <span><i class="me-2 bi bi-telephone-fill"></i> {{ !isEmpty(contactData) && contactData.phone ?
            contactData.phone : '-' }}</span>
          <span><i class="me-2 bi bi-calendar-fill"></i> {{ !isEmpty(contactData) && contactData.dateOfBirth ?
            contactData.dateOfBirth : '-' }}</span>
          <span><i class="me-2 bi bi-gender-ambiguous"></i> {{ !isEmpty(contactData) && contactData.gender ?
            contactData.gender : "-" }}</span>
        </div>
      </div>
      <div v-if="currectChatWindowID == -1" style="height: 100vh;"
        class="d-flex justify-content-center align-items-center">
        <div class="d-flex flex-column justify-content-center">
          <h6 class="color-grey">Select message to start chatting.</h6>
        </div>
      </div>
      <div class="px-2 shadow group-window-header d-flex align-items-center position-relative">
        <div class="d-flex gap-3">
          <img :src="getChatListPicture(chatDataDetail[currectChatWindowID], currectChatWindowID)"
            class="w-50px h-50px circle" alt="">
          <div class="d-grid">
            <span class="">{{ getChatListName(chatDataDetail[currectChatWindowID], currectChatWindowID) }}</span>
            <span
              v-if="!isEmpty(chatData[currectChatWindowID]) && !isEmpty(chatDataDetail[currectChatWindowID]) && chatData[currectChatWindowID].is_group"
              class="color-grey">{{
                getChatGroupMemberHeader(chatDataDetail[currectChatWindowID].user_details)
              }}</span>
            <span v-else class="color-grey">{{ getChatListLastMessage(chatDataDetail[currectChatWindowID],
              currectChatWindowID, true) }}</span>
          </div>
          <div class="dropdown position-absolute translate-middle top-50 end-0 z-index-1">
            <i class="bi bi-three-dots-vertical cursor-pointer fs-5" data-bs-toggle="dropdown" aria-expanded="false"></i>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#groupInfoModal">Info</a>
              </li>
              <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#addContactModal">Invite</a>
              </li>
              <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#groupLeaveModal">Leave</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="currectChatWindowID != -1 && !isEmpty(chatDataDetail[currectChatWindowID])"
        class="d-flex flex-column position-relative py-3 overflow-y-auto h-85">
        <div v-for="(chat, idxChat) in chatDataDetail[currectChatWindowID].message_details" v-bind:key="chat.id"
          class="mt-2 d-grid col-12 chat-content py-1 px-2" :class="{
            'justify-content-end': checkMessage(chat.user_id),
          }">
          <div class="d-flex align-items-end">
            <div v-if="!checkMessage(chat.user_id)" class="d-flex align-items-start h-100">
              <img :src="getChatGroupMemberPicture(chatDataDetail[currectChatWindowID], chat)" width="50"
                class="circle mt-1 me-2 cursor-pointer" @click="openContactInfo(chat, idxChat)" />
            </div>
            <span v-if="checkMessage(chat.user_id)" style="font-size: 12px" class="me-2">{{
              dateConvert(chat.created_at)
            }}</span>
            <div class="d-flex flex-column"
              :class="{ 'z-index-3': (!isEmpty(rightClickData) && idxChat == rightClickData.idx) }"
              @mousedown="rightClickMessage($event, chat, idxChat)" oncontextmenu="return false;">
              <span class="p-1" v-if="!checkMessage(chat.user_id)">{{ chat.user_name }}</span>
              <img v-if="!chat.is_unsend && chat.is_photo && !chat.is_poll" :src="chat.message" alt="" width="120"
                class="shadow cursor-pointer rounded">
              <span v-else-if="(chat.is_unsend || !chat.is_photo) && !chat.is_poll" class="py-2 rounded px-3 shadow"
                :class="{
                  'text-primary-color text-white cursor-pointer': checkMessage(chat.user_id),
                  'bg-light': !checkMessage(chat.user_id),
                  'fst-italic': (chat.is_unsend || chat.is_deleted)
                }" style="width: fit-content; margin: 0 !important">
                {{ getMessage(chat) }}
              </span>
              <span v-if="chat.is_poll" class="py-2 rounded px-3 shadow" :class="{
                'text-primary-color text-white': checkMessage(chat.user_id),
                'bg-light': !checkMessage(chat.user_id),
              }">
                <div class="d-grid">
                  <h5 class="fw-bold">Poll :</h5>
                  <h6>{{ chat.poll_title }}</h6>
                  <div v-for="(option, idx) in chat.option_data" class="d-grid mb-2">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <input type="radio" name="vote" class="form-check-input">
                      <span>{{ idx + 1 }}. {{ option.name }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <div style="width: 200px; height: 10px;" class="bg-light rounded position-relative">
                        <div class="position-absolute bg-warning col-3 rounded" style="height: 10px;"></div>
                      </div>
                      <span>92%</span>
                    </div>
                  </div>
                </div>
              </span>
            </div>
            <span v-if="!checkMessage(chat.user_id)" style="font-size: 12px" class="ms-2">{{
              dateConvert(chat.created_at)
            }}</span>
          </div>
        </div>
      </div>
      <form v-if="currectChatWindowID != -1 && !isEmpty(chatData[currectChatWindowID])" class="add"
        @submit.prevent="sendMessage($event)" style="height: 5vh;">
        <div class="d-flex">
          <div class="dropdown bg-light d-flex justify-content-center align-items-center px-3 cursor-pointer"
            data-bs-toggle="dropdown">
            <font-awesome-icon icon="fa-solid fa-plus" />
            <ul class="dropdown-menu right-click-message-dropdown">
              <li><a href="#" class="dropdown-item d-flex align-items-center gap-2" @click="selectAttach()">
                  <font-awesome-icon icon="fa-solid fa-paperclip" />
                  Attach Image
                </a></li>
              <li v-if="chatData[currectChatWindowID].is_group"><a href="#"
                  class="dropdown-item d-flex align-items-center gap-2" data-bs-toggle="modal"
                  data-bs-target="#createPollModal">
                  <font-awesome-icon icon="fa-solid fa-square-poll-vertical" />
                  Create Poll
                </a></li>
            </ul>
          </div>
          <input type="file" class="d-none" name="fileAttach" @change="handleFile($event, idx)">
          <input type="text" name="message" class="px-2 input-msg border-0" placeholder="Message"
            @keyup="updateIsTyping($event)" />
          <button type="submit" class="btn text-primary-color rounded-0" style="width: 50px;">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABLUlEQVR4nO3UQSsEUQDA8ZH24KCUcrA+gHKRL7GOLs7cuDktSYm7/RTrC0hOm5OLiwuOFIWbKESxfpo8NdbM7Kzdi/K/zevN/9+89+ZF0T8BTKKGC+xFvQBlVHHsO5fdSAcwi128SmerU2k/KqjjMUX4jpfE82RR8QQ2wrpm8YydEIk5bScdxRKOcqRfXGMBT4mxapZ4Gg00FeMQU7hKjMXvlrMCd4pTx1CIJGnkLc16AXETK+gLkVbm2q3/Zo78ATNhXhxpJd6HwdxATuQ8PlGJvXpLmbPdVp4ROcBIGB/HfcYXVgoHgmweqyiF52GcZchv4p+xo0BLrIT9nP2p/VoegzX5FLsassBijvykK3mBI7wc9Qo/I/GPN9azQEok+2roBp/Xym3HZ/9P8gH1+UY/SOoF3AAAAABJRU5ErkJggg=="
              width="20">
          </button>
        </div>
      </form>
    </div>
  </div>
</template>