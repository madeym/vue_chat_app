<script setup>
import Loading from './_partials/_modals/Loading.vue';
import AddContact from './_partials/_modals/AddContact.vue';
import Profile from './_partials/_modals/Profile.vue';
import CreateGroup from './_partials/_modals/CreateGroup.vue';
import UnsendMessage from './_partials/_modals/UnsendMessage.vue';
import CreatePoll from './_partials/_modals/CreatePoll.vue';
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
      isAlreadyRequestUserData: false,
      isFinishRequest: false,
      currectChatWindowID: -1,
      showSideBar: true,
      showDarkWindow: false,
      rightClickData: {},
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
      }
    },

    getChatListPicture(chat) {
      let img = 'https://img.icons8.com/fluency/48/null/test-account.png';
      if (!isEmpty(chat)) {
        if (chat.is_group) {

        } else {
          if (!isEmpty(chat.user_details)) {
            return (chat.user_details.picture) ? chat.user_details.picture : img;
          }
        }
      }
    },

    getChatListName(chat) {
      if (!isEmpty(chat)) {
        if (chat.is_group && !isEmpty(chat.group_data)) {
          return chat.group_data.name;
        } else if (!chat.is_group && !isEmpty(chat.user_details)) {
          return chat.user_details.displayName;
        }
      }
    },

    getChatListLastMessage(chat) {
      let lastMsg = '';
      if (!isEmpty(chat)) {
        if (chat.message_details && chat.message_details.length != 0) {
          if (chat.is_group) {
            lastMsg = chat.message_details[chat.message_details.length - 1].user_name + ': ';
          }
          if (chat.message_details[chat.message_details.length - 1].is_photo) {
            lastMsg = lastMsg + 'image';
          } else {
            lastMsg = lastMsg + chat.message_details[chat.message_details.length - 1].message;
          }
        }
      }
      return lastMsg.substring(0, 40);
    },

    selectWindowChat(window_id) {
      this.currectChatWindowID = window_id;
      this.toggleSidebar();
      // this.scrollNewMessage();
    },

    getChatGroupMemberHeader(member) {
      let names = '';
      try {
        if (Array.isArray(member.userData)) {
          member.userData.forEach((list, idx) => {
            if (!(idx == member.length - 1)) {
              names = names + list.displayName + ', ';
            } else {
              names = names + list.displayName;
            }
          });
        }
      } catch (error) {
        SendNotification(error.message, 500);
      }
      return names;
    },

    getChatGroupMemberPicture(chatData, chat) {
      let pic = 'https://img.icons8.com/fluency/48/null/test-account.png';
      if (!isEmpty(chatData)) {
        if (chatData.is_group) {
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

    selectAttach() {
      document.querySelector('.add').fileAttach.click();
    },

    handleFile(evt, idx) {
      try {
        let file = evt.target.files[0];
        if (file) {
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
        }
      } catch (error) {
        SendNotification(error.message, 500);
      }
    },

    dateConvert(date) {
      if (date != null && "seconds" in date) {
        let dt = new Date(date.seconds * 1000);
        let hour = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
        let minute = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
        return hour + ":" + minute;
      }
    },

    checkMessage(uidChat) {
      return uidChat === this.userData.id ? true : false;
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

    rightClickMessage(evt, chatData, idx) {
      if (this.checkMessage(chatData.message_details[idx].user_id)) {
        if (evt.which == 3 && !this.showDarkWindow) {
          evt.preventDefault();
          this.rightClickData.data = chatData;
          this.rightClickData.idx = idx;
          this.showDarkWindow = true;
          document.querySelector('.right-click-message').style.top = evt.screenY + 'px';
          document.querySelector('.right-click-message').style.left = evt.screenX + 'px';
        }
      } else return;
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
        this.isAlreadyRequestUserData = true;
        await firebaseGetDataByWhere('messages', 'users', 'array-contains', this.userData.id, this.chatData, true);
      } else return;
    });

    watch(this.chatData, async () => {
      try {
        if (!isEmpty(this.chatData) && !this.isFinishRequest) {
          let flag = true;
          this.chatData.forEach(async (list) => {
            if (!list.isAlreadyRequest) {
              list.user_details = (list.is_group) ? [] : {};
              list.users.forEach(async (user, idx) => {
                if (list.is_group) {
                  list.user_details[idx] = {};
                  await firebaseGetSingleData('users', user, list.user_details[idx], true);
                } else {
                  await firebaseGetSingleData('users', user, list.user_details, true);
                }
              });

              list.message_details = [];
              await firebaseGetDataByWhere('message_details', 'messages_id', '==', list.id, list.message_details, true);
              list.isAlreadyRequest = true;
            } else {
              if (isEmpty(list.message_details)) {
                flag = false;
              }
              if (list.is_group) {
                list.user_details.forEach((data) => {
                  if (isEmpty(data)) flag = false;
                });
              } else {
                if (isEmpty(list.user_details)) flag = false;
              }
            }
          });

          if (flag) {
            this.isFinishRequest = true;
            document.getElementById('loadingbtn').click();
          }
        } else return;
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
    <AddContact :userData="userData" />
    <Profile :userData="userData" />
    <CreateGroup :userData="userData" />
    <UnsendMessage :rightClickData="rightClickData" />
    <CreatePoll :chatData="currectChatWindowID != -1 ? chatData[currectChatWindowID] : {}" :userData="userData" />
    <div class="dropdown right-click-message" style="width: fit-content;">
      <span data-bs-toggle="dropdown" aria-expanded="false"></span>
      <ul class="dropdown-menu right-click-message-dropdown" :class="{ 'show': showDarkWindow }">
        <li><a class="dropdown-item edit-msg" href="#">Edit Message</a>
        </li>
        <li v-if="!isEmpty(rightClickData) && !rightClickData.data.message_details[rightClickData.idx].is_unsend"><a
            class="dropdown-item unsend-msg" href="#" data-bs-toggle="modal" data-bs-target="#unsendMessageModal">Unsend
            Message</a>
        </li>
        <li><a class="dropdown-item delete-msg" href="#">Delete Message</a>
        </li>
      </ul>
    </div>
    <div class="left-content col-lg-3 col-5 bg-secondary-color">
      <div class="d-flex flex-column align-items-center mt-4 position-relative">
        <div class="dropdown position-absolute" style="top: 5px; left: 20px;" :class="{ 'opacity-0': !showSideBar }">
          <img src="https://img.icons8.com/ios-filled/50/null/menu-2.png" width="20" class="cursor-pointer"
            data-bs-toggle="dropdown" aria-expanded="false" />
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
        <img src="https://img.icons8.com/sf-black/64/000000/long-arrow-right.png" width="30"
          class="position-absolute btn-sidebar cursor-pointer" style="right: 20px; top: 5px;" @click="toggleSidebar()" />
        <form class="col-12 d-flex justify-content-center searchMsg">
          <input type="text" placeholder="Search"
            class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search" name="searchMsg"
            :class="{ 'opacity-0': !showSideBar }">
        </form>
      </div>
      <div class="d-flex flex-column mt-4">
        <div v-for="(chat, index) in chatData" class="d-flex align-items-center chat-list cursor-pointer"
          :class="{ 'chat-list-hide': !showSideBar, 'active-window bg-primary-color': currectChatWindowID == index }"
          @click="selectWindowChat(index)">
          <div class="d-flex align-items-center gap-2 chat-wrapper px-2 ms-1 py-2"
            :class="{ 'chat-wrapper-hide': !showSideBar }">
            <img :src="getChatListPicture(chat)" class="circle mt-1 w-50px h-50px img" />
            <div class="d-grid justify-content-center chat-name-msg" :class="{ 'opacity-0': !showSideBar }">
              <span class="fw-bold text-white" style="font-size: 18px;">{{ getChatListName(chat) }}</span>
              <span style="font-size: 14px;" class="d-flex align-items-center text-white"><img
                  src="https://img.icons8.com/fluency/48/null/image.png"
                  v-if="chat.message_details && chat.message_details[chat.message_details.length - 1] && chat.message_details[chat.message_details.length - 1].is_photo"
                  width="20" class="me-2" />{{
                    getChatListLastMessage(chat)
                  }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-content bg-primary-color">
      <div class="dark-chat-window cursor-pointer" :class="{ 'dark-chat-window-active': showSideBar || showDarkWindow }"
        @click="toggleSidebar()">
      </div>
      <div v-if="currectChatWindowID == -1" style="height: 100vh;"
        class="d-flex justify-content-center align-items-center">
        <div class="d-flex flex-column justify-content-center">
          <h6 class="color-grey">Select message to start chatting.</h6>
        </div>
      </div>
      <div
        v-if="chatData && chatData[currectChatWindowID] && !isEmpty(chatData[currectChatWindowID]) && !isEmpty(chatData[currectChatWindowID].userData) && chatData[currectChatWindowID].is_group"
        class="px-2 py-3 shadow group-window-header">
        <div class="d-flex gap-3">
          <img :src="chatData[currectChatWindowID].group_data.picture" class="w-50px h-50px img circle" alt="">
          <div class="d-grid">
            <span class="">{{ chatData[currectChatWindowID].group_data.name }}</span>
            <span class="color-grey">{{
              getChatGroupMemberHeader(chatData[currectChatWindowID])
            }}</span>
          </div>
        </div>
      </div>
      <div v-if="currectChatWindowID != -1" class="d-flex flex-column position-relative py-3 overflow-y-auto"
        :class="{ 'h-85': chatData[currectChatWindowID].is_group, 'h-95': !chatData[currectChatWindowID].is_group }">
        <div v-for="(chat, idxChat) in chatData[currectChatWindowID].message_details" v-bind:key="chat.id"
          class="mt-2 d-grid col-12 chat-content py-1 px-2" :class="{
            'justify-content-end': checkMessage(chat.user_id),
          }">
          <div class="d-flex align-items-end">
            <div v-if="!checkMessage(chat.user_id)" class="d-flex align-items-start h-100">
              <img :src="getChatGroupMemberPicture(chatData[currectChatWindowID], chat)" width="50"
                class="circle mt-1 me-2" />
            </div>
            <span v-if="checkMessage(chat.user_id)" style="font-size: 12px" class="me-2">{{
              dateConvert(chat.created_at)
            }}</span>
            <div class="d-flex flex-column"
              :class="{ 'z-index-3': (!isEmpty(rightClickData) && idxChat == rightClickData.idx) }"
              @mousedown="rightClickMessage($event, chatData[currectChatWindowID], idxChat)"
              oncontextmenu="return false;">
              <span class="p-1" v-if="!checkMessage(chat.user_id)">{{ chat.user_name }}</span>
              <img v-if="!chat.is_unsend && chat.is_photo && !chat.is_poll" :src="chat.message" alt="" width="120"
                class="shadow cursor-pointer">
              <span v-else-if="(chat.is_unsend || !chat.is_photo) && !chat.is_poll" class="py-2 rounded px-3 shadow"
                :class="{
                  'text-primary-color text-white': checkMessage(chat.user_id),
                  'bg-light': !checkMessage(chat.user_id),
                  'fst-italic': chat.is_unsend
                }" style="width: fit-content; margin: 0 !important">
                {{ chat.is_unsend ? 'this message was unsend' : chat.message }}
              </span>
              <span v-if="chat.is_poll" class="py-2 rounded px-3 shadow" :class="{
                'text-primary-color text-white': checkMessage(chat.user_id),
                'bg-light': !checkMessage(chat.user_id),
              }">
                <div class="d-grid">
                  <h5 class="fw-bold">Poll :</h5>
                  <h6>{{ chat.poll_title }}</h6>
                  <div v-for="(option, idx) in chat.optionData" class="d-grid mb-2">
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
      <form v-if="currectChatWindowID != -1" class="add" @submit.prevent="sendMessage($event)" style="height: 5vh;">
        <div class="d-flex">
          <div class="dropdown bg-light d-flex justify-content-center align-items-center px-3 cursor-pointer"
            data-bs-toggle="dropdown">
            <font-awesome-icon icon="fa-solid fa-plus" />
            <ul class="dropdown-menu right-click-message-dropdown">
              <li><a href="#" class="dropdown-item d-flex align-items-center gap-2" @click="selectAttach()">
                  <font-awesome-icon icon="fa-solid fa-paperclip" />
                  Attach File
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
          <input type="text" name="message" class="px-2 input-msg border-0" placeholder="Message" />
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