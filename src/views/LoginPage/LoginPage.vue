<template>
  <div
    class="login-form position-absolute top-50 start-50 translate-middle"
    style="width: 300px"
  >
    <form class="signin" @submit.prevent="SignIn">
      <h2 class="text-center mb-4">Sign In</h2>
      <div class="form-group mb-3">
        <input
          type="text"
          name="email"
          class="form-control"
          placeholder="Email"
        />
      </div>
      <div class="form-group mb-2">
        <input
          type="password"
          name="password"
          class="form-control"
          placeholder="Password"
        />
      </div>
      <div class="form-group mb-4">
        <label class="float-left form-check-label">
          <input type="checkbox" /> Remember me</label
        >
      </div>
      <div class="form-group mb-4 d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-block" id="signInBtn">
          Sign In
        </button>
      </div>
    </form>
    <div class="d-flex gap-2 justify-content-center">
      <router-link class="text-decoration-none" to="/register"
        >Create an Account</router-link
      >
    </div>
  </div>
</template>

<script>
import { firebaseSignInBasic } from "@/firebase";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
export default {
  methods: {
    async SignIn() {
      let btn = document.getElementById("signInBtn");
      btn.innerHTML = "Loading";
      btn.disabled = true;
      try {
        let res = await firebaseSignInBasic(
          document.querySelector(".signin").email.value,
          document.querySelector(".signin").password.value
        );
        this.$router.push("chat");
      } catch (error) {
        btn.innerHTML = "Sign In";
        btn.disabled = false;
      }
    },
  },
};
</script>