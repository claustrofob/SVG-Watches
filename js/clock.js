function Clock(){
    this.options = {
        markStep: 5,
        stopDelay: 200, //milliseconds
        moveSpeed: 1/4, //1 is the speed of mouse
        marksUpdateInterval: 60000, // in milliseconds
        timeUpdateInterval: 1000, // in milliseconds
        boundColors: {
            "-50": "#960018",
            "-20": "#ff0000", //angle: color (only 6-digit hex)
            "70": '#f4c430',
            "120": '#34c924',
            "300": '#2e8b57'
        }
    };

    this.hoursArrow = Element.find('hours');
    this.minutesArrow = Element.find('minutes');
    this.secondsArrow = Element.find('seconds');

    this.lastMarksUpdateTime = new Date();

    this.createMarks();

    this.activeMark = null;

    this.clockface = Element.find('clockface');
    var body = new Element(document.body);
    this.eventsEnabled = true;
    this.attachTouchEvents(this.clockface, body);
    this.attachMouseEvents(this.clockface, body);

    this.isMarkReady = false;
    this.stopTimeout = null;

    this.speedTimeBlock = Element.find('speedTimeBlock');
    this.speedTime = Element.find('speedTime');
    this.speedTimeMarker = Element.find('speedTimeMarker');
    this.speedTimeCover = Element.find('speedTimeCover');

    this.eventDialog = new EventDialog(this);

    this.touchStartAngle = null;
    this.currentAngle = null;

    this.initServiceButtons();

    this.boundAngles = [];
    for (var i in this.options.boundColors){
        this.boundAngles.push(parseInt(i));
    }

    this.boundAngles.sort(function(a,b){return a-b;});
}

