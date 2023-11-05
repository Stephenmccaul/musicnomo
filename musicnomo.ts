const fs = require("fs");

const standard_values = false;

function musicalNomograph(standard_values: boolean) {
  const ph = 11 * 96;
  const pw = 8.5 * 96;
  const margin_l = 0.5 * 96;
  const margin_r = pw - 0.5 * 96;
  const dw = margin_r - margin_l;
  const octs = 13;
  const notes = octs * 12;
  const ow = dw / octs;
  const roct = 16;
  const dh = roct * ow;
  const margin_t = 0.5 * 96;
  const margin_b = margin_t + dh;
  const unitw = ((1.414 * octs) / 3) * ow;

  function midiToHz(n: number): number {
    return 440 * Math.pow(2, n / 12 - 69 / 12);
  }
  function midiToOct(n: number): number {
    return n / 12 - 69 / 12 + 4;
  }
  function hzToPx(hz: number) {
    return margin_l + Math.log2(hz / midiToHz(-3)) * ow;
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
    return 6.28 * f * hz;
  }

  const hz0 = midiToHz(-3);
  const hzm = midiToHz(-3 + 12 * octs);
  const om0 = octToOhm(0);

  var svg = require("svg-builder").width(pw).height(ph);

  function weight(i: number) {
    if (i == 1) return 2;
    if (i == 5) return 1;
    return 0.5;
  }

  function weight_note(i: number) {
    if (i == 1) return 1;
    return 0.5;
  }

  function toK(x: number, p: number = 3): string {
    if (x < 1e-9) {
      return (1e12 * x).toPrecision(p) + "p";
    } else if (x < 1e-6) {
      return (x * 1e9).toPrecision(p) + "n";
    } else if (x < 1e-3) {
      return (x * 1e6).toPrecision(p) + "u";
    } else if (x < 1) {
      return (x * 1e3).toPrecision(p) + "m";
    } else if (x < 1000) {
      return x.toPrecision(p);
    } else if (x < 1000000) {
      return "" + (x / 1000).toPrecision(p) + "K";
    } else {
      return "" + (x / 1000000).toPrecision(p) + "M";
    }
  }

  function to10K(x: number): string {
    if (x < 1e-9) {
      return "" + Math.round(1e12 * x) + "p";
    } else if (x < 1e-6) {
      return "" + Math.round(x * 1e9) + "n";
    } else if (x < 1e-3) {
      return "" + Math.round(x * 1e6) + "u";
    } else if (x < 1) {
      return "" + Math.round(x * 1e3) + "m";
    } else if (x < 1000) {
      return "" + Math.round(x);
    } else if (x < 1000000) {
      return "" + Math.round(x / 1000) + "K";
    } else {
      return "" + Math.round(x / 1000000) + "M";
    }
  }

  //background **************
  svg.rect({
    "render-order": -1,
    x: 0,
    y: 0,
    width: pw,
    height: ph,
    fill: "#FFFF",
  });
  //capcaitance *************
  if (standard_values) {
    const caps = [
      47e-12, 100e-12, 220e-12, 470e-12, 560e-12, 1e-9, 2.2e-9, 6.8e-9, 10e-9,
      47e-9, 100e-9, 470e-9, 1e-6, 1.5e-6, 2.2e-6, 4.7e-6, 10e-6, 10e-6, 47e-6,
    ];

    for (var i = 0; i < caps.length; i++) {
      const bf = caps[i];
      svg.line({
        x1: margin_l,
        y1: ohmToPx(capReact(hz0, bf)),
        x2: margin_r,
        y2: ohmToPx(capReact(hzm, bf)),
        stroke: "#000000",
        "stroke-width": 1,
      });

      const x = margin_l;
      const y = ohmToPx(capReact(hz0, bf));
      const pos = [300, 820];

      for (var j = 0; j < 2; j++) {
        svg.text(
          {
            x: pos[j] - 2,
            y: y - 2,
            "text-anchor": "middle",
            "alignment-baseline": "bottom",
            "font-family": "helvetica",
            "font-size": 10,
            transform: "rotate(45," + x + "," + y + ")",
            stroke: "#000",
            fill: "#000",
            "font-weight": "lighter",
          },
          toK(bf) + "F"
        );
      }
    }
  } else {
    for (var i = 0; i < 9; i++) {
      const bf = Math.pow(10, i) * 1e-12;

      for (var j = 0; j < 9; j++) {
        const f = bf * (j + 1);
        svg.line({
          x1: margin_l,
          y1: ohmToPx(capReact(hz0, f)),
          x2: margin_r,
          y2: ohmToPx(capReact(hzm, f)),
          stroke: "#000000",
          "stroke-width": weight(j + 1),
        });
      }

      const x = margin_l;
      const y = ohmToPx(capReact(hz0, bf));
      const pos = [300, 820];

      for (var j = 0; j < 2; j++) {
        svg.text(
          {
            x: pos[j] - 2,
            y: y - 2,
            "text-anchor": "middle",
            "alignment-baseline": "bottom",
            "font-family": "helvetica",
            "font-size": 10,
            transform: "rotate(45," + x + "," + y + ")",
            stroke: "#000",
            fill: "#000",
            "font-weight": "lighter",
          },
          to10K(bf) + "F"
        );
      }
    }
  }

  //inductance *************
  if (standard_values) {
  } else {
    for (var i = 0; i < 9; i++) {
      const bf = Math.pow(10, i) * 100e-6;
      for (var j = 0; j < 9; j++) {
        const f = bf * (j + 1);
        svg.line({
          x1: margin_l,
          y1: ohmToPx(indReact(hz0, f)),
          x2: margin_r,
          y2: ohmToPx(indReact(hzm, f)),
          stroke: "#000000",
          "stroke-width": weight(j + 1),
        });
      }

      const x = margin_l;
      const y = ohmToPx(indReact(hz0, bf));

      const pos = [300, 820];

      for (var j = 0; j < 2; j++) {
        svg.text(
          {
            x: pos[j] - 2,
            y: y - 2,
            "text-anchor": "middle",
            "alignment-baseline": "bottom",
            "font-family": "helvetica",
            "font-size": 10,
            transform: "rotate(-45," + x + "," + y + ")",
            stroke: "#000",
            fill: "#000",
            "font-weight": "lighter",
          },
          to10K(bf) + "H"
        );
      }
    }
  }
  //cleanup *************

  svg.rect({ x: 0, y: 0, width: pw, height: margin_t, fill: "#FFFF" });
  svg.rect({
    x: 0,
    y: margin_b,
    width: pw,
    height: ph - margin_b,
    fill: "#FFFF",
  });

  //octs *************

  const hzs = [...Array(octs).keys()].map((i) => {
    return midiToHz(i * 12 - 3);
  });

  for (var i = 0; i < octs; i++) {
    const hz = hzs[i];

    const ox = ow * i + margin_l;

    for (var j = 0; j < 12; j++) {
      const dx = ow * (Math.pow(2, j / 12) - 1);
      svg.line({
        x1: ox + dx,
        y1: margin_t,
        x2: ox + dx,
        y2: margin_b,
        stroke: "#000000",
        "stroke-width": weight_note(j + 1) * 0.5,
      });
    }

    if (i == 0) continue;

    svg.text(
      {
        x: ox,
        y: margin_b + 10,
        "text-anchor": "middle",
        "font-family": "helvetica",
        "font-size": 10,
        stroke: "#000",
        fill: "#000",
      },
      toK(hz) + "Hz"
    );

    svg.text(
      {
        x: ox,
        y: margin_b + 20,
        "text-anchor": "middle",
        "font-family": "helvetica",
        "font-size": 10,
        stroke: "#000",
        fill: "#000",
      },
      "A" + midiToOct(i * 12 - 3) + ""
    );

    svg.text(
      {
        x: ox,
        y: margin_t - 8,
        "text-anchor": "middle",
        "font-family": "helvetica",
        "font-size": 10,
        stroke: "#000",
        fill: "#000",
      },
      toK(hz) + ""
    );

    svg.text(
      {
        x: ox,
        y: margin_t - 20,
        "text-anchor": "middle",
        "font-family": "helvetica",
        "font-size": 10,
        stroke: "#000",
        fill: "#000",
      },
      "A" + midiToOct(i * 12 - 3) + ""
    );
  }

  //impedance

  const ohmse = [...Array(roct).keys()].map((i) => {
    return 25 * Math.pow(2, i);
  });

  const ohmsq = [
    0, 27, 100, 180, 200, 220, 270, 330, 390, 470, 510, 1000, 1200, 1400, 2000,
    2200, 2700, 2700, 3300, 4700, 5100, 5600, 6200, 6800, 10000, 15000, 16000,
    18000, 20000, 22000, 24000, 27000, 27000, 30000, 33000, 36000, 39000, 47000,
    51000, 62000, 66500, 78700, 100000, 120000, 130000, 150000, 180000, 200000,
    220000, 270000, 300000, 330000, 442000, 470000, 1000000,
  ];

  const ohms = standard_values ? ohmsq : ohmse;

  for (var i = 1; i < ohms.length; i++) {
    const oy = ohmToPx(ohms[i]); //ow * (roct - i) + margin_t;
    svg.line({
      x1: margin_l,
      y1: oy,
      x2: margin_r,
      y2: oy,
      stroke: "#000000",
      "stroke-width": 1,
    });

    svg.text(
      {
        x: margin_l - 2,
        y: oy + 1,
        "text-anchor": "end",
        "dominant-baseline": "central",
        "font-family": "helvetica",
        "font-size": 9,
        stroke: "#000",
        fill: "#000",
        "font-weight": "lighter",
      },
      toK(ohms[i]) + "Ω"
    );

    svg.text(
      {
        x: margin_r + 2,
        y: oy + 1,
        "text-anchor": "start",
        "dominant-baseline": "central",
        "font-family": "helvetica",
        "font-size": 9,
        stroke: "#000",
        fill: "#000",
        "font-weight": "lighter",
      },
      toK(ohms[i]) + "Ω"
    );
  }

  // border ****************

  svg.line({
    x1: margin_l,
    y1: margin_t,
    x2: margin_r,
    y2: margin_t,
    stroke: "#000000",
    "stroke-width": 2,
  });
  svg.line({
    x1: margin_l,
    y1: margin_t,
    x2: margin_l,
    y2: margin_b,
    stroke: "#000000",
    "stroke-width": 2,
  });
  svg.line({
    x1: margin_r,
    y1: margin_t,
    x2: margin_r,
    y2: margin_b,
    stroke: "#000000",
    "stroke-width": 2,
  });
  svg.line({
    x1: margin_l,
    y1: margin_b,
    x2: margin_r,
    y2: margin_b,
    stroke: "#000000",
    "stroke-width": 2,
  });

  //title ****************

  svg.text(
    {
      x: pw / 2,
      y: ph - 96 / 4,
      "text-anchor": "middle",
      "font-family": "helvetica",
      "font-size": 15,
      stroke: "#000",
      fill: "#000",
    },
    "Musical Reactance Nomograph"
  );

  svg.text(
    {
      x: pw / 2,
      y: ph - 96 / 8,
      "text-anchor": "middle",
      "font-family": "helvetica",
      "font-size": 10,
      stroke: "#000",
      fill: "#000",
    },
    "stephen@noiseengineering.us"
  );

  // instruments *******************

  const inst_height = 10;

  function inst(svg: any, hz0: number, hz1: number, row: number, name: string) {
    const x0 = hzToPx(hz0);
    const x1 = hzToPx(hz1);
    const y0 = ph - inst_height * (row + 5);

    svg.line({
      x1: x0,
      y1: y0,
      x2: x1,
      y2: y0,
      stroke: "#000000",
      "stroke-width": 1,
    });

    svg.line({
      x1: x0,
      y1: y0 - inst_height + 2,
      x2: x0,
      y2: y0,
      stroke: "#000000",
      "stroke-width": 1,
    });

    svg.line({
      x1: x1,
      y1: y0 - inst_height + 2,
      x2: x1,
      y2: y0,
      stroke: "#000000",
      "stroke-width": 1,
    });

    svg.text(
      {
        x: (x0 + x1) / 2,
        y: y0 - 2,
        "text-anchor": "middle",
        "font-family": "helvetica",
        "font-size": 8,
        stroke: "#000",
        fill: "#000",
      },
      name
    );

    return svg;
  }

  //inst(svg, 100, 0, 300, "piano")
  //inst(svg, 100, 1, 300, "guitar")
  //inst(svg, 100, 2, 300, "bass")
  //inst(svg, 100, 3, 300, "test")
  //inst(svg, 100, 4, 300, "test")
  inst(svg, 41, 98, 1, "bass");
  inst(svg, 82, 330, 2, "guitar");
  inst(svg, 27.5, 4186, 3, "piano");
  inst(svg, 8, 12543, 4, "midi");

  return svg.render();
}
// save ***************

fs.writeFileSync("musicnomo.svg", musicalNomograph(false));
fs.writeFileSync("stdnomo.svg", musicalNomograph(true));
