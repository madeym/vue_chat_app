<script>
import { Timestamp } from '@firebase/firestore';
import { SendNotification } from '../../../../assets/js/helpers';
import LoadSpinner from '../../../../components/LoadSpinner.vue';
import { firebaseCreateData } from '../../../../firebase';

export default {
    props: {
        chatData: Object,
        userData: Object
    },
    data() {
        return {
            data: {
                created_at: '',
                is_deleted: false,
                is_photo: false,
                is_poll: true,
                is_read: false,
                is_unsend: false,
                message: "",
                messages_id: "",
                updated_at: '',
                user_id: this.userData.id,
                user_name: this.userData.displayName,
                poll_title: "",
                option_data: [
                    {
                        name: "",
                    }
                ],
                end_date: '',
            },
            isLoad: false
        };
    },
    methods: {
        addOption() {
            this.data.option_data.push({
                name: "",
            });
        },
        deleteOption(idx) {
            this.data.option_data.splice(idx, 1);
        },
        async createPoll(evt) {
            this.isLoad = true;
            evt.preventDefault();
            try {
                this.data.created_at = Timestamp.now();
                this.data.messages_id = this.chatData.id;
                console.log(this.data);
                await firebaseCreateData('message_details', this.data);
                document.querySelector(".create-poll-close-btn").click();
            } catch (error) {
                SendNotification(error.message, 500);
            }
            this.isLoad = false;
        }
    },
    components: { LoadSpinner }
}
</script>
<template>
    <div class="modal fade" id="createPollModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Create Poll</h1>
                    <button type="button" class="btn-close create-poll-close-btn" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div>
                            <div class="input-group">
                                <span class="input-group-text" id="basic-addon1"><i class="bi bi-pencil-fill"></i></span>
                                <input type="text" name="name" placeholder="Poll Name" class="form-control"
                                    v-model="data.poll_title" required>
                            </div>
                            <div class="input-group mt-3">
                                <span class="input-group-text" id="basic-addon1"><i class="bi bi-calendar-fill"></i></span>
                                <input type="date" name="end_date" placeholder="End Date" class="form-control"
                                    v-model="data.end_date" required>
                            </div>
                            <span class="d-flex align-items-center gap-2 cursor-pointer mt-3" @click="addOption()">
                                Add More Option
                                <font-awesome-icon icon="fa-solid fa-plus" />
                            </span>
                            <div v-for="(option, idx) in data.option_data" class="input-group mt-3">
                                <input type="text" v-model="data.option_data[idx].name" :placeholder="'Option ' + (idx + 1)"
                                    class="form-control" required>
                                <span class="input-group-text bg-danger text-white cursor-pointer" id="basic-addon1"
                                    @click="deleteOption(idx)"><i class="bi bi-trash-fill"></i></span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn text-white text-primary-color mt-4" @click="createPoll($event)"
                                :disabled="isLoad">
                                <LoadSpinner :class="{ 'd-none': !isLoad }" />
                                {{ isLoad ? 'Loading' : 'Create' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>    