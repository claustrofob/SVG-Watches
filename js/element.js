function Element(node){
    if (!node) throw new Error("DOM element required");
    this.node = node;
}

Element.prototype = {
    getNode: function(){
        return this.node;
    },

    append: function(element){
        this.getNode().appendChild(element.getNode());
    },

    appendTo: function(element){
        element.getNode().appendChild(this.getNode());
    },

    attr: function(attr, value){
        if (typeof attr !== "object"){
            if (value === undefined){
                return this.getNode().getAttribute(attr);
            }

            var attrName = attr;
            attr = {};
            attr[attrName] = value;
        }

        for (var x in attr){
            var attrParts = x.split(':', 2);
            if (attrParts.length == 2 && attrParts[0] == 'xlink'){
                this.getNode().setAttributeNS(Element.xlinkNS, attrParts[1], attr[x]);
            } else {
                this.getNode().setAttributeNS(null, x, attr[x]);
            }
        }
    },

    html: function(html){
        this.getNode().innerHTML = html;
    },

    text: function(text){
        var textNode = document.createTextNode(text);

        var children = this.getNode().childNodes;
        while(children.length) {
            this.getNode().removeChild(children[0]);
        }
        this.getNode().appendChild(textNode);
    },

    val: function(value){
        if (value === undefined){
            return this.getNode().value;
        }
        this.getNode().value = value;
    },

    on: function(event, callback){
        event = "on" + event;
        this.getNode()[event] = callback;
    },

    transform: function(type){
        var args = Array.prototype.slice.call(arguments);
        var strArgs = args.slice(1).join(",");
        this.attr("transform", type + "(" + strArgs + ")");
    },

    getClassList: function(){
        var attrClass = this.getNode().getAttribute('class');
        var classes = attrClass.split(/\s+/);
        var fClasses = [];
        for (var i in classes){
            if (classes[i].length) fClasses.push(classes[i]);
        }

        return fClasses;
    },

    setClassList: function(classes){
        this.getNode().setAttributeNS(null, 'class', classes.join(" "));
    },

    addClass: function(className){
        var classes = this.getClassList();
        for (var i in classes){
            if (classes[i] == className){
                return;
            }
        }

        classes.push(className);
        this.setClassList(classes);
    },

    removeClass: function(className){
        var classes = this.getClassList();
        for (var i in classes){
            if (classes[i] == className){
                delete classes[i];
                this.setClassList(classes);
                return;
            }
        }
    }
};

Element.xmlNS = "http://www.w3.org/2000/svg";
Element.xlinkNS = "http://www.w3.org/1999/xlink";

Element.create = function(tag){
    var node = document.createElementNS(Element.xmlNS, tag);
    return new Element(node);
};

Element.use = function(id){
    var el = Element.create('use');
    el.attr("xlink:href", '#' + id);
    return el;
};

Element.find = function(id){
    var node = document.getElementById(id);
    if (!node) return false;

    return new Element(node);
};