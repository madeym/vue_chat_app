<script setup>
import AddContact from './_partials/_modals/AddContact.vue';
import Profile from './_partials/_modals/Profile.vue';
</script>
<script>
import {
  firebaseGetData,
  firebaseCreateData,
  firebaseDeleteData,
  firebaseUpdateSingleData,
} from "@/firebase";
import { serverTimestamp, Timestamp } from "@firebase/firestore";
import { nextTick, watch } from "@vue/runtime-core";
import { firebaseGetSingleData } from '../../firebase';

export default {
  data() {
    return {
      userID: "",
      userData: {},
      chatData: [],
      currectChatWindowID: -1,
      showSideBar: true,
      fileAttach: '',
    };
  },
  methods: {
    selectWindowChat(window_id) {
      this.currectChatWindowID = window_id;
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
          this.fileAttach = reader.result;
          if (this.fileAttach != "") {
            await firebaseCreateData("messages", {
              message: this.fileAttach,
              createdAt: serverTimestamp(),
              isFile: 1,
            });
            this.fileAttach = '';
          } else {
            return;
          }
        };
      }
    },

    toggleSidebar() {
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
      return uidChat === this.userID ? true : false;
    },

    getMessage() {
      try {
        firebaseGetData("messages", this.chatData);
        this.userData.contacts.forEach(async (contact, idx) => {
          this.userData.contacts[idx].userData = {};
          this.userData.contacts[idx].messageData = {};
          await firebaseGetSingleData('users', contact.user_id, this.userData.contacts[idx].userData, true);
          await firebaseGetSingleData('messages', contact.messages_id, this.userData.contacts[idx].messageData, true);
        });
      } catch (error) {
        console.log(error.emssage);
      }
    },

    scrollMsg() {
      watch(this.chatData, () => {
        this.scrollNewMessage();
      });
    },

    async sendMessage(e) {
      e.preventDefault();
      if (document.querySelector(".add").message.value != "") {
        this.userData.contacts[this.currectChatWindowID].messageData.data.push({
          user_id: this.userData.id,
          user_name: this.userData.displayName,
          is_file: false,
          message: document.querySelector(".add").message.value,
          created_at: Timestamp.now(),
        });
        await firebaseUpdateSingleData("messages", this.userData.contacts[this.currectChatWindowID].messages_id, this.userData.contacts[this.currectChatWindowID].messageData);
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
  },
  beforeMount() {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    this.userID = this.userData.id;
    this.getMessage();
  },
};
</script>

