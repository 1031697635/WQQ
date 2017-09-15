/**
 * Created by QQ Wang on 2017/8/31
 * 基于Jquery的弹框插件,兼容IE8,封装了统一的关闭逻辑以及特效;
 */

/**
  示例: 
    // 默认为 9999 , 可设置当前页的弹框初始层级
    Dialog.setZIndex(10000);

    // 基本用法1：设置双按钮 按钮可配置为链接 或者 回调
    var dialog1 = Dialog({
      className: 'dialog',
      content: $('#template').html(),
      ok: ['sure', 'http://www.baidu.com'],
      cancel: ['cancel', function () { console.log('cancel'); }]
    });
    
    // 用法2：对于弹框内插入了表单提交请求
    var dialog2 = Dialog({
      type: 'alert',
      className: 'dialog',
      content: $('#template').html(),
      edgeClose: false,
      buttonClickAutoClose: [false],
      ok: ['sure', function () {
        // 开始发送表单请求
        dialog2.request('show');
        setTimeout(function () {
          // 结束发送表单请求
          dialog2.request('hide');
          // 验证成功 向下淡入关闭弹框
          dialog2.close('down');
          // 提示验证结果
          Dialog({
            type: 'tip',
            content: '设置成功'
          });
        } ,1000);
      }]
    });
    
    // 用法3：设置自动关闭的提示框
    var dialog3 = Dialog({
      type: 'tip',
      className: 'dialog',
      content: '密码错误',
      edgeClose: true,
      timer: 3000,
      closeCb: function () { console.log('弹框关闭便会触发'); }
    });

    如果在创建弹框后 需要在子内容的其它元素里(如发送验证码的button)绑定事件 由于是动态创建的 需使用事件委托 以免每次创建时都要绑定事件
    如： $('body').on('click', '.child-selector', function () {});
*/

