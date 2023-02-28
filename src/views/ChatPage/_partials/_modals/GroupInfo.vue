<script setup>
import { watch } from "@vue/runtime-core";

</script>
<script>
import { isEmpty } from "lodash";

export default {
    props: {
        chatData: Object,
        chatDataDetail: Object,
        userData: Object
    },
    data() {
        return {
            searchUserKeyword: ''
        }
    }
}
</script>

<template>
    <div v-if="!isEmpty(chatData) && chatData.is_group" class="modal fade" id="groupInfoModal" data-bs-backdrop="static"
        data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Group Info</h1>
                    <button type="button" class="btn-close close-create-group" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="d-flex flex-column align-items-center">
                            <img :src="chatData.group_data.picture ? chatData.group_data.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                class="circle cursor-pointer" width="100" height="100" />
                            <input type=" file" name="groupPhoto" class="d-none">
                            <h5 class="mt-3">{{ chatData.group_data.name }}</h5>

                        </div>
                        <div class="form-group px-3 mt-3">
                            <label for="groupInformation" class="form-label">Information :</label>
                            <div>{{ chatData.group_data.information }}</div>
                        </div>
                        <div class="mt-4 d-flex justify-content-center">
                            <input type="text" placeholder="Search"
                                class="shadow rounded-pill px-3 py-1 col-11 outline-0 border-0 left-search"
                                name="searchContact" v-model="searchUserKeyword">
                        </div>
                        <div class="h-40vh overflow-x-auto mt-3 px-3">
                            <div class="d-flex align-items-center px-3 py-2 gap-2">
                                <img :src="userData.picture ? userData.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                    class="circle mt-1 h-50px w-50px" />
                                <div class="d-grid gap-1">
                                    <span class="font-bold d-flex align-items-start" style="font-size: 18px;">{{
                                        userData.displayName
                                    }}</span>
                                    <span class="font-12 color-grey">{{
                                        userData.email
                                    }}</span>
                                </div>
                            </div>
                            <div v-for="user in chatDataDetail.user_details"
                                class="d-flex align-items-center px-3 py-2 gap-2">
                                <img :src="user.picture ? user.picture : 'https://img.icons8.com/fluency/48/null/test-account.png'"
                                    class="circle mt-1 h-50px w-50px" />
                                <div class="d-grid gap-1">
                                    <span class="font-bold d-flex align-items-start" style="font-size: 18px;">{{
                                        user.displayName
                                    }}</span>
                                    <span class="font-12 color-grey">{{
                                        user.email
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>    