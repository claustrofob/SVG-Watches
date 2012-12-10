function Mark(id){
    this.update = new Date();
    this.time = new Date();

    if (id !== null){
        this.find(id);
    }
}

Mark.prototype = {
    id: null,

    checked: false,

    title: '',

    time: 0,

    update: 0,

    find: function(id){
        this.reset();
        this.id = id;

        var data = localStorage.getItem(id);
        if (data !== null){
            data = JSON.parse(data);
            if (typeof data == 'object'){
                if (data.checked !== null) this.checked = data.checked || false;
                if (data.title !== null) this.title = data.title + "";
                if (data.update !== null) this.update = new Date(data.update);
                if (data.time !== null) this.time = new Date(data.time);
            }
        }
    },

    reset: function(){
        this.id = null;
        this.checked = false;
        this.title = '';
        this.time = new Date();
    },

    remove: function(){
        localStorage.removeItem(this.id);
        this.reset();
    },

    save: function(){
        this.update = new Date();

        var data = {
            checked: this.checked || false,
            title: this.title + "",
            update: this.update.getTime(),
            time: this.time.getTime()
        };

        localStorage.setItem(this.id, JSON.stringify(data));
    }
};