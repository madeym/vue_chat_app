<script setup>
import LoadSpinner from '../../../../components/LoadSpinner.vue';
</script>
<script>
import { firebaseCreateData, firebaseGetSingleData, firebaseUpdateSingleData } from '../../../../firebase';
export default {
    props: {
        userData: Object,
    },
    data() {
        return {
            contactListData: [],
            searchKeyword: '',
            isLoad: false,
            groupData: {
                name: '',
                picture: '',
                information: '',
                member: [],
            }
        }
    },
    methods: {
        getContactListData() {
            if (this.userData.contacts) {
                this.userData.contacts.forEach((list, idx) => {
                    if (list.user_id) {
                        this.contactListData[idx] = {};
                        firebaseGetSingleData('users', list.user_id, this.contactListData[idx], false);
                    }
                });
            }
        },

        changeGroupPicture(evt) {
            document.querySelector("input[name='groupPhoto']").click();
        },

        handleFile(evt) {
            let file = evt.target.files[0];
            if (file) {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    this.groupData.picture = reader.result;
                };
            }
        },

        selectContact(contact, idx) {
            contact.isSelected = !contact.isSelected;
        },

        async createGroup(evt) {
            let btn = document.querySelector('.btn-submit');
            this.isLoad = true;
            btn.disabled = true;
            btn.innerHTML = 'Loading';

            evt.preventDefault();
            if (this.contactListData) {
                this.contactListData.forEach((list, idx) => {
                    if (list.isSelected) {
                        this.groupData.member.push({ user_id: list.id, email: list.email });
                    }
                });
            }
            if (this.groupData.member == []) {
                return;
            } else {
                try {
                    let res = await firebaseCreateData('messages', {
                        data: [],
                        is_group: true,
                        group_data: this.groupData
                    });

                    this.userData.contacts.push({
                        messages_id: res.id
                    });

                    await firebaseUpdateSingleData('users', this.userData.id, this.userData);
                    this.groupData.member.forEach(async list => {
                        let data = {};
                        await firebaseGetSingleData('users', list.user_id, data);
                        data.contacts = data.contacts ? data.contacts : [];
                        data.contacts.push({
                            messages_id: res.id
                        });
                        await firebaseUpdateSingleData('users', list.user_id, data);
                    });
                    document.querySelector('.btn-close').click();
                } catch (error) {
                    console.log(error.message);
                }
            }

            this.isLoad = false;
            btn.disabled = false;
            btn.innerHTML = 'Create';
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
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit="createGroup($event)">
                        <div class="d-flex flex-column align-items-center">
                            <img :src="groupData.picture != '' ? groupData.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                class="circle cursor-pointer" width="100" height="100" @click="changeGroupPicture()" />
                            <input type="file" name="groupPhoto" class="d-none" @change="handleFile($event)">
                            <h5 class="mt-3">group name</h5>
                        </div>
                        <div class="form-group px-3 mt-4">
                            <label for="groupInformation" class="form-label">Group Information :</label>
                            <textarea name="groupInformation" id="" cols="10" rows="5" class="form-control"
                                v-model="groupData.information" required></textarea>
                        </div>
                        <div class="mt-4 d-flex justify-content-center">
                            <input type="text" placeholder="Search"
                                class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search"
                                name="searchContact" v-model="searchKeyword">
                        </div>
                        <div class="h-40vh overflow-x-auto mt-2 px-3">
                            <div v-for="contact in contactListData"
                                class="d-flex align-items-center px-3 py-2 gap-2 chat-list cursor-pointer"
                                :class="{ 'active-window': contact.isSelected, 'd-none': !(contact.displayName && contact.displayName.includes(searchKeyword)) }"
                                @click="selectContact(contact)">
                                <img :src="contact.picture ? contact.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                    width="50" height="50" class="circle mt-1" />
                                <div class="d-grid justify-content-center">
                                    <span class="font-bold" style="font-size: 18px;">{{
                                        contact.displayName
                                    }}</span>
                                    <span class="font-12 color-grey">{{
                                        contact.email
                                    }}</span>

                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn text-primary-color text-white mt-4 btn-submit">
                                <LoadSpinner :class="{
                                    'd-none': !isLoad
                                }" />
                                <span>Create</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>