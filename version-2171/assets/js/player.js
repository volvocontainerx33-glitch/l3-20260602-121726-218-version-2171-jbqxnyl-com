function initMoviePlayer(videoId, buttonId, mediaUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hls = null;

  if (!video || !mediaUrl) {
    return;
  }

  function attach() {
    if (video.dataset.ready === '1') {
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    }
  }

  function play() {
    attach();
    if (button) {
      button.classList.add('hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (button) {
          button.classList.remove('hidden');
        }
      });
    }
  }

  attach();

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
