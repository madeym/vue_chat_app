<script setup>
import LoadSpinner from "../../../../components/LoadSpinner.vue";
</script>
<script>
import { SendNotification } from '../../../../assets/js/helpers';
import { firebaseUpdateSingleData } from '../../../../firebase';
export default {
  props: {
    userData: Object
  },
  data() {
    return {
      profilePicture: (this.userData.picture) ? this.userData.picture : '',
      dataUser: {},
      isLoad: false,
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
      this.isLoad = true;
      evt.preventDefault();
      try {
        let temp = {
          id: this.userData.id,
          dateOfBirth: this.userData.dateOfBirth,
          displayName: this.userData.displayName,
          email: this.userData.email,
          gender: this.dataUser.gender,
          picture: (this.profilePicture != '') ? this.profilePicture : this.userData.picture
        }
        await firebaseUpdateSingleData('users', temp.id, temp);
        document.querySelector('.btn-close-profile').click();
        SendNotification("Successfully Updated Profile", 200);
      } catch (error) {
        SendNotification(error.message, 500);
      }
      this.isLoad = false;
    }
  },
  mounted() {
    this.dataUser = this.userData;
  }
}
</script>

<template>
  <div class="modal fade" id="profileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
    aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="staticBackdropLabel">Profile</h1>
          <button type="button" class="btn-close btn-close-profile" data-bs-dismiss="modal" aria-label="Close"
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
              <input type="text" name="email" placeholder="Email" v-model="dataUser.email" class="form-control" readonly
                disabled>
              <input type="date" name="dateofbirth" placeholder="Date Of Birth" class="form-control mt-3"
                v-model="dataUser.dateOfBirth" required>
              <select name="gender" class="form-control mt-3" v-model="dataUser.gender" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="d-flex justify-content-center">
              <button type="submit" class="btn text-white text-primary-color mt-4">
                <LoadSpinner :class="{
                  'd-none': !isLoad
                }" /> {{ isLoad ? 'Loading' : 'Save' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>