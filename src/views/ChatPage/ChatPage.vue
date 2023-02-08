<script setup>
import Loading from './_partials/_modals/Loading.vue';
import AddContact from './_partials/_modals/AddContact.vue';
import Profile from './_partials/_modals/Profile.vue';
import CreateGroup from './_partials/_modals/CreateGroup.vue';
import './ChatPage.css';
</script>
<script>
import {
  firebaseDeleteData,
  firebaseUpdateSingleData,
} from "@/firebase";
import { serverTimestamp, Timestamp } from "@firebase/firestore";
import { nextTick, watch } from "@vue/runtime-core";
import { firebaseGetSingleData } from '../../firebase';
import { isEmpty } from "lodash";

export default {
  data() {
    return {
      userData: {},
      chatData: [],
      currectChatWindowID: -1,
      showSideBar: true,
      isLoadData: true,
      isLoadMessageDataUserData: true,
      isLoadUserData: true,
      showDarkWindow: false,
    };
  },
  methods: {
    async getMessage() {
      if (this.userData.contacts) {
        try {
          this.userData.contacts.forEach(async (contact, idx) => {
            if (contact) {
              this.chatData[idx] = {};
              this.chatData[idx].messageData = {};
              this.chatData[idx].isRequestUserData = false;
              await firebaseGetSingleData('messages', contact.messages_id, this.chatData[idx].messageData, true);
            }
          });
        } catch (error) {
          console.log(error.message);
        }
      }
    },

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
      if (chat.userData && chat.messageData) {
        if (chat.messageData.is_group == true) {
          if (chat.messageData.group_data.picture) {
            return chat.messageData.group_data.picture;
          } else {
            return 'https://img.icons8.com/fluency/48/null/test-account.png';
          }
        } else {
          if (chat.userData && chat.userData.picture) {
            return chat.userData.picture;
          } else {
            return 'https://img.icons8.com/fluency/48/null/test-account.png';
          }
        }
      }
    },

    getChatListName(chat) {
      if (chat.userData && chat.messageData) {
        if (chat.messageData.is_group == true) {
          return chat.messageData.group_data.name;
        } else {
          return chat.userData.displayName;
        }
      }
    },

    getChatListLastMessage(chat) {
      let lastMsg = '';
      if (chat && chat.userData && chat.messageData) {
        if (chat.messageData.data && chat.messageData.data.length != 0) {
          if (chat.messageData.is_group) {
            lastMsg = chat.messageData.data[chat.messageData.data.length - 1].user_name + ': ';
          }
          if (chat.messageData.data[chat.messageData.data.length - 1].is_file) {
            lastMsg = lastMsg + 'image';
          } else {
            lastMsg = lastMsg + chat.messageData.data[chat.messageData.data.length - 1].message;
          }
        }
      }
      return lastMsg.substring(0, 40);
    },

    selectWindowChat(window_id) {
      this.currectChatWindowID = window_id;
      this.toggleSidebar();
      this.scrollNewMessage();
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
        console.log(error.message);
      }
      return names;
    },

    selectAttach() {
      document.querySelector('.add').fileAttach.click();
    },

    handleFile(evt, idx) {
      let file = evt.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          if (this.fileAttach != "") {
            this.chatData[this.currectChatWindowID].messageData.data.push({
              user_id: this.userData.id,
              user_name: this.userData.displayName,
              is_file: true,
              message: reader.result,
              created_at: Timestamp.now(),
            });
            await firebaseUpdateSingleData("messages", this.userData.contacts[this.currectChatWindowID].messages_id, this.chatData[this.currectChatWindowID].messageData);
          } else {
            return;
          }
        };
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
      if (document.querySelector(".add").message.value != "") {
        this.chatData[this.currectChatWindowID].messageData.data.push({
          user_id: this.userData.id,
          user_name: this.userData.displayName,
          is_file: false,
          message: document.querySelector(".add").message.value,
          created_at: Timestamp.now(),
        });
        await firebaseUpdateSingleData("messages", this.userData.contacts[this.currectChatWindowID].messages_id, this.chatData[this.currectChatWindowID].messageData);
        document.querySelector(".add").message.value = '';
      } else {
        return;
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

    rightClickMessage(evt) {
      if (evt.which == 3) {
        evt.preventDefault();
        evt.target.classList.add('z-index-3');
        this.showDarkWindow = true;
        document.querySelector('.right-click-message').style.top = evt.screenY + 'px';
        document.querySelector('.right-click-message').style.left = evt.screenX + 'px';
      }
    }
  },
  beforeMount() {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    if (this.userData) {
      firebaseGetSingleData('users', this.userData.id, this.userData, true);
    }

    watch(this.userData, async () => {
      if (this.isLoadUserData) {
        await this.getMessage();
        this.isLoadUserData = false;
      } else return;
    });

    watch(this.chatData, async () => {
      if (this.currectChatWindowID != -1) {
        this.scrollNewMessage();
      }
      if (this.isLoadMessageDataUserData && Array.isArray(this.chatData)) {
        let flag = true;
        this.chatData.forEach(async (list, idx) => {
          if (isEmpty(list.userData) && !list.isRequestUserData) {
            flag = false;
            if (!isEmpty(list.messageData)) {
              list.isRequestUserData = true;
              if (list.messageData.is_group == true) {
                list.userData = [];
                if (list.messageData.group_data && list.messageData.group_data.member) {
                  list.messageData.group_data.member.forEach(async (list2, idx2) => {
                    list.userData[idx2] = {};
                    await firebaseGetSingleData('users', list2.user_id, list.userData[idx2], true);
                  });
                }
              } else {
                list.userData = {};
                await firebaseGetSingleData('users', this.userData.contacts[idx].user_id, list.userData, true);
              }
            }
          }
        });
        if (flag) {
          document.querySelector('.loading-btn').click();
          this.isLoadMessageDataUserData = false;
        }
      } else return;
    });
  },
  mounted() {
    document.querySelector('.loading-btn').click();
  }
};
</script>

