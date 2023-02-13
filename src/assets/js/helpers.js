export const SendNotification = (message, status) => {
    var classAlert = '';
    var htmlIcon = '';
    var svgAttribute = '';
    if (status == 200) {
        classAlert = 'alert-primary';
        htmlIcon = "<use xlink:href='#check-circle-fill'/>";
        svgAttribute = "Success:";
    } else if (status > 200 && status <= 500) {
        classAlert = 'alert-warning';
        htmlIcon = "<use xlink:href='#exclamation-triangle-fill'/>";
        svgAttribute = "Warning:";
    } else if (status == -1) {
        classAlert = 'alert-primary';
        htmlIcon = "<use xlink:href='#info-fill'/>";
        svgAttribute = "Info:";
    } else {
        classAlert = 'alert-danger';
        htmlIcon = "<use xlink:href='#info-fill'/>";
        svgAttribute = "Danger:";
    }
    document.querySelector('.svg-container').setAttribute('aria-label', svgAttribute);
    document.querySelector('.svg-container').innerHTML = htmlIcon;
    document.querySelector('.alert-message').innerHTML = message;

    document.querySelector('.alert-container').classList.add(classAlert);
    document.querySelector('.alert-container').classList.add('alert-show');

    setTimeout(() => {
        document.querySelector('.alert-container').classList.remove('alert-show');
        document.querySelector('.svg-container').classList.remove('alert-show');
        document.querySelector('.alert-message').classList.remove('alert-show');
        document.querySelector('.alert-container').classList.remove(classAlert);
        document.querySelector('.svg-container').removeAttribute('aria-label');
        document.querySelector('.alert-message').innerHTML = '';
        document.querySelector('.svg-container').innerHTML = '';
    }, 5000);

}