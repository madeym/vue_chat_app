<script setup>
import LoadSpinner from "../../components/LoadSpinner.vue";
</script>

<script>
import { firebaseSignUpBasic, firebaseSignOut } from "@/firebase";
import { SendNotification } from "../../assets/js/helpers";
export default {
  data() {
    return {
      isLoad: false,
    }
  },
  methods: {
    async SignUp() {
      this.isLoad = true;
      try {
        let res = await firebaseSignUpBasic(document.querySelector(".signup").displayName.value, document.querySelector(".signup").email.value, document.querySelector(".signup").password.value);
        SendNotification('Successfully Register', 200);
        this.$router.push("chat");
      }
      catch (error) {
        SendNotification(error.message, 500);
      }
      this.isLoad = false;
    },
    async SignOut() {
      await firebaseSignOut();
    },
  },
  components: { LoadSpinner }
};
</script>

<template>
  <div class="login-form position-absolute top-50 start-50 translate-middle" style="width: 300px">
    <form class="signup" @submit.prevent="SignUp">
      <h2 class="text-center mb-4">Sign Up</h2>
      <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
        <input type="text" name="displayName" class="form-control" placeholder="Username" required />
      </div>
      <div class="input-group mb-3">
        <span class="input-group-text"><i class="bi bi-envelope-at-fill"></i></span>
        <input type="text" name="email" class="form-control" placeholder="Email" required />
      </div>
      <div class="input-group mb-2">
        <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
        <input type="password" name="password" class="form-control" placeholder="Password" required />
      </div>

      <div class="form-group mb-4 mt-4 d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-block" id="signUpBtn" :disabled="isLoad">
          <LoadSpinner :class="{
            'd-none': !isLoad
          }" /> {{ isLoad ? 'Loading' : 'Sign Up' }}
        </button>
      </div>
    </form>
    <div class="d-flex gap-2 justify-content-center">
      <span clspanss="text-no-decoration">Have an account ?</span>
      <router-link class="text-decoration-none" to="/login">Login</router-link>
    </div>
  </div>
</template>
