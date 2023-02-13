<script>
import { isEmpty } from "lodash";
import { firebaseUpdateSingleData } from "../../../../firebase";
export default {
    props: {
        rightClickData: Object
    },
    methods: {
        async confirmUnsendMessage() {
            if (!isEmpty(this.rightClickData) && !isEmpty(this.rightClickData.data) && !isEmpty(this.rightClickData.data.data)) {
                this.rightClickData.data.data[this.rightClickData.idx].is_unsend = true;
                await firebaseUpdateSingleData('messages', this.rightClickData.data.id, this.rightClickData.data);
                document.querySelector('.close-unsend').click();
            }
        }
    }
}
</script>

<template>
    <!-- Modal -->
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
                            @click="confirmUnsendMessage()">Confirm</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>