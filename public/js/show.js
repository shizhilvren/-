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
        this.user = data_out;
        // $.ajax({
        //     type: "post",
        //     url: "/api/student/get/",
        //     data: data,
        //     async: false,
        //     success: function(data) {
        //         if (data.flag) {
        //             data_out = data.data;
        //         } else {
        //             alert("您尚未注册");
        //             window.location = '/';
        //         }

        //     }
        // });
    },
    methods: {
        checkeid_check: function(len) {
            console.log(len);
            console.log(this.checkeid.length);
            if (this.checkeid.length > len) {
                this.checkeid.splice(len, this.checkeid.length - len);
                alert("只能选择" + len + "个");
            } else {
                console.log("ok");
            }
        }
    }
});