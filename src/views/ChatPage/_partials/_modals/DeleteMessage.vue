<script setup>
import LoadSpinner from '../../../../components/LoadSpinner.vue';
</script>

<script>
import { isEmpty } from "lodash";
import { SendNotification } from "../../../../assets/js/helpers";
import { firebaseUpdateSingleData } from "../../../../firebase";
export default {
    props: {
        rightClickData: Object
    },
    data() {
        return {
            isLoad: false
        };
    },
    methods: {
        async confirmDeleteMessage() {
            this.isLoad = true;
            try {
                if (!isEmpty(this.rightClickData) && !isEmpty(this.rightClickData.data)) {
                    let temp = this.rightClickData;
                    temp.data.is_deleted = true;
                    await firebaseUpdateSingleData('message_details', temp.data.id, temp.data);
                    document.querySelector('.close-delete').click();
                    SendNotification("Successfully Deleted Message", 200);
                }
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
    <div class="modal fade" id="deleteMessageModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Delete Message</h5>
                    <button type="button" class="btn-close close-delete" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Confirm delete this message ?
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn text-white text-primary-color mt-4"
                            @click="confirmDeleteMessage()">
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