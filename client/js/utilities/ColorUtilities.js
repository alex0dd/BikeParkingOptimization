function rgbComponentToHex(component) {
    var hex = Math.round(Number(component)).toString(16);
    if (hex.length < 2) {
         hex = "0" + hex;
    }
    return hex;
};

export function rgbToHex(r,g,b) {   
    var red = rgbComponentToHex(r);
    var green = rgbComponentToHex(g);
    var blue = rgbComponentToHex(b);
    return red+green+blue;
};