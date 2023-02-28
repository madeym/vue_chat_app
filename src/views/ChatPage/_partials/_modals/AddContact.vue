<script setup>
import { SendNotification } from '../../../../assets/js/helpers';
import LoadSpinner from '../../../../components/LoadSpinner.vue';
</script>

<script>
import { firebaseGetDataByWhere, firebaseCreateData } from '../../../../firebase';
import { Timestamp } from "@firebase/firestore";
import { isEmpty } from "lodash";

export default {
    props: {
        userData: Object,
        chatData: Object
    },
    data() {
        return {
            searchResult: {},
            timeOut: '',
            isLoad: false
        }
    },
    methods: {
        searchContact(evt) {
            if (this.timeOut) clearTimeout(this.timeOut);
            this.timeOut = setTimeout(async () => {
                this.searchResult = {};
                await firebaseGetDataByWhere('users', 'email', '==', evt.target.value, this.searchResult, false);
            }, 1000);
        },

        async addContact(evt) {
            evt.preventDefault();
            this.isLoad = true;
            let flag = true;
            try {
                this.chatData.forEach((list) => {
                    if (!list.is_group) {
                        list.users.forEach((user) => {
                            if (user == this.searchResult[0].id) {
                                flag = false;
                            }
                        });
                    }
                });
                if (!flag) {
                    SendNotification('User Already Added', 500);
                } else {
                    await firebaseCreateData('messages', {
                        is_group: false,
                        users: [this.userData.id, this.searchResult[0].id],
                        created_at: Timestamp.now()
                    });
                    SendNotification('Successfully Added Contact', 200);
                    document.querySelector('.btn-close').click();
                }
            } catch (error) {
                SendNotification(error.message, 500);
            }
            this.isLoad = false;
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
                            <img :src="searchResult && searchResult[0] && searchResult[0].picture ? searchResult[0].picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                class="circle cursor-pointer" width="100" height="100" />
                            <h5 class="mt-3" v-if="searchResult && searchResult[0]">{{ searchResult[0].displayName }}</h5>
                        </div>
                        <div class="mt-4 d-flex justify-content-center">
                            <input type="text" placeholder="Search"
                                class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search"
                                name="searchContact" @keyup="searchContact($event)" required>
                        </div>
                        <div v-if="!isEmpty(searchResult)" class="d-flex justify-content-center">
                            <button type="submit" class="btn text-white text-primary-color mt-4" :disabled="isLoad"
                                @click="addContact($event)">
                                <LoadSpinner :class="{ 'd-none': !isLoad }" />
                                {{ isLoad ? 'Loading' : 'Add' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
