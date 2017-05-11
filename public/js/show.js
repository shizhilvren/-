function alert_my(str, type) {
    var msg = '<div class="alert alert-' + type + ' alert_my" role="alert" id="alert">' + str + '</div>';
    $("body").prepend(msg);
    $("#alert").fadeIn(100);
    setTimeout(function() {
        $("#alert").fadeOut('slow', function() {
            $("#alert").remove();
        });
    }, 1000);
    setTimeout(function() {
        $("#alert").remove();
    }, 3000);
}



var app2 = new Vue({
    el: '#show',
    data: {
        user: [],
        // {
        //     name: '',
        //     img_path: '',
        //     meg: ''
        // }
        checkeid: []
    },
    mounted: function() {
        var url = window.location.href;
        var uid = url.split('/').reverse()[0];
        var data = {
            uid: uid
        }
        var data_out = [];
        $.ajax({
            type: 'post',
            url: '/api/student/get_all',
            data: data,
            async: false,
            success: function(data) {
                if (data.flag) {
                    console.log(data.data);
                    data_out = data.data;
                } else {
                    console.log('err');
                }
            }
        });
        for (var i = 0; i < data_out.length; i++) {
            data_out[i].chose_msg = '点击选择';
            data_out[i].class = 'btn-info';
        }
        this.user = data_out;
    },
    methods: {
        checkeid_check: function(len) {
            if (this.checkeid.length > len) {
                this.checkeid.splice(len, this.checkeid.length - len);
                alert_my("只能选择" + len + "个", " warning");
                // alert("只能选择" + len + "个");
                return;
            } else {
                // console.log("ok");
            }
            for (var i = 0; i < this.user.length; i++) {
                this.user[i].chose_msg = '点击选择';
                this.user[i].class = 'btn-info';
            }
            for (var j in this.checkeid) {
                var uid = this.checkeid[j];
                for (var i = 0; i < this.user.length; i++) {
                    if (this.user[i]._id == uid) {
                        this.user[i].chose_msg = '已选择';
                        this.user[i].class = 'btn-warning';
                        break;
                    }
                }
            }

        },
        vote: function() {
            if (this.checkeid.length != 3) {
                alert_my('您需要投三张票', 'warning')
                    // alert('您需要投三张票');
                return;
            }
            var data = {
                uid: window.location.href.split('/').reverse()[0],
                _id: this.checkeid
            }
            $.ajax({
                type: 'post',
                url: '/api/student/vote',
                data: data,
                async: false,
                success: function(data) {
                    console.log(data);
                    if (data.flag) {
                        console.log("true");
                        alert_my('投票成功', 'success');
                        // alert("投票成功");
                    } else {
                        console.log("false");
                        alert_my('投票失败<br>' + '您今天已经投过了', 'warning');
                        // alert(data.data.meg);
                    }
                }
            });
            // $.post('/api/student/vote', data, function(data) {
            //     console.log(data);
            //     if (data.flag) {
            //         console.log("true");
            //         alert("投票成功");
            //         // window.location.href = '/static/show/' + window.location.href.split('/').reverse()[0];
            //     } else {
            //         console.log("false");
            //         alert(data.data.meg);
            //     }
            // });
            var url = window.location.href;
            var uid = url.split('/').reverse()[0];
            var data = {
                uid: uid
            }
            var data_out = [];
            $.ajax({
                type: 'post',
                url: '/api/student/get_all',
                data: data,
                async: false,
                success: function(data) {
                    if (data.flag) {
                        console.log(data.data);
                        data_out = data.data;
                    } else {
                        console.log('err');
                    }
                }
            });
            for (var i = 0; i < data_out.length; i++) {
                data_out[i].chose_msg = '点击选择';
                data_out[i].class = 'btn-info';
            }
            this.user = data_out;
            this.checkeid = [];
        }
    }
});