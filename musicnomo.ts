const fs = require('fs');

const ph = 11 * 96;
const pw = 8.5 * 96;
const margin_l = .5 * 96;
const margin_r = pw;
const dw = margin_r - margin_l;
const octs = 14;
const notes = octs * 12;
const ow = dw / octs;
const roct = 17;
const dh = roct * ow;
const margin_t = .5 * 96;
const margin_b = margin_t + dh;

const unitw = 1.414 * octs / 4 * ow;

function midiToHz(n: number): number {
    return 440 * Math.pow(2, n / 12 - 69 / 12);
}
function octToOhm(n: number): number {
    return 25 * Math.pow(2, n);
}

function ohmToPx(n: number): number {
    const oct = Math.log2(n / 25);
    return (roct - oct) * ow + margin_t;
}

function capReact(hz: number, f: number) {
    return 1 / (6.28 * f * hz);
}

function indReact(hz: number, f: number) {
    return (6.28 * f * hz);
}

const hz0 = midiToHz(-3);
const hzm = midiToHz(-3 + 12 * octs);
const om0 = octToOhm(0);

console.log(hz0, om0, hzm, capReact(hz0, 1e-6),);


var svg = require('svg-builder')
    .width(pw)
    .height(ph);


// border
svg.line({
    x1: margin_l,
    y1: margin_t,
    x2: margin_r,
    y2: margin_t,
    stroke: '#000000',
    'stroke-width': 2
});
svg.line({
    x1: margin_l,
    y1: margin_t,
    x2: margin_l,
    y2: margin_b,
    stroke: '#000000',
    'stroke-width': 2
});
svg.line({
    x1: margin_r,
    y1: margin_t,
    x2: margin_r,
    y2: margin_b,
    stroke: '#000000',
    'stroke-width': 2
});
svg.line({
    x1: margin_l,
    y1: margin_b,
    x2: margin_r,
    y2: margin_b,
    stroke: '#000000',
    'stroke-width': 2
});



svg.text({
    x: pw / 2,
    y: ph,
    'text-anchor': 'middle',
    'font-family': 'helvetica',
    'font-size': 15,
    stroke: '#000',
    fill: '#000'
}, 'Musical Resonance Nomograph')


function toK(x: number): string {
    if (x < 1e-9) { return (1e12 * x).toPrecision(3) + 'p'; }
    else if (x < 1e-6) { return (x * 1e9).toPrecision(3) + 'n'; }
    else if (x < 1e-3) { return (x * 1e6).toPrecision(3) + 'u'; }
    //else if (x < 1) { return x.toPrecision(3); }
    else if (x < 1000) { return x.toPrecision(3); }
    else if (x < 1000000) { return "" + (x / 1000).toPrecision(3) + 'K' }
    else { return "" + (x / 1000000).toPrecision(3) + 'M' }
}


//octs
for (var i = 1; i < octs; i++) {
    const ox = ow * i + margin_l;
    svg.line({
        x1: ox,
        y1: margin_t,
        x2: ox,
        y2: margin_b,
        stroke: '#000000',
        'stroke-width': 1
    });

    svg.text({
        x: ox,
        y: margin_b + 12,
        'text-anchor': 'middle',
        'font-family': 'helvetica',
        'font-size': 10,
        stroke: '#000',
        fill: '#000'
    }, toK(midiToHz(i * 12 - 3)) + "")
}



//impedance


for (var i = 1; i < roct; i++) {
    const oy = ow * (roct - i) + margin_t;
    svg.line({
        x1: margin_l,
        y1: oy,
        x2: margin_r,
        y2: oy,
        stroke: '#000000',
        'stroke-width': 1
    });

    svg.text({
        x: margin_l - 2,
        y: oy + 1,
        'text-anchor': 'end',
        'dominant-baseline': 'central',
        'font-family': 'helvetica',
        'font-size': 10,
        stroke: '#000',
        fill: '#000'
    }, toK(octToOhm(i)) + "")
}


for (var i = 0; i < 9; i++) {
    const f = Math.pow(10, i) * 1e-12;
    svg.line({
        x1: margin_l,
        y1: ohmToPx(capReact(hz0, f)),
        x2: margin_r,
        y2: ohmToPx(capReact(hzm, f)),
        stroke: '#000000',
        'stroke-width': 1
    });

    const x = margin_l;
    const y = ohmToPx(capReact(hz0, f));

    for (var j = 0; j < 3; j++) {
        svg.text({
            x: x + unitw * (j + 1) - 1,
            y: y - 1,
            'text-anchor': 'middle',
            'alignment-baseline': "bottom",
            'font-family': 'helvetica',
            'font-size': 10,
            transform: 'rotate(45,' + x + ',' + y + ')',
            stroke: '#000',
            fill: '#000'
        }, toK(f) + "F")

    }
}

for (var i = 0; i < 9; i++) {
    const f = Math.pow(10, i) * 100e-6;
    svg.line({
        x1: margin_l,
        y1: ohmToPx(indReact(hz0, f)),
        x2: margin_r,
        y2: ohmToPx(indReact(hzm, f)),
        stroke: '#000000',
        'stroke-width': 1
    });

    const x = margin_l;
    const y = ohmToPx(indReact(hz0, f));

    for (var j = 0; j < 3; j++) {
        svg.text({
            x: x + unitw * (j + 1) - 1,
            y: y - 1,
            'text-anchor': 'middle',
            'alignment-baseline': "bottom",
            'font-family': 'helvetica',
            'font-size': 10,
            transform: 'rotate(-45,' + x + ',' + y + ')',
            stroke: '#000',
            fill: '#000'
        }, toK(f) + "H")

    }
}

fs.writeFileSync("musicnomo.svg", svg.render());

console.log(unitw)