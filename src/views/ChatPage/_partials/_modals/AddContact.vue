<script setup>
import LoadSpinner from '../../../../components/LoadSpinner.vue';
</script>

<script>
import { firebaseGetDataByWhere, firebaseUpdateSingleData, firebaseCreateData } from '../../../../firebase';
export default {
    props: {
        userData: Object
    },
    data() {
        return {
            searchResult: {},
            timeOut: '',
            formSubmitted: false
        }
    },
    methods: {
        searchContact(evt) {
            if (this.timeOut) clearTimeout(this.timeOut);
            this.timeOut = setTimeout(async () => {
                this.searchResult = {};
                await firebaseGetDataByWhere('users', evt.target.value, this.searchResult, false);
            }, 1000);
        },

        async addContact(evt) {
            evt.preventDefault();
            let defaultHTML = evt.target.innerHTML;
            this.formSubmitted = true;
            evt.target.innerHTML = 'Loading';

            this.userData.contacts = [];

            try {
                let res = await firebaseCreateData('messages', {
                    data: []
                });
                this.userData.contacts.push({
                    user_id: this.searchResult.id,
                    messages_id: res.id
                });
                await firebaseUpdateSingleData('users', this.userData.id, this.userData);
                document.querySelector('.btn-close').click();
            } catch (error) {
                console.log(error.message);
            }

            this.formSubmitted = false;
            evt.target.innerHTML = defaultHTML;
        }
    },
}
</script>

<template>
    <div class="modal fade" id="addContactModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Add Contact</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="d-flex flex-column align-items-center">
                            <img :src="searchResult.picture ? searchResult.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                class="circle cursor-pointer" width="100" height="100" />
                            <h5 class="mt-3">{{ searchResult.displayName }}</h5>
                        </div>
                        <div class="mt-4">
                            <input type="text" placeholder="Search"
                                class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search"
                                name="searchContact" @keyup="searchContact($event)">
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn btn-primary mt-4" @click="addContact">
                                <LoadSpinner v-if="formSubmitted" />
                                <span>Add</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
