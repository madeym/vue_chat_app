<template>
    <a id="loadingbtn" href="#" data-bs-toggle="modal" data-bs-target="#loadingModal">
    </a>
    <div class="modal fade" id="loadingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog w-fit">
            <div class="modal-content position-relative">
                <button type="button" class="btn-close opacity-0 position-absolute" data-bs-dismiss="modal"
                    aria-label="Close"></button>
                <div class="modal-body d-flex justify-content-center align-items-center">
                    <font-awesome-icon icon="fa-solid fa-spinner" class='fa-spin me-2' style="font-size: 30px;" />
                    <h4 class="mt-1">loading</h4>
                </div>
            </div>
        </div>
    </div>
</template>