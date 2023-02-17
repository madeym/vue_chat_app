<script setup>
import LoadSpinner from "../../../../components/LoadSpinner.vue";
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
            isLoad: false,
        }
    },
    methods: {
        async confirmUnsendMessage() {
            this.isLoad = true;
            try {
                if (!isEmpty(this.rightClickData) && !isEmpty(this.rightClickData.data) && !isEmpty(this.rightClickData.data.message_details)) {
                    let temp = this.rightClickData;
                    temp.data.message_details[temp.idx].is_unsend = true;
                    await firebaseUpdateSingleData('message_details', temp.data.message_details[temp.idx].id, temp.data.message_details[temp.idx]);
                    document.querySelector('.close-unsend').click();
                    SendNotification("Successfully Unsend Message", 200);
                }
            } catch (error) {
                SendNotification(error.message, 500);
            }
            this.isLoad = false;
        }
    }
}
</script>

<template>
    <div class="modal fade" id="unsendMessageModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Unsend Message</h5>
                    <button type="button" class="btn-close close-unsend" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Confirm unsend this message ?
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn text-white text-primary-color mt-4"
                            @click="confirmUnsendMessage()">
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