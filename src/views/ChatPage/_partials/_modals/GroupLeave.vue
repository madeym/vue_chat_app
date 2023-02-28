<script setup>
import { isEmpty } from '@firebase/util';
import { SendNotification } from '../../../../assets/js/helpers';
import LoadSpinner from '../../../../components/LoadSpinner.vue';
import { firebaseUpdateSingleData } from '../../../../firebase';

</script>
<script>
export default {
    props: {
        chatData: Object,
        userData: Object
    },
    data() {
        return {
            isLoad: false,
        }
    },
    methods: {
        async confirmLeaveGroup() {
            this.isLoad = true;
            let temp = {};
            try {
                if (!isEmpty(this.chatData)) {
                    Object.assign(temp, this.chatData);
                    delete temp.isAlreadyRequest;
                    if (temp.users.length > 0) {
                        temp.users.forEach(async (list, idx) => {
                            if (list == this.userData.id) {
                                temp.users.splice(idx, 1);
                                this.$emit('resetChatWindow');
                                await firebaseUpdateSingleData('messages', temp.id, temp);
                                SendNotification('Successfully Leave Group', 200);
                                await document.querySelector('.close-group-leave').click();
                            }
                        });
                    }
                }
            } catch (error) {
                SendNotification(error.message, 500);
            }
            this.isload = false;
        }
    }
}
</script>

<template>
    <div class="modal fade" id="groupLeaveModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Leave Group</h5>
                    <button type="button" class="btn-close close-group-leave" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Confirm leave this group ?
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn text-white text-primary-color mt-4" @click="confirmLeaveGroup()">
                            <LoadSpinner :class="{
                                'd-none': !isLoad
                            }" /> {{ isLoad ? 'Loading' : 'Confirm' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>