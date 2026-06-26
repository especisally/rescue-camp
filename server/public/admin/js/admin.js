// 后台通用 JS

// 确认删除
document.addEventListener('DOMContentLoaded', function () {
  const deleteButtons = document.querySelectorAll('[data-confirm]');
  deleteButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!confirm(btn.getAttribute('data-confirm') || '确认删除？此操作不可撤销。')) {
        e.preventDefault();
      }
    });
  });
});