<template>
  <Loading />
  <div v-if="!isLoadMessageDataUserData" class="d-flex h-100 position-relative">
    <AddContact :userData="userData" />
    <Profile :userData="userData" />
    <CreateGroup :userData="userData" />
    <div class="dropdown right-click-message" style="width: fit-content;">
      <span data-bs-toggle="dropdown" class="right-click-message-btn" aria-expanded="false"></span>
      <ul class="dropdown-menu right-click-message-dropdown" :class="{ 'show': showDarkWindow }">
        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="">Edit Message</a>
        </li>
        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="">Unsend Message</a>
        </li>
      </ul>
    </div>
    <div class="left-content col-3 bg-secondary-color">
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
          </ul>
        </div>
        <h3 class="text-left mb-3 text-white fw-bold left-title" :class="{ 'opacity-0': !showSideBar }">Chats</h3>
        <img src="https://img.icons8.com/sf-black/64/000000/long-arrow-right.png" width="30"
          class="position-absolute btn-sidebar cursor-pointer" style="right: 20px; top: 5px;"
          @click="toggleSidebar()" />
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
                  v-if="chat.messageData.data && chat.messageData.data.length != 0 && chat.messageData.data[chat.messageData.data.length - 1].is_file"
                  width="20" class="me-2" />{{
                    getChatListLastMessage(chat)
                  }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-content col-9 bg-primary-color">
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
        v-if="chatData && chatData[currectChatWindowID] && !isEmpty(chatData[currectChatWindowID].messageData) && !isEmpty(chatData[currectChatWindowID].userData) && chatData[currectChatWindowID].messageData.is_group"
        class="px-2 py-3 shadow group-window-header">
        <div class="d-flex gap-3">
          <img :src="chatData[currectChatWindowID].messageData.group_data.picture" class="w-50px h-50px img circle"
            alt="">
          <div class="d-grid">
            <span class="">{{ chatData[currectChatWindowID].messageData.group_data.name }}</span>
            <span class="color-grey">{{
              getChatGroupMemberHeader(chatData[currectChatWindowID])
            }}</span>
          </div>
        </div>
      </div>
      <div v-if="currectChatWindowID != -1" style="overflow-y: auto" class="d-flex flex-column position-relative"
        :class="{ 'h-85': chatData[currectChatWindowID].messageData.is_group, 'h-95': !chatData[currectChatWindowID].messageData.is_group }">
        <div v-for="chat in chatData[currectChatWindowID].messageData.data" v-bind:key="chat.id"
          class="mt-3 d-grid col-12 chat-content py-1 px-2" :class="{
            'justify-content-end': checkMessage(chat.user_id),
          }">
          <div class="d-flex align-items-end">
            <div v-if="!checkMessage(chat.user_id)" class="d-flex align-items-start h-100">
              <img
                :src="chatData[currectChatWindowID].userData.picture ? chatData[currectChatWindowID].userData.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                width="50" class="circle mt-1 me-2" />
            </div>
            <span v-if="checkMessage(chat.user_id)" style="font-size: 12px" class="me-2">{{
              dateConvert(chat.created_at)
            }}</span>
            <div class="d-flex flex-column" @mousedown="rightClickMessage($event)" oncontextmenu="return false;">
              <span class="p-1" v-if="!checkMessage(chat.user_id)">{{ chat.user_name }}</span>
              <img v-if="chat.is_file" :src="chat.message" alt="" width="120" class="shadow cursor-pointer">
              <span v-if="!chat.is_file" class="py-2 rounded px-3 shadow" :class="{
                'text-primary-color text-white': checkMessage(chat.user_id),
                'bg-light': !checkMessage(chat.user_id),
              }" style="width: fit-content; margin: 0 !important">
                {{ chat.message }}
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
          <div class="bg-light d-flex justify-content-center align-items-center px-2 cursor-pointer">
            <img src="https://img.icons8.com/fluency/48/null/attach.png" width="20" @click="selectAttach()" />
          </div>
          <input type="file" class="d-none" name="fileAttach" @change="handleFile($event, idx)">
          <input type="text" name="message" class="px-2 input-msg border-0" style="width: 95%;" placeholder="Message" />
          <button type="submit" class="btn text-primary-color rounded-0" style="width: 5%;">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABLUlEQVR4nO3UQSsEUQDA8ZH24KCUcrA+gHKRL7GOLs7cuDktSYm7/RTrC0hOm5OLiwuOFIWbKESxfpo8NdbM7Kzdi/K/zevN/9+89+ZF0T8BTKKGC+xFvQBlVHHsO5fdSAcwi128SmerU2k/KqjjMUX4jpfE82RR8QQ2wrpm8YydEIk5bScdxRKOcqRfXGMBT4mxapZ4Gg00FeMQU7hKjMXvlrMCd4pTx1CIJGnkLc16AXETK+gLkVbm2q3/Zo78ATNhXhxpJd6HwdxATuQ8PlGJvXpLmbPdVp4ROcBIGB/HfcYXVgoHgmweqyiF52GcZchv4p+xo0BLrIT9nP2p/VoegzX5FLsassBijvykK3mBI7wc9Qo/I/GPN9azQEok+2roBp/Xym3HZ/9P8gH1+UY/SOoF3AAAAABJRU5ErkJggg=="
              width="20">
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
