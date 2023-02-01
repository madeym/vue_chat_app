<template>
  <!-- <form class="update" @submit.prevent="updateMessage">
    <label for="id">ID</label>
    <input type="text" name="id" />
    <label for="message">Message</label>
    <input type="text" name="message" />
    <button type="submit">Update</button>
  </form>

  <form class="delete" @submit.prevent="deleteMessage">
    <label for="id">ID</label>
    <input type="text" name="id" />
    <button type="submit">Delete</button>
  </form> -->

  <div class="container d-flex flex-column mx-auto col-4" style="height: 100vh">
    <div
      style="height: 95vh; background-color: #2596be; overflow-y: auto"
      class="py-4 px-2 d-flex flex-column chat-wrapper"
    >
      <div
        v-for="chat in chatData"
        v-bind:key="chat.id"
        class="mt-3 d-grid col-12 chat-content"
        :class="{
          'justify-content-end': checkMessage(chat.user_id),
        }"
      >
        <span class="p-1" v-if="!checkMessage(chat.user_id)">{{
          chat.user_name
        }}</span>
        <div class="d-flex align-items-end">
          <span
            v-if="checkMessage(chat.user_id)"
            style="font-size: 12px"
            class="me-2"
            >{{ dateConvert(chat.createdAt) }}</span
          >
          <span
            class="py-2 text-white rounded px-3"
            :class="{
              'bg-primary': checkMessage(chat.user_id),
              'bg-warning': !checkMessage(chat.user_id),
            }"
            style="width: fit-content; margin: 0 !important"
          >
            {{ chat.message }}
          </span>
          <span
            v-if="!checkMessage(chat.user_id)"
            style="font-size: 12px"
            class="ms-2"
            >{{ dateConvert(chat.createdAt) }}</span
          >
        </div>
      </div>
    </div>
    <form class="add" @submit.prevent="sendMessage">
      <div class="d-flex">
        <input
          type="text"
          name="message"
          class="px-2 input-msg"
          placeholder="Message"
        />
        <button type="submit" class="btn btn-primary">Send</button>
      </div>
    </form>
  </div>
</template>

<script>
import {
  firebaseGetData,
  firebaseCreateData,
  firebaseDeleteData,
  firebaseUpdateSingleData,
} from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "@firebase/firestore";
import { nextTick } from "@vue/runtime-core";

export default {
  data() {
    return {
      chatData: [],
      userID: "",
    };
  },
  methods: {
    dateConvert(date) {
      if (date != null && "seconds" in date) {
        let dt = new Date(date.seconds * 1000);
        let hour = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
        let minute =
          dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
        return hour + ":" + minute;
      }
    },

    checkMessage(uidChat) {
      return uidChat === this.userID ? true : false;
    },

    getMessage() {
      firebaseGetData("messages", this.chatData);
    },

    async sendMessage(e) {
      e.preventDefault();
      let chatContent = document.querySelectorAll(".chat-content");
      if (document.querySelector(".add").message.value != "") {
        await firebaseCreateData("messages", {
          message: document.querySelector(".add").message.value,
          createdAt: serverTimestamp(),
        });
        nextTick(() => {
          chatContent[chatContent.length - 1].scrollIntoView({
            behavior: "smooth",
          });
        });
      } else {
        return;
      }
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
    this.getMessage();
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        this.userID = user.uid;
      }
    });
  },
};
</script>

<style>
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