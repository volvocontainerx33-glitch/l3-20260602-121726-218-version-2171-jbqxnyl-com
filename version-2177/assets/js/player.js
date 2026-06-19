function ready(callback) {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

ready(function () {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(initPlayer);
});

function initPlayer(shell) {
    var video = shell.querySelector("video");
    var source = shell.dataset.src;
    var overlay = shell.querySelector("[data-player-overlay]");
    var loading = shell.querySelector("[data-player-loading]");
    var errorBox = shell.querySelector("[data-player-error]");
    var toggleButtons = shell.querySelectorAll("[data-player-toggle]");
    var muteButton = shell.querySelector("[data-player-mute]");
    var fullscreenButton = shell.querySelector("[data-player-fullscreen]");
    var initialized = false;
    var hls = null;

    if (!video || !source) {
        showError("播放源缺失，无法初始化播放器。");
        return;
    }

    toggleButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            togglePlayback();
        });
    });

    video.addEventListener("click", togglePlayback);
    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });
    video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }
    });

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }

    function togglePlayback() {
        ensureSource();
        if (video.paused) {
            video.play().catch(function () {
                showError("浏览器阻止了自动播放，请再次点击播放按钮。");
            });
        } else {
            video.pause();
        }
    }

    function ensureSource() {
        if (initialized) {
            return;
        }

        initialized = true;
        setLoading(true);

        var HlsConstructor = window.Hls;

        if (HlsConstructor && HlsConstructor.isSupported()) {
            hls = new HlsConstructor({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
                setLoading(false);
            });
            hls.on(HlsConstructor.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    setLoading(false);
                    showError("视频加载失败，请稍后重试。");
                    if (hls) {
                        hls.destroy();
                    }
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
                setLoading(false);
            }, { once: true });
        } else {
            setLoading(false);
            showError("当前浏览器不支持 HLS 播放。");
        }
    }

    function setLoading(isLoading) {
        if (loading) {
            loading.classList.toggle("is-visible", isLoading);
        }
    }

    function showError(message) {
        if (errorBox) {
            errorBox.textContent = message;
            errorBox.classList.add("is-visible");
        }
    }
}
