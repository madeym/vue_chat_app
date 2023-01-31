<template>
  <form class="add" @submit.prevent="sendMessage">
    <label for="message">Message</label>
    <input type="text" name="message" />
    <button type="submit">Send</button>
  </form>

  <form class="update" @submit.prevent="updateMessage">
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
  </form>

  <div class="" style="display: grid">
    <span v-for="chat in chatData" v-bind:key="chat.id">
      {{ chat.message }}
    </span>
  </div>
</template>

<script>
import {
  firebaseGetData,
  firebaseCreateData,
  firebaseDeleteData,
  firebaseUpdateSingleData,
} from "@/firebase";
import { serverTimestamp } from "@firebase/firestore";

export default {
  data() {
    return {
      chatData: [],
    };
  },
  methods: {
    getMessage() {
      firebaseGetData("messages", this.chatData);
    },

    async sendMessage() {
      await firebaseCreateData("messages", {
        user_id: 1,
        message: document.querySelector(".add").message.value,
        createdAt: serverTimestamp(),
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
    this.getMessage();
  },
};
</script>