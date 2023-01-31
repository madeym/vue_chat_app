<script setup>
import { CompreFace } from "@exadel/compreface-js-sdk";
</script>
<script>
export default {
    data() {
        return {
            Msg: "hello",
        };
    },
    methods: {
        StartVideo() {
            var video = document.getElementById('camera');
            var canvas1 = document.getElementById('canvas1');
            var canvas2 = document.getElementById('canvas2');

            navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 1920},
                    height: {ideal: 1080}
                }
            }).then((stream) => {
                video.srcObject = stream;

                let stream_settings = stream.getVideoTracks()[0].getSettings();
                var stream_width = stream_settings.width;
                var stream_height = stream_settings.height;

                video.addEventListener('play', function() {
                    let compreFace = new CompreFace('http://127.0.0.1', '8000');
                    let apiKey = "36b864f7-1ef2-431b-9f6e-b8aabb635d62";

                    let recognitionService = compreFace.initFaceRecognitionService(apiKey);

                    let ctx1 = canvas1.getContext('2d');
                    ctx1.drawImage(video, 0, 0, stream_width, stream_height);

                    document.addEventListener('next_frame', function() {
                        canvas1.toBlob(blob => {

                            console.log(blob);
                            recognitionService.recognize(blob, {
                                    limit: 0
                                })
                                .then((res) => {
                                    console.log(res);
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        }, 'image/jpeg');
                    })

                    const customEvent = new Event('next_frame', {
                        'bubbles': true,
                        'cancelable': false
                    });

                    document.dispatchEvent(customEvent);

                });
            }).catch(function(err) {
                console.log(err);
            });
        }
    }
}
</script>

<template>
    <video width="1280" height="720" id="camera" autoplay muted></video>
    <canvas width="1280" height="720" id="canvas1"></canvas>
    <canvas width="1280" height="720" id="canvas2"></canvas>
    <button @click="StartVideo">Start Video</button>
</template>