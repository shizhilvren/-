var app2 = new Vue({
    el: '#show',
    data: {
        user: [],
        // {
        //     name: '',
        //     vote_num: ''
        //      present:''
        // }
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
            url: '/api/student/get_ans',
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
        // console.log(this.user[0]);
        var sum = 0;
        console.log(data_out.lenght);
        console.log(1 < data_out.length);
        for (var i = 0; i < data_out.length; i++) {
            sum = sum + data_out[i].vote_num;
            console.log(i);
        }
        for (var i = 0; i < data_out.length; i++) {
            data_out[i].present = (data_out[i].vote_num / sum * 100).toFixed(2) + "%";
            data_out[i].present_s = "width:" + data_out[i].present + ";background-color:" + this.color();
        }
        console.log(data_out, 'hear');
        // var height, weight;
        // height = $("tr").height();
        // console.log($("table tr:last").height());
        // $(".test").attr('height', height);
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
        color: function() {
            var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
            // var chars = ['0', '2', '4', '6', '8', 'A', 'C', 'E'];
            var res = "#";
            for (var i = 0; i < 6; i++) {
                var id = Math.ceil(Math.random() * 16);
                res += chars[id];
            }
            return res;
        }
    }
});