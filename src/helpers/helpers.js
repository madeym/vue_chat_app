export function loadingBtn(btn, defaultHTML, isLoad) {
    if (isLoad) {
        btn.disabled = true;
        btn.innerHTML = "<font-awesome-icon :icon='fa-solid fa-spinner' class='fa-spin me-2' />" + "Loading";
    } else {
        btn.disabled = false;
        btn.innerHTML = defaultHTML;
    }
}