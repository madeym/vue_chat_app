<template>
  <div class="modal fade" id="profileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="staticBackdropLabel">Profile</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
            @click="closeProfileModal()"></button>
        </div>
        <div class="modal-body">
          <form @submit="updateProfile($event)">
            <div class="d-flex flex-column align-items-center">
              <img :src="profilePicture ? profilePicture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                class="circle cursor-pointer" @click="changeProfilePicture($event)" width="100" height="100" />
              <h5 class="mt-3">{{ userData.displayName }}</h5>
            </div>
            <div class="mt-4">
              <input type="file" name="picture" class="d-none" @change="handleFile($event)">
              <input type="text" name="email" placeholder="Email" v-model="userData.email" class="form-control" readonly
                disabled>
              <input type="date" name="dateofbirth" placeholder="Date Of Birth" class="form-control mt-3"
                v-model="userData.dateOfBirth">
              <select name="gender" class="form-control mt-3" v-model="userData.gender">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="d-flex justify-content-center">
              <button type="submit" class="btn btn-primary mt-4">Save</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { firebaseUpdateSingleData } from '../../../../firebase';
export default {
  props: {
    userData: Object
  },
  data() {
    return {
      profilePicture: this.userData.picture
    }
  },
  methods: {
    closeProfileModal() {
      this.profilePicture = this.userData.picture;
    },

    changeProfilePicture(evt) {
      document.querySelector("input[name='picture']").click();
    },

    handleFile(evt) {
      let file = evt.target.files[0];
      if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          this.profilePicture = reader.result;
        };
      }
    },

    async updateProfile(evt) {
      evt.preventDefault();
      document.querySelector('.btn-close').click();
      try {
        this.userData.picture = this.profilePicture;
        await firebaseUpdateSingleData('users', this.userData.id, this.userData);
      } catch (error) {
        console.log(error.message);
      }
    }
  },
  beforeMount() {

  }
}
</script>