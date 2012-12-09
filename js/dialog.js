function EventDialog(clock){
    this.clock = clock;

    this.timeNode = Element.find('setTime');
    this.textNode = Element.find('eventName');
    this.removeButton = Element.find('eventButtonRemove');
    this.form = Element.find('eventForm');
    this.prompt = Element.find('eventPrompt');
}

EventDialog.prototype = {
    show: function(angle){
        var thisObj = this;
        
        var angle = new Angle(angle);
        var markObj = new Mark(angle.get());

        this.timeNode.html(formatTime(angle.toTime()));
        this.textNode.val(markObj.title);
        
        this.removeButton.on("click", function(){
            thisObj.remove(angle);
        });
        
        this.form.on("submit", function(e){
            e.preventDefault();
            thisObj.submit(angle, thisObj.textNode.val());
            return false;
        });
    
        markObj.checked = true;
        markObj.time = angle.toTime();
        markObj.save();
    
        this.prompt.addClass('visible');
        
        this.clock.updateMarks();
    },
    
    remove: function(angle){
        this.close();
        
        var markObj = new Mark(angle.get());
        markObj.checked = false;
        markObj.save();
        
        this.clock.updateMarks();
    },
    
    submit: function(angle, title){
        this.close();
        
        var markObj = new Mark(angle.get());
        markObj.checked = true;
        markObj.title = title;
        markObj.time = angle.toTime();
        markObj.save();
        
        this.clock.updateMarks();
    },
    
    close: function(){
        this.prompt.removeClass('visible');
    }
}