function Angle(angle){
    this.angle = angle;
}

Angle.prototype = {
    angle: 0,

    get: function(){
        return this.angle;
    },
    
    set: function(angle){
        angle += "";
        this.angle = angle * 1;
    },
    
    add: function(angle){
        angle += "";
        this.angle += angle * 1;
    },
    
    normalize: function(){
        this.angle = this.normalized();
    },
    
    normalized: function(){
        var angle = this.angle;
        if (angle < 0) angle = 360 + angle % 360;
        if (angle >= 360) angle = angle % 360;
        
        return angle;
    },
    
    distance: function(angle){
        if (typeof angle !== "object") angle = new Angle(angle);

        var calcAngle = this.normalized() - angle.normalized();
        var isPositive = false;

        if (calcAngle >= 0){
            isPositive = calcAngle <= (360 - Angle.config.oldTimeShow);
            if (!isPositive) calcAngle = 360 - calcAngle;
        } else {
            isPositive = -calcAngle > Angle.config.oldTimeShow;
            if (isPositive) calcAngle += 360;
        }
        
        calcAngle = Math.abs(calcAngle);

        return new Angle(isPositive ? calcAngle : -calcAngle);
    },
    
    toTime: function(){
        var time = new Date();
        var hourAngle = Angle.fromTimeHour(time);
        var milliseconds = this.distance(hourAngle).toMilliseconds();
        return new Date(time.getTime() + milliseconds);
    },
    
    /**
     * 12 hours in 360 degrees
     */
    toMilliseconds: function(){
        return 12 * 60 * 60 * 1000 / 360 * this.angle;
    },
    
    toString: function(){
        return this.get();
    }
}

Angle.config = {
    startAngle: 270,
    oneHourAngle: 30,
    oneMinuteAngle: 6,
    oneSecondAngle: 6,
    oldTimeShow: 30
}

Angle.fromPoint = function(x1, x2, y1, y2){
    x2 = x2 - Math.floor(document.body.clientWidth / 2);
    y2 = y2 - Math.floor(document.body.clientHeight / 2);

    var angle = Math.atan2(x1-x2,y1-y2)*(180/Math.PI);
    angle += 90;
    if(angle < 0){
        angle = Math.abs(angle);
    } else {
        angle = 360 - angle;
    }
    return new Angle(angle);
}

Angle.fromTimeHour = function(time){
    var angle = new Angle(Angle.config.startAngle + Angle.config.oneHourAngle * (time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600));
    angle.normalize();
    return angle;
}
    
Angle.fromTimeMinute = function(time){
    var angle = new Angle(Angle.config.startAngle + Angle.config.oneMinuteAngle * (time.getMinutes() + time.getSeconds() / 60));
    angle.normalize();
    return angle;
}

Angle.fromTimeSecond = function(time){
    var angle = new Angle(Angle.config.startAngle + Angle.config.oneSecondAngle * (time.getSeconds() + time.getMilliseconds() / 1000));
    angle.normalize();
    return angle;
}