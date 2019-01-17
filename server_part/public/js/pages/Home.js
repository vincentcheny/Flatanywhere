new Vue({
  el: '#list',
  data:{
    object: [
      {message:'Bind'},
      {message:'MyLock'},
      {message:'Store'}
    ]
  },
  methods:{
    jump: function(num){
      $('#hidden_state').val(num);
      $('#userAccount').val($('#currentUser_info').html());
      $("form").submit();
    }
  }
})