Clock.prototype = {
    disableEvents: function(){
        this.eventsEnabled = false;
    },

    enableEvents: function(){
        this.eventsEnabled = true;
    },

    start: function(){
        var thisObj = this;

        this.updateMarks();
        this.updateTime();
        setInterval(function(){
            thisObj.updateTime();
        }, this.options.timeUpdateInterval);

        this.clockface.addClass('active');
    },

    initServiceButtons: function(){
        var thisObj = this;
        Element.find('clearButton').on("click", function(e){
            e.preventDefault();
            localStorage.clear();
            thisObj.updateMarks();
        });

        Element.find('reloadButton').on("click", function(e){
            e.preventDefault();
            alert('Reload data. Coming soon...');
        });
    },

    attachTouchEvents: function(element, body){
        var thisObj = this;
        var isTouchStart = false;

        element.on("touchstart", function(e){
            e.preventDefault();

            if (isTouchStart) return;
            isTouchStart = true;

            var touch = e.touches[0];
            thisObj.startHighlightMark(touch.pageX, touch.pageY);
            thisObj.highlightMark(touch.pageX, touch.pageY);
        });

        body.on("touchmove", function(e){
            e.preventDefault();
            if (isTouchStart){
                var touch = e.touches[0];
                thisObj.highlightMark(touch.pageX, touch.pageY);
            }
        });

        body.on("touchend", function(){
            isTouchStart = false;
            thisObj.stopHighlightMark();
        });
    },

    attachMouseEvents: function(element, body){
        var thisObj = this;
        var isMouseDown = false;

        element.on("mousedown", function(e){
            e.preventDefault();

            if (isMouseDown) return;
            isMouseDown = true;

            thisObj.startHighlightMark(e.pageX, e.pageY);
            thisObj.highlightMark(e.pageX, e.pageY);
        });

        body.on("mousemove", function(e){
            e.preventDefault();
            if (isMouseDown){
                thisObj.highlightMark(e.pageX, e.pageY);
            }
        });

        body.on("mouseup", function(){
            isMouseDown = false;
            thisObj.stopHighlightMark();
        });
    },

    startHighlightMark: function(x, y){
        if (!this.eventsEnabled) return;

        this.touchStartAngle = Angle.fromPoint(0, x, 0, y);
        this.currentAngle = new Angle(this.touchStartAngle.get());
        this.activeMark = null;
    },

    highlightMark: function(x, y){
        if (!this.eventsEnabled) return;

        var thisObj = this;

        var angle = Angle.fromPoint(0, x, 0, y);
        var diffAngle = angle.get() - this.currentAngle.normalized();
        if (Math.abs(diffAngle) > 180) {
            var sign = diffAngle <= 0 ? 1 : -1;
            diffAngle = (360 - Math.abs(diffAngle)) * sign;
        }

        this.currentAngle.add(diffAngle);

        angle.set(this.touchStartAngle.get() + (this.currentAngle.get() - this.touchStartAngle.get()) * this.options.moveSpeed);
        angle.set(Math.round(angle.get() / this.options.markStep) * this.options.markStep + 180);
        angle.normalize();

        var mark = Element.find(this.getMarkId(angle.get()));
        if (!mark || (this.activeMark && mark.attr('data-angle') == this.activeMark.attr('data-angle'))) return;

        if (this.stopTimeout) clearTimeout(this.stopTimeout);

        this.isMarkReady = false;
        this.stopTimeout = setTimeout(function(){
            thisObj.setMarkReady(mark);
        }, this.options.stopDelay);

        this.activeMark = mark;

        this.showSpeedTime(angle);
    },

    stopHighlightMark: function(){
        if (!this.eventsEnabled) return;
        if (!this.activeMark) return;

        if (this.isMarkReady){
            this.eventDialog.show(this.activeMark.attr('data-angle'));
        }

        this.activeMark = null;
        this.hideSpeedTime();
    },

    setMarkReady: function(mark){
        this.isMarkReady = true;
    },

    showSpeedTime: function(angle){
        var textTime = formatTime(angle.toTime());
        this.speedTime.text(textTime);
        this.speedTimeBlock.attr('display', 'inline');

        var time = new Date();
        var hourAngle = Angle.fromTimeHour(time);
        var distance = angle.distance(hourAngle);
        var color = this.getFillColor(distance);

        this.speedTimeMarker.transform("rotate", angle.get());
        this.speedTimeMarker.attr('fill', color);
        this.speedTimeCover.attr('fill', color);
    },

    hideSpeedTime: function(){
        this.speedTimeBlock.attr('display', 'none');
    },

    getMarkId: function(id){
        return 'mark_' + id;
    },

    updateTime: function(){
        var time = new Date();

        this.hoursArrow.transform("rotate", Angle.fromTimeHour(time).get());
        this.minutesArrow.transform("rotate", Angle.fromTimeMinute(time).get());
        this.secondsArrow.transform("rotate", Angle.fromTimeSecond(time).get());

        if ((time.getTime() - this.lastMarksUpdateTime.getTime()) > this.options.marksUpdateInterval){
            this.updateMarks();
        }
    },

    updateMarks: function(){
        var time = new Date();
        var hourAngle = Angle.fromTimeHour(time);

        var testTime = (new Angle(60)).toMilliseconds();

        for (var angle = 0; angle < 360; angle += this.options.markStep){
            var oAngle = new Angle(angle);

            var markObj = new Mark(oAngle.get());
            if (markObj.checked && (time.getTime() - markObj.time.getTime() > testTime)){
                markObj.checked = false;
                markObj.save();
            }

            var mark = Element.find(this.getMarkId(oAngle.get()));
            if (!mark) continue;

            var distance = oAngle.distance(hourAngle);

            mark.attr({
                "fill": markObj.checked ? this.getFillColor(distance) : '#eee',
                "fill-opacity": this.getOpacity(distance)
            });
        }

        this.lastMarksUpdateTime = time;
    },

    createMarks: function(){
        var clockmarkslive = Element.find('clockmarkslive');
        var touchTextureBlock = Element.find('touchTextureBlock');

        for (var angle = 0; angle < 360; angle += this.options.markStep){
            var oAngle = new Angle(angle);

            var textureElement = this.drawTouchTexture(oAngle);
            touchTextureBlock.append(textureElement);

            var markElement = this.drawMark(oAngle);
            clockmarkslive.append(markElement);
        }
    },

    drawMark: function(angle){
        var useId = '';
        if (!(angle.get() % Angle.config.oneHourAngle)){
            useId = 'markPrototype';
        } else {
            useId = 'smallMarkPrototype';
        }

        var mark = Element.use(useId);
        mark.attr({
            "id": this.getMarkId(angle.get()),
            "data-angle": angle.get()
        });

        mark.transform("rotate", angle.get());

        return mark;
    },

    drawTouchTexture: function(angle){
        var textureElement = Element.use('touchTexture');
        textureElement.transform("rotate", angle.get());
        return textureElement;
    },

    getFillColor: function(dist){
        var i;
        var bottomBound = false, topBound = false;

        for (i in this.boundAngles){
            var angle = this.boundAngles[i];
            if (dist.get() <= angle){
                topBound = angle;
                break;
            } else {
                bottomBound = angle;
            }
        }

        if (topBound === false) topBound = bottomBound;
        if (bottomBound === false) bottomBound = topBound;

        var percent = 100;
        if (topBound != bottomBound){
            percent = Math.abs(topBound - dist.get()) * 100 / Math.abs(topBound - bottomBound);
        }

        return getGradient(this.options.boundColors[topBound + ''], this.options.boundColors[bottomBound + ''], percent);
    },

    getOpacity: function(dist){
        var opacityStep = dist.get() > 0 ? 1 / 400 : 0;
        var opacity = 1 - Math.abs(dist.get()) * opacityStep;
        return opacity;
    }
};