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
      class="py-4 px-2 d-flex flex-column"
    >
      <div
        v-for="chat in chatData"
        v-bind:key="chat.id"
        class="my-3 d-flex flex-column"
        :class="{ 'align-items-end': checkMessage(chat.user_id) }"
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
            class="py-2 text-white border-1 rounded px-3"
            :class="{
              'bg-primary': checkMessage(chat.user_id),
              'bg-warning': !checkMessage(chat.user_id),
            }"
            style="max-width: 60% !important; width: fit-content"
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

export default {
  data() {
    return {
      chatData: [],
      userID: "",
    };
  },
  methods: {
    dateConvert(date) {
      if (date.seconds != undefined) {
        let dt = new Date(date.seconds * 1000);
        return dt.getHours() + ":" + dt.getMinutes();
      }
    },

    checkMessage(uidChat) {
      return uidChat === this.userID ? true : false;
    },

    getMessage() {
      firebaseGetData("messages", this.chatData);
      console.log(this.chatData);
    },

    async sendMessage() {
      if (document.querySelector(".add").message.value != "") {
        await firebaseCreateData("messages", {
          message: document.querySelector(".add").message.value,
          createdAt: serverTimestamp(),
        });
      } else {
        console.log("empty");
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