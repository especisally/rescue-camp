/**
 * 管理后台上传脚本
 * - 为所有 .upload-btn 按钮绑定文件上传功能
 * - 上传完成后自动填充对应 URL 输入框
 * - 视频上传后自动读取时长并填充 duration 字段
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('.upload-btn');
    buttons.forEach(function (btn) {
      initUploadBtn(btn);
    });
  });

  function initUploadBtn(btn) {
    var targetName = btn.getAttribute('data-target');
    var uploadType = btn.getAttribute('data-type') || 'image';
    if (!targetName) return;

    // 为每个按钮创建隐藏的 file input
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    // 根据类型设置 accept
    if (uploadType === 'image') {
      fileInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
    } else if (uploadType === 'video') {
      fileInput.accept = 'video/mp4,video/quicktime,video/x-msvideo';
    } else if (uploadType === 'file') {
      fileInput.accept = '.pdf,.doc,.docx';
    }

    btn.parentNode.appendChild(fileInput);

    // 点击上传按钮 → 触发文件选择
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      fileInput.click();
    });

    // 文件选择后 → 上传
    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;

      // 显示上传中状态
      var originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
      btn.disabled = true;

      var formData = new FormData();
      formData.append('file', file);

      fetch('/admin/upload/' + uploadType, {
        method: 'POST',
        body: formData,
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          btn.innerHTML = originalText;
          btn.disabled = false;

          if (data.success) {
            // 填充 URL 输入框
            var targetInput = document.querySelector('[name="' + targetName + '"]');
            if (targetInput) {
              targetInput.value = data.url;
            }

            // 视频上传后自动获取时长
            if (uploadType === 'video') {
              detectVideoDuration(data.url);
            }

            // 如果是 file 类型且文件是视频，也检测时长
            if (uploadType === 'file' && file.type.startsWith('video/')) {
              detectVideoDuration(data.url);
            }

            showToast('上传成功', 'success');
          } else {
            showToast(data.message || '上传失败', 'danger');
          }
        })
        .catch(function (err) {
          btn.innerHTML = originalText;
          btn.disabled = false;
          console.error('Upload error:', err);
          showToast('上传失败，请检查网络', 'danger');
        });
    });
  }

  /**
   * 通过创建临时 video 元素读取视频时长（秒），自动填充到 duration 字段
   */
  function detectVideoDuration(url) {
    var video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.addEventListener('loadedmetadata', function () {
      var duration = Math.round(video.duration);
      if (duration > 0) {
        var durationInput = document.querySelector('[name="duration"]');
        if (durationInput) {
          durationInput.value = duration;
        }
      }
    });

    video.addEventListener('error', function () {
      // 无法读取时长（如格式不支持），忽略
    });
  }

  /**
   * 简易 Toast 提示
   */
  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '99999';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '6px';
    toast.style.color = '#fff';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    toast.style.transition = 'opacity 0.3s';

    if (type === 'success') {
      toast.style.background = '#28a745';
    } else {
      toast.style.background = '#dc3545';
    }

    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }
})();