;(function (window, document, $, undefined) {

  var zIndex = 9999,      // 默认zIndex层级
      flag = false,       // 首次触发弹框载入CSS判断
      defaultOpts = {     // 默认配置
        type: 'confirm',  // 默认为俩个按钮的类confirm弹框
                          // 一个按钮需要设置type:'alert' 此时仅有ok属性可用 cancel属性不可用
                          // 无按钮设置type:'tip'
                          
        className: '',    // 添加在最外层dialog的类名以便于自定义样式
        content: '',      // 需要添加进弹框的html内容
        modal: true,      // 是否需要灰色背景modal
        edgeClose: false,  // 默认点击弹框边缘也可关闭弹框
        timer: null,      // 设置弹框自动关闭
        buttonClickAutoClose: [true, true],
                          // 是否设置点击按钮主动关闭 设置为[false, false]后可通过 dialog.close() 在按钮回调中手动触发关闭;
                          // 按顺序对应确定和取消按钮的设置
                        
        ok: ['确定'],     // 设置确定按钮文字以及点击回调
        cancel: ['取消'], // 设置取消按钮文字以及点击回调
        closeCb: null     // 设置弹框关闭后的公共回调 此方法为统一的公共关闭逻辑(点击按钮和弹框区域外的关闭或者自动关闭)
      };

  function Dialog (options) {
    // 支持同时多个弹框 越后触发的层级越高
    zIndex++;
    // 借鉴jQuery的封装方式 把创建Dialog的方法写在原型中 可以减少一个单独的函数声明
    return new Dialog.prototype.init(options);
  }

  Dialog.prototype = {
    // 初始化用户配置
    init: function (options) {
      this.opts = $.extend({}, defaultOpts, options);
      if (!flag) {
        this.insertCss();
        flag = true;
      }
      // 创建Dialog DOM 塞入Body中
      this.createDom();
      // 初始化绑定事件
      this.bindEvent();
    },
    // 公共css类名
    insertCss: function () {
      var rules = '.g-dialog{display:none;position:fixed;left:0;top:0;right:0;bottom:0}.g-dialog-modal{width:100%;height:100%;background-color:#1e2327;background-color:rgba(30,35,39,.5);filter:alpha(opacity=50)}.g-dialog-sup{position:absolute;left:0;top:0;width:100%;height:100%;display:table}.g-dialog-sub{display:table-cell;vertical-align:middle;text-align:center}.g-dialog-main{position:relative;text-align:left;background-color:#fff;display:inline-block;width:500px;border-radius:5px}.g-dialog-loading{position:absolute;width:100%;height:100%;left:0;top:0;z-index:100;background:url(/images/img-loading.gif) center center no-repeat}.g-dialog-btn{font-size:0;text-align:center}.g-dialog-btn a{width:90pt;height:36px;line-height:36px;font-size:14px;color:#fff;text-decoration:none;background-color:#388bed;display:inline-block;letter-spacing:1px;border-radius:2px;transition:.3s linear}.g-dialog-btn a:hover{background-color:#1c74dc}.g-dialog-enter{-webkit-animation:dialog_enter .4s ease-out forwards;animation:dialog_enter .4s ease-out forwards}.g-dialog-leave_up{-webkit-animation:dialog_leave_up .4s ease-in forwards;animation:dialog_leave_up .4s ease-in forwards}.g-dialog-leave_down{-webkit-animation:dialog_leave_down .25s ease-in forwards;animation:dialog_leave_down .25s ease-in forwards}@-webkit-keyframes dialog_enter{0%{-webkit-transform:translate(0,-200px);transform:translate(0,-200px)}80%{-webkit-transform:translate(0,30px);transform:translate(0,30px)}to{-webkit-transform:translate(0,0);transform:translate(0,0)}}@keyframes dialog_enter{0%{-webkit-transform:translate(0,-200px);transform:translate(0,-200px)}80%{-webkit-transform:translate(0,30px);transform:translate(0,30px)}to{-webkit-transform:translate(0,0);transform:translate(0,0)}}@-webkit-keyframes dialog_leave_up{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}20%{-webkit-transform:translate(0,30px);transform:translate(0,30px)}to{-webkit-transform:translate(0,-200px);transform:translate(0,-200px)}}@keyframes dialog_leave_up{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}20%{-webkit-transform:translate(0,30px);transform:translate(0,30px)}to{-webkit-transform:translate(0,-200px);transform:translate(0,-200px)}}@-webkit-keyframes dialog_leave_down{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}to{-webkit-transform:translate(0,100px);transform:translate(0,100px)}}@keyframes dialog_leave_down{0%{-webkit-transform:translate(0,0);transform:translate(0,0)}to{-webkit-transform:translate(0,100px);transform:translate(0,100px)}}';
      var style = document.createElement('style');
      style.type = 'text/css';
      try {
        style.appendChild(document.createTextNode(rules));
      } catch (e) {
        // 兼容IE的处理方式
        style.styleSheet.cssText = rules;
      }
      $('head').prepend(style);
    },
    createDom: function () {
      var html = '';
      html += '<div class="g-dialog ' + this.opts.className + '" style="z-index: ' + zIndex + ';">';
      if (this.opts.modal) {
        html += '<div class="g-dialog-modal"></div>';
      }
      html += '<div class="g-dialog-sup"><div class="g-dialog-sub"><div class="g-dialog-main g-dialog-enter"><div class="g-dialog-content">';
      html += this.opts.content;
      html += '</div>';
      if (this.opts.type !== 'tip') {
        // 获取按钮配置
        var okCb = this.opts.ok[1];
        // 如果 ok 数组的第二个值为字符串 则识别为url链接
        html += '<div class="g-dialog-btn"><a href="' + (typeof okCb === 'string' ? okCb : 'javascript:;') + '" class="g-dialog-ok">' + this.opts.ok[0] + '</a>';
        if (this.opts.type === 'confirm') {
          var cancelCb = this.opts.cancel[1];
          html += '<a href="' + (typeof cancelCb === 'string' ? cancelCb : 'javascript:;') + '" class="g-dialog-cancel">' + this.opts.cancel[0] + '</a>';
        }
        html += '</div>';
      }
      html += '</div></div></div></div>';
      // 通过this.$dialog保存dialog元素
      this.$dialog = $(html).appendTo('body').fadeIn(300);
    },
    bindEvent: function () {
      var _this = this,
          timer = null;
      // 提供一个公共类 .g-dialog-close 比如右上角的X按钮 点击即可关闭dialog
      this.$dialog.find('.g-dialog-close').click(function () {
        _this.close();
      });
      // dialog自动关闭
      if (this.opts.timer) {
        timer = window.setTimeout(function () {
          _this.close();
        }, this.opts.timer);
      }
      // 点击dialog外的区域是否关闭dialog
      if (this.opts.edgeClose) {
        this.$dialog.on('click', function (e) {
          if (e.target.className.indexOf('g-dialog-sub') > -1) {
            window.clearTimeout(timer);
            _this.close();
          }
        });
      }
      // 绑定确定和取消俩个按钮的点击事件
      if (this.opts.type !== 'tip') {
        $.each(this.opts.type === 'confirm' ? ['ok', 'cancel'] : ['ok'], function (index, item) {
          if (typeof _this.opts[item][1] !== 'string') {
            _this.$dialog.find('.g-dialog-' + item).click(function () {
              window.clearTimeout(timer);
              // 确保动画在执行销毁过程中 再次点击不会执行回调
              !_this.hasRemoved && _this.opts[item][1] && _this.opts[item][1]();
              if (_this.opts.buttonClickAutoClose[index]) {
                _this.close();
              }
            });
          }
        });
      }
    },
    // 有俩种关闭效果 默认'up'为向上淡出, 'down'为向下淡出
    close: function (type) {
      // 确保弹窗关闭后close方法只调用一次
      if (!this.hasRemoved) {
        var _this = this,
            leaveType = type || 'up';
        this.hasRemoved = true;
        this.opts.closeCb && this.opts.closeCb();
        this.$dialog.fadeOut(300).find('.g-dialog-main').removeClass('g-dialog-enter').addClass('g-dialog-leave_' + leaveType);
        // 动画结束后销毁dialog DOM
        window.setTimeout(function () {
          _this.$dialog.remove();
        }, 420);
      } 
    },
    // 设置弹框的loading  'show'为显示 'hide'为隐藏
    request: function (status) {
      if (!this.$loading) {
        this.$loading = $('<div class="g-dialog-loading"></div>');
        this.$dialog.find('.g-dialog-main').append(this.$loading);
      }
      this.$loading[status]();
    }
  };
  // 转换原型链
  Dialog.prototype.init.prototype = Dialog.prototype;
  // 可通过此方法自定义本页面的dialog的初始层级 默认为9999 之后新建的都是在此基础上自增一 而不需要在options中传入每次都要设置
  Dialog.setZIndex = function (index) {
    zIndex = index;
  };

  window.Dialog = Dialog;

})(window, document, jQuery);
