function formatTime(date){
    var hours = date.getHours() + '';
    var minutes = date.getMinutes() + '';
    return (hours.length < 2 ? '0' : '') + hours + ':' + (minutes.length < 2 ? '0' : '') + minutes;
}

/****************************************************/

function getGradient(color1, color2, percent){
    
    function hexToRgb(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return {r: r, g: g, b: b};
    }
    
    function makeChannel(a, b) {
        var num = a + Math.round((b-a)*(percent/100));
        num = Math.max(Math.min(num, 255), 0);
        return num;
    }

    color1 = hexToRgb(color1.substring(1));
    color2 = hexToRgb(color2.substring(1));
    
    var r = makeChannel(color1.r, color2.r);
    var g = makeChannel(color1.g, color2.g);
    var b = makeChannel(color1.b, color2.b);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}