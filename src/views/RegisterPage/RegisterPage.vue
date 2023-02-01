<template>
  <div
    class="login-form position-absolute top-50 start-50 translate-middle"
    style="width: 300px"
  >
    <form class="signup" @submit.prevent="SignUp">
      <h2 class="text-center mb-4">Sign Up</h2>
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

      <div class="form-group mb-4 mt-4 d-flex justify-content-center">
        <button type="submit" class="btn btn-primary btn-block">Sign Up</button>
      </div>
    </form>
    <div class="d-flex gap-2 justify-content-center">
      <span clspanss="text-no-decoration">Have an account ?</span>
      <a href="#" class="text-decoration-none">Login</a>
    </div>
  </div>

  <!-- <button @click="SignOut">Log Out</button> -->
</template>

<script>
import { firebaseSignUpBasic, firebaseSignOut } from "@/firebase";
export default {
  methods: {
    async SignUp() {
      let res = await firebaseSignUpBasic(
        document.querySelector(".signup").email.value,
        document.querySelector(".signup").password.value
      );
    },
    async SignOut() {
      await firebaseSignOut();
    },
  },
};
</script>