<template>
  <div class="d-flex" style="height: 100vh">
    <AddContact :userData="userData" />
    <Profile :userData="userData" />
    <div class="left-content col-3" style="background-color: #F2BEFC; height: 100vh;">
      <div class="d-flex flex-column align-items-center mt-4 position-relative">
        <div class="dropdown position-absolute" style="top: 5px; left: 20px;">
          <img src="https://img.icons8.com/fluency/48/null/menu-rounded.png" width="30" class="cursor-pointer"
            data-bs-toggle="dropdown" aria-expanded="false" />
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#addContactModal">Add
                Contact</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#profileModal">Profile</a>
            </li>
          </ul>
        </div>
        <h3 class="text-left mb-3 text-white fw-bold left-title" :class="{ 'opacity-0': !showSideBar }">Chats</h3>
        <img src="https://img.icons8.com/fluency/48/null/left.png" width="30"
          class="position-absolute btn-sidebar cursor-pointer" style="right: 20px; top: 5px;"
          @click="toggleSidebar()" />
        <form class="col-12 d-flex justify-content-center searchMsg">
          <input type="text" placeholder="Search"
            class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search" name="searchMsg"
            :class="{ 'opacity-0': !showSideBar }">
        </form>
      </div>
      <div class="d-flex flex-column mt-4">
        <div v-for="(contact, index) in userData.contacts" v
          class="d-flex align-items-center px-3 py-2 gap-2 chat-list cursor-pointer"
          :class="{ 'chat-list-hide': !showSideBar, 'active-window': currectChatWindowID == index }"
          @click="selectWindowChat(index)">
          <img src="https://img.icons8.com/fluency/48/null/test-account.png" class="rounded-circle mt-1" />
          <div class="d-grid justify-content-center" :class="{ 'd-none': !showSideBar }">
            <span class="font-bold" style="font-size: 18px;">{{ contact.userData.displayName }}</span>
            <span style="font-size: 14px; color: grey;">Lorem ipsum dolor sit amet.</span>
          </div>
        </div>
      </div>
    </div>
    <div class="right-content col-9" :class="{ 'expand-right-content': !showSideBar }"
      style="height: 100vh; background-color: #CA9CE1; ">
      <div v-if="currectChatWindowID == -1" style="height: 100vh;"
        class="d-flex justify-content-center align-items-center">
        <div class="d-flex flex-column justify-content-center">
          <h6 class="color-grey">Select message to start chatting.</h6>
        </div>
      </div>
      <div v-if="currectChatWindowID != -1" style="height: 95vh; overflow-y: auto"
        class="py-4 px-2 d-flex flex-column chat-wrapper">
        <div v-for="chat in userData.contacts[currectChatWindowID].messageData.data" v-bind:key="chat.id"
          class="mt-3 d-grid col-12 chat-content" :class="{
            'justify-content-end': checkMessage(chat.user_id),
          }">
          <span class="p-1" v-if="!checkMessage(chat.user_id)">{{ chat.user_name }}</span>
          <div class="d-flex align-items-end">
            <span v-if="checkMessage(chat.user_id)" style="font-size: 12px" class="me-2">{{
              dateConvert(chat.created_at)
            }}</span>
            <img v-if="chat.isFile" :src="chat.message" alt="" width="120" class="shadow cursor-pointer">
            <span v-if="!chat.isFile" class="py-2 text-white rounded px-3 shadow" :class="{
              'bg-primary': checkMessage(chat.user_id),
              'bg-warning': !checkMessage(chat.user_id),
            }" style="width: fit-content; margin: 0 !important">
              {{ chat.message }}
            </span>
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
          <button type="submit" class="btn btn-primary rounded-0" style="width: 5%;">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABLUlEQVR4nO3UQSsEUQDA8ZH24KCUcrA+gHKRL7GOLs7cuDktSYm7/RTrC0hOm5OLiwuOFIWbKESxfpo8NdbM7Kzdi/K/zevN/9+89+ZF0T8BTKKGC+xFvQBlVHHsO5fdSAcwi128SmerU2k/KqjjMUX4jpfE82RR8QQ2wrpm8YydEIk5bScdxRKOcqRfXGMBT4mxapZ4Gg00FeMQU7hKjMXvlrMCd4pTx1CIJGnkLc16AXETK+gLkVbm2q3/Zo78ATNhXhxpJd6HwdxATuQ8PlGJvXpLmbPdVp4ROcBIGB/HfcYXVgoHgmweqyiF52GcZchv4p+xo0BLrIT9nP2p/VoegzX5FLsassBijvykK3mBI7wc9Qo/I/GPN9azQEok+2roBp/Xym3HZ/9P8gH1+UY/SOoF3AAAAABJRU5ErkJggg=="
              width="20">
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
.left-title {
  opacity: 1;
  transition: all 0.5s ease-in-out;
}

.left-search {
  opacity: 1;
  transition: all 0.5s ease-in-out;
}

.chat-list {
  transition: all 0.5s ease-in-out;
}

.chat-list-hide {
  padding-left: 0 !important;
  padding-right: 0 !important;
  justify-content: center !important;
}

.left-content {
  transition: all 0.5s ease-in-out;
}

.hide-left-content {
  width: 5% !important;
}

.right-content {
  transition: all 0.5s ease-in-out;
}

.expand-right-content {
  width: 95% !important;
}

.btn-sidebar {
  rotate: 0deg;
  transition: all 0.5s ease-in-out;
}

.hide-sidebar {
  right: 50% !important;
  transform: translate(-50%);
  rotate: 180deg;
}

.input-msg {
  outline: none;
  border: none;
  width: 95%;
}

.input-msg:focus {
  outline: none;
}

.input-msg:active {
  border: none;
}
</style>