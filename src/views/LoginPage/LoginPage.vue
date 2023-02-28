<script setup>
import LoadSpinner from "../../components/LoadSpinner.vue";
</script>

<script>
import { firebaseSignInBasic } from "@/firebase";
import { SendNotification } from "../../assets/js/helpers";
export default {
  data() {
    return {
      isLoad: false,
    }
  },
  methods: {
    async SignIn() {
      this.isLoad = true;
      try {
        let res = await firebaseSignInBasic(
          document.querySelector(".signin").email.value,
          document.querySelector(".signin").password.value
        );
        localStorage.setItem('userData', JSON.stringify(res.user));
        localStorage.setItem('isAuth', true);
        SendNotification('Successfully Login', 200);
        this.$router.push('chat');
      } catch (error) {
        SendNotification(error.message, 500);
      }
      this.isLoad = false;
    },
  },
};
</script>

<template>
  <div class="login-form position-absolute top-50 start-50 translate-middle" style="width: 300px">
    <form class="signin" @submit.prevent="SignIn">
      <h2 class="text-center mb-4">Sign In</h2>
      <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
        <input type="text" name="email" class="form-control" placeholder="Email" required />
      </div>
      <div class="input-group mb-2">
        <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
        <input type="password" name="password" class="form-control" placeholder="Password" required />
      </div>
      <div class="form-group mb-4">
        <label class="float-left form-check-label">
          <input type="checkbox" /> Remember me</label>
      </div>
      <div class="form-group mb-4 d-flex justify-content-center">
        <button type="submit" class="btn btn-primary" id="signInBtn" :disabled="isLoad">
          <LoadSpinner :class="{
            'd-none': !isLoad
          }" /> {{ isLoad ? 'Loading' : 'Sign In' }}
        </button>
      </div>
    </form>
    <div class="d-flex gap-2 justify-content-center">
      <router-link class="text-decoration-none" to="/register">Create an Account</router-link>
    </div>
  </div>
</template>

