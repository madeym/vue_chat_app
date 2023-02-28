<script setup>
import { Timestamp } from '@firebase/firestore';
import { SendNotification } from '../../../../assets/js/helpers';
import LoadSpinner from '../../../../components/LoadSpinner.vue';
</script>
<script>
import { firebaseCreateData } from '../../../../firebase';
import { isEmpty } from "lodash";

export default {
    props: {
        userData: Object,
        chatDataDetail: Array
    },
    data() {
        return {
            contactListData: [],
            searchKeyword: '',
            isLoad: false,
            groupData: {
                is_group: true,
                created_at: '',
                group_data: {
                    name: '',
                    picture: '',
                    information: '',
                },
                users: []
            }
        }
    },
    methods: {
        getContactListData() {
            if (this.chatDataDetail.length > 0) {
                this.chatDataDetail.forEach((list, idx) => {
                    if (!Array.isArray(list)) {
                        this.contactListData[idx] = list.user_details;
                    }
                });
            }
        },

        changeGroupPicture(evt) {
            document.querySelector("input[name='groupPhoto']").click();
        },

        handleFile(evt) {
            try {
                let file = evt.target.files[0];
                if (file) {
                    if (file.name.substring(file.name.lastIndexOf('.')) == '.jpg' || file.name.substring(file.name.lastIndexOf('.')) == '.png') {
                        let reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = async () => {
                            this.groupData.group_data.picture = reader.result;
                        };
                    } else {
                        SendNotification('Wrong File Format', 500);
                    }
                }
            } catch (error) {
                SendNotification(error.message, 500);
            }
        },

        selectContact(contact, idx) {
            if (!contact.isSelected) {
                contact.isSelected = true;
            } else {
                contact.isSelected = false;
            }
        },

        async createGroup(evt) {
            this.isLoad = true;
            evt.preventDefault();
            if (this.contactListData) {
                this.contactListData.forEach((list, idx) => {
                    if (list.isSelected) {
                        this.groupData.users.push(list.id);
                    }
                });
                if (this.groupData.users.length > 0) {
                    this.groupData.users.push(this.userData.id);
                }
            }
            if (this.groupData.users.length == 0) {
                SendNotification("Group Member Shouldn't Empty", 500);
                return;
            } else {
                try {
                    this.groupData.created_at = Timestamp.now();
                    await firebaseCreateData('messages', this.groupData);
                    document.querySelector('.close-create-group').click();
                    SendNotification('Successfully Create Group', 200);
                } catch (error) {
                    SendNotification(error.message, 500);
                }
            }
            this.isLoad = false;
        }
    },
    beforeMount() {
        this.getContactListData();
    }
}
</script>

<template>
    <div class="modal fade" id="createGroupModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Create Group</h1>
                    <button type="button" class="btn-close close-create-group" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit="createGroup($event)">
                        <div class="d-flex flex-column align-items-center">
                            <img :src="groupData.group_data.picture != '' ? groupData.group_data.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                class="circle cursor-pointer" width="100" height="100" @click="changeGroupPicture()" />
                            <input type="file" name="groupPhoto" class="d-none" @change="handleFile($event)">
                        </div>
                        <div class="input-group px-3 mt-4">
                            <span class="input-group-text" id="basic-addon1"><i class="bi bi-pencil-fill"></i></span>
                            <input type="text" class="form-control" v-model="groupData.group_data.name" placeholder="Name"
                                required>
                        </div>
                        <div class="input-group px-3 mt-3">
                            <span class="input-group-text"><i class="bi bi-info-lg"></i></span>
                            <textarea name="groupInformation" id="" cols="10" rows="5" class="form-control"
                                v-model="groupData.group_data.information" placeholder="Information" required></textarea>
                        </div>
                        <div class="mt-4 d-flex justify-content-center">
                            <input type="text" placeholder="Search"
                                class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search"
                                name="searchContact" v-model="searchKeyword">
                        </div>
                        <div class="h-40vh overflow-x-auto mt-3 px-3">
                            <div v-for="contact in contactListData"
                                class="d-flex align-items-center px-3 py-2 gap-2 chat-list cursor-pointer"
                                :class="{ 'bg-primary-color': contact.isSelected, 'd-none': !(contact.displayName && contact.displayName.includes(searchKeyword)) }"
                                @click="selectContact(contact)">
                                <img :src="contact.picture ? contact.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                    class="circle mt-1 h-50px w-50px" />
                                <div class="d-grid gap-1">
                                    <span class="font-bold d-flex align-items-start" style="font-size: 18px;">{{
                                        contact.displayName
                                    }}</span>
                                    <span class="font-12 color-grey">{{
                                        contact.email
                                    }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn text-primary-color text-white mt-4 btn-submit"
                                :disabled="isLoad">
                                <LoadSpinner :class="{
                                    'd-none': !isLoad
                                }" />
                                {{ isLoad ? 'Loading' : 'Create' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>