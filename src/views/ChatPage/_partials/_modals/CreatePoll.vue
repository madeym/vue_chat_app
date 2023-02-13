<script>
import { Timestamp } from '@firebase/firestore';
import { firebaseUpdateSingleData } from '../../../../firebase';

export default {
    props: {
        chatData: Object,
        userData: Object
    },
    data() {
        return {
            data: {
                poll_title: '',
                optionData: [
                    {
                        name: '',
                        member: []
                    }
                ],
                created_at: Timestamp.now(),
                is_poll: true,
                is_file: false,
                is_unsend: false,
                message: '',
                user_id: this.userData.id,
                user_name: this.userData.displayName
            }
        }
    },
    methods: {
        addOption() {
            this.data.optionData.push({
                name: '',
                member: []
            });
        },
        async createPoll(evt) {
            evt.preventDefault();
            this.chatData.data.push(this.data);
            await firebaseUpdateSingleData('messages', this.chatData.id, this.chatData);
            document.querySelector('.create-poll-close-btn').click();
        }
    }
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
                            <input type="text" name="name" placeholder="Poll Name" class="form-control mb-2"
                                v-model="data.poll_title" required>
                            <span class="d-flex align-items-center gap-2 cursor-pointer" @click="addOption()">
                                Add More Option
                                <font-awesome-icon icon="fa-solid fa-plus" />
                            </span>
                            <div v-for="(option, idx) in data.optionData" class="col-12 mt-2 d-flex align-items-center">
                                <label for="option" class="form-label col-2">Option {{ idx + 1 }}</label>
                                <input type="text" v-model="data.optionData[idx].name" placeholder="Title"
                                    class="form-control" required>
                            </div>
                        </div>
                        <div class="d-flex justify-content-center">
                            <button type="submit" class="btn text-white text-primary-color mt-4"
                                @click="createPoll($event)">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>    