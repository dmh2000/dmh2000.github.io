;
/*eslint no-extra-semi:0 */

/**
 * @module
 *
 * @desc
 * The svg_ac_inst module returns an object that contains 6 instrument factories:<br/>
 * {@link svg_ac_inst:Airspeed}  : returns an {@link AirspeedInstance}<br/>
 * {@link svg_ac_inst:Altimeter} : returns an {@link AltimeterInstance}<br/>
 * {@link svg_ac_inst:Attitude}  : returns an {@link AttitudeInstance}<br/>
 * {@link svg_ac_inst:Heading}   : returns a {@link HeadingInstance}<br/>
 * {@link svg_ac_inst:Turn}      : returns a {@link TurnInstance}<br/>
 * {@link svg_ac_inst:VSI}       : returns a {@link VSIInstance}<br/>
 */
var svg_ac_inst = (function (global) {
  'use strict';

  var ns = 'http://www.w3.org/2000/svg';

  // svg element header
  var svg_def = {
    name: 'svg',
    attr: [
      ['xmlns', 'http://www.w3.org/2000/svg'],
      ["width", "200px"],
      ["height", "200px"],
      ["viewBox", "0 0 100 100"]
    ]
  };

  /**
   * background rect
   */
  var background_def = {
    name: 'rect',
    attr: [
      ['x', '0'],
      ['y', '0'],
      ['width', '100'],
      ['height', '100'],
      ['fill', '#000']
    ]
  };

  /**
   * dial rect
   */
  var dial_def = {
    name: 'ellipse',
    attr: [
      ["stroke", '#fff'],
      ['stroke-width', '0.5'],
      ['cx', '50'],
      ['cy', '50'],
      ['rx', '49'],
      ['ry', '49']
    ]
  };

  // =============================
  // needle
  // =============================

  /**
   * needle indicator line
   */
  var needle_path_def = {
    name: 'path',
    attr: [
      ['d', "M0,0 L0,0.5 L40,1 L45,0 L40,-1 L0,-0.5 L0,0 z"],
      ['stroke', '#fff'],
      ['fill', '#fff']
    ]
  };

  /**
   * needle center
   */
  var needle_center_def = {
    name: 'ellipse',
    attr: [
      ['cx', '0'],
      ['cy', '0'],
      ['rx', '4'],
      ['ry', '4'],
      ['fill', '#444']
    ]
  };

  /**
   * needle tail line
   */
  var needle_tail_def = {
    name: 'line',
    attr: [
      ['stroke-width', '3.0'],
      ['stroke', '#444'],
      ['x1', '-10.0'],
      ['y1', '0.0'],
      ['x2', '0.0'],
      ['y1', '0.0']
    ]
  };

  /**
   * needle tail circle
   */
  var needle_tail2_def = {
    name: 'ellipse',
    attr: [
      ['cx', '-10.0'],
      ['cy', '0'],
      ['rx', '3'],
      ['ry', '3'],
      ['fill', '#444']
    ]
  };

  /**
   * altimeter drum text
   */
  var alt_drum_text_def = {
    name: 'text',
    attr: [
      ["stroke", '#000'],
      ['stroke-width', '0.1'],
      ["fill", "#fff"],
      ['x', '50'],
      ['y', '36'],
      ["font-family", 'sans-serif'],
      ['font-size', '10'],
      ['text-anchor', 'middle']
    ]
  };

  /**
   * generic group
   */
  var needle_group_def = {
    name: 'g',
    attr: []
  };

  var standard_group_def = {
    name: 'g',
    attr: [
      ["fill", "#fff"],
      ["stroke", '#fff'],
      ['stroke-width', '0.5'],
      ["font-family", 'sans-serif'],
      ['font-size', '8'],
      ['text-anchor', 'middle']
    ]
  };

  /**
   * altimeter pressure setting text
   */
  var alt_pressure_text_def = {
    name: 'text',
    attr: [
      ["fill", "#fff"],
      ['x', '50'],
      ['y', '66'],
      ["font-family", 'sans-serif'],
      ['font-size', '6'],
      ['text-anchor', 'middle']
    ]
  };

  var vsi_group6_def = {
    name: 'g',
    attr: [
      ["stroke", '#fff'],
      ['stroke-width', '0.3'],
      ["fill", "#fff"],
      ["font-family", 'courier new'],
      ['font-size', '6'],
      ['text-anchor', 'middle']
    ]
  };

  /**
   * create a string from a floating point number with padding and specified factional digits
   * @param {number} f value to format
   * @param {number} size width of field
   * @param {number} fract of fractional digits
   * @return {string} padded string
   * @inner
   */
  function pad(f, size, fract) {
    return ('000000000' + f.toFixed(fract)).substr(-size);
  }

  /**
   * create an element with a spedified namespace
   * required to svg elements
   * @param {string} name name of element
   * @param {object} attr array of pairs of attributes
   * @param {string} id id of element if any (may be omitted)
   * @return {object} constructed element
   * @inner
   */
  function _createElementSvg(name, attr, id) {
    // create the element with the specified name
    var e = global.createElementNS(ns, name);

    // add an id if specified
    if (id) {
      e.setAttribute('id', id);
    }

    // add any attributes specified
    attr.forEach(function (v) {
      e.setAttribute(v[0], v[1]);
    });

    return e;
  }

  function drawLine(x1, y1, x2, y2, stroke_width) {
    var e;
    e = global.createElementNS(ns, 'line');
    if (stroke_width) {
      e.setAttribute('stroke-width', stroke_width);
    }
    e.setAttribute('x1', x1);
    e.setAttribute('y1', y1);
    e.setAttribute('x2', x2);
    e.setAttribute('y2', y2);
    return e;
  }

  function drawText(x, y, text, font_size) {
    var e;
    e = global.createElementNS(ns, 'text');
    e.setAttribute('x', x);
    e.setAttribute('y', y);
    if (font_size) {
      e.setAttribute('font-size', font_size);
    }
    e.textContent = text;
    return e;
  }

  // x position for altitude numbers
  var tx = [50, 71, 85, 85, 70.5, 50, 29, 15, 15, 29];
  // y position for altitude numbers
  var ty = [16.75, 22.5, 41, 65, 82, 88, 82, 65, 41, 22.75];

  /**
   * generate the ticks for the altimeter
   * @param {object} parent element that ticks will be attached to
   * @inner
   */
  function altimeterTicks(parent) {
    "use strict";
    var r3 = 45.0;
    var r1 = 40.0;
    var r2 = 49.0;
    var cx = 50.0;
    var cy = 50.0;
    var a = 270.0 * (Math.PI / 180.0);
    var da = Math.PI / 25;
    var x1;
    var y1;
    var x2;
    var y2;
    var index;
    var alt;
    var e;
    var g;

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    parent.appendChild(g);

    alt = 0;
    index = 0;
    for (var i = 0; i < 50; ++i) {
      if ((i % 5) == 0) {
        // bold tick with number
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1, y1, x2, y2, 1);
        g.appendChild(e);

        e = drawText(tx[alt].toFixed(1),ty[alt].toFixed(1),alt.toFixed(0));
        e.setAttribute('text-anchor', 'middle');
        g.appendChild(e);
        alt++;
        index++;
      }
      else {
        // thin tick
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1, y1, x2, y2, 0.5);
        g.appendChild(e);
      }
      a += da;
    }
  }

  // airspeed annotation locations
  var txc2 = ['52.62', '54.22', '69.75', '82.94', '85.90', '77.18', '59.87', '39.74', '23.26', '15.79', '19.57', '31.92'];
  var tyc2 = ['62.69', '25.60', '22.20', '37.26', '58.74', '77.73', '88.42', '88.00', '76.65', '57.45', '36.37', '22.18'];


  /**
   * generate the ticks for airspeed dial
   * @param {object} parent element that ticks will be attached to
   * @param {number} dspeed speed increment between ticks (right now only works properly for 20)
   * @inner
   */
  function airspeedTicks(parent, dspeed) {
    "use strict";
    var r3 = 45.0;
    var r1 = 42.0;
    var r2 = 49.0;
    var cx = 50.0;
    var cy = 50.0;
    var a = 270.0 * (Math.PI / 180.0);
    var da = Math.PI / 22;
    var x1;
    var y1;
    var x2;
    var y2;
    var index;
    var speed;
    var e;
    var g;

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    parent.appendChild(g);

    speed = dspeed;
    index = 2;
    for (var i = 0; i < 44; ++i) {
      if ((i == 0) || (i == 2)) {
        // skip
      }
      else if ((i % 4) == 0) {
        // bold tick with number
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);

        e = drawText(txc2[index],tyc2[index],speed.toFixed(0));
        e.setAttribute('text-anchor', 'middle');
        g.appendChild(e);
        speed += dspeed;
        index++;
      }
      else if ((i % 2) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);
      }
      else {
        // thin tick
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2, 0.5);
        g.appendChild(e);
      }
      a += da;
    }
  }

  var vsi_y = [18, 29, 52, 78, 88, 78, 52.5, 27];
  var vsi_x = [50, 73, 82, 73, 50, 25, 14, 25];
  var vsi_t = ['10', '15', '20', '15', '10', '5', '0', '5'];

  function vsiTicks(parent) {
    "use strict";
    var r3 = 45.0;
    var r1 = 40.0;
    var r2 = 49.0;
    var cx = 50.0;
    var cy = 50.0;
    var a = 270.0 * (Math.PI / 180.0);
    var da = Math.PI / 20;
    var x1;
    var y1;
    var x2;
    var y2;
    var index;
    var e;
    var g;

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    parent.appendChild(g);

    index = 0;
    for (var i = 0; i < 40; ++i) {
      if ((i == 9) || (i == 11)) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);
      }
      else if (i == 10) {
        e = drawText( vsi_x[index],vsi_y[index],vsi_t[index]);
        e.setAttribute('text-anchor', 'middle');
        g.appendChild(e);
        index++;
      }
      else if ((i % 5) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;

        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);

        e = drawText( vsi_x[index],vsi_y[index],vsi_t[index]);
        e.setAttribute('text-anchor', 'middle');
        g.appendChild(e);
        index++;
      }
      else {
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2);
        g.appendChild(e);
      }
      a += da;
    }
  }

  function headingDial(parent, id) {
    "use strict";
    var r3 = 45.0;
    var r1 = 43.0;
    var r2 = 49.0;
    var r4 = 36.0;
    var cx = 0.0;
    var cy = 0.0;
    var a = 270.0 * (Math.PI / 180.0);
    var da = Math.PI / 36;
    var x1;
    var y1;
    var x2;
    var y2;
    var x4;
    var y4;
    var d;
    var e;
    var g;
    var t;

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, id + '-dial');
    g.setAttribute('transform', 'translate(50 50) rotate(0)');
    parent.appendChild(g);

    d = 0;
    for (var i = 0; i < 72; ++i) {
      if ((i % 6) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        x4 = Math.cos(a) * r4 + cx;
        y4 = Math.sin(a) * r4 + cy;

        // <line stroke-width='1.0' x1='-0.00' y1='-43.00' x2='-0.00' y2='-49.00' />
        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);

        // <text transform='translate(-0.00 -36.00) rotate(0)' >0</text>
        t = "translate(";
        t += x4.toFixed(2) + " " + y4.toFixed(2);
        t += ") ";
        t += "rotate(";
        t += d.toFixed(0);
        t += ")";
        e = global.createElementNS(ns, 'text');
        e.textContent = (d / 10).toFixed(0);
        e.setAttribute('transform', t);
        g.appendChild(e);

        d += 30.0;
      }
      else if ((i % 2) == 0) {
        x1 = Math.cos(a) * r1 + cx;
        y1 = Math.sin(a) * r1 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2, 1.0);
        g.appendChild(e);
      }
      else {
        x1 = Math.cos(a) * r3 + cx;
        y1 = Math.sin(a) * r3 + cy;
        x2 = Math.cos(a) * r2 + cx;
        y2 = Math.sin(a) * r2 + cy;
        e = drawLine(x1, y1, x2, y2);
        g.appendChild(e);
      }

      a += da;
    }
  }

  function vsiAnnotation(svg) {
    var g;
    var e;

    // <g fill='#fff' stroke='#fff' stroke-width='0.3' font-family='courier new' font-size='6'>
    g = _createElementSvg(vsi_group6_def.name, vsi_group6_def.attr, null);
    svg.appendChild(g);

    // <text text-anchor='middle' x='50' y='37' >VERTICAL</text>
    e = drawText(50,37,"VERTICAL");
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='43'>SPEED</text>
    e = drawText(50,43,'SPEED');
    g.appendChild(e);

    // <text text-anchor='left' x='14' y='43'>up</text>
    e = drawText(14,43,'up');
    g.appendChild(e);

    // <text text-anchor='left' x='14' y='61'>down</text>
    e = drawText(14,61,'down');
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='67'>100 ft</text>
    e = drawText(50,67,'100 ft');
    g.appendChild(e);

    // <text text-anchor='middle' x='50' y='72'>per min</text>
    e = drawText(50,72,'per min');
    g.appendChild(e);
  }

  /**
   * create an arc for the airspeed indicator
   * with the given parameters
   * @param {number} start_speed speed at beginning of arc
   * @param {number} end_speed speed at end of arc
   * @param {number} range total range of airspeed dial
   * @param {number} radius of arc
   * @return {object} contains parameters for drawing the arc
   * @inner
   */
  function arc(start_speed, end_speed, range, radius) {
    var a1 = ((start_speed * (Math.PI * 2)) / range) - (Math.PI / 2.0);
    var a2 = ((end_speed * (Math.PI * 2)) / range) - (Math.PI / 2.0);
    var x1;
    var y1;
    var x2;
    var y2;
    var cx = 50.0;
    var cy = 50.0;
    x1 = cx + radius * Math.cos(a1);
    y1 = cy + radius * Math.sin(a1);
    x2 = cx + radius * Math.cos(a2);
    y2 = cy + radius * Math.sin(a2);


    return {
      radius: radius,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    };
  }

  /**
   * create the path spec for an arc starting at a specified position
   * @param {object} arc parameters describing the arc (from function arc)
   * @return {string} 'd' spec for arc element
   * @inner
   */
  function arc_path(arc) {
    var d = "M";
    d += arc.x2.toFixed(2) + " ";
    d += arc.y2.toFixed(2) + " ";
    d += "A ";
    d += arc.radius.toFixed(2) + " ";
    d += arc.radius.toFixed(2) + " ";
    d += "0 0 0 ";
    d += arc.x1.toFixed(2) + " ";
    d += arc.y1.toFixed(2);

    return d;
  }

  /**
   * create the arc specs for all arcs in an airspeed indicator
   * @param {number} range
   * @param {number} radius
   * @param {number} stall_flaps
   * @param {number} max_flaps
   * @param {number} stall_clean
   * @param {number} max_cruise
   * @param {number} min_caution
   * @param {number} max_caution
   * @param {number} never_exceed
   * @return {object} specs for all 4 arcs on the airspeed dial
   * @inner
   */
  function makeLimitArcs(range,
                         radius,
                         stall_flaps,
                         max_flaps,
                         stall_clean,
                         max_cruise,
                         min_caution,
                         max_caution,
                         never_exceed) {
    var p;
    var green;
    var yellow;
    var red;
    var white;

    p = arc(stall_clean, max_cruise, range, radius);
    green = arc_path(p);

    p = arc(min_caution, max_caution, range, radius);
    yellow = arc_path(p);

    p = arc(never_exceed - 1, never_exceed + 1, range, radius);
    red = arc_path(p);

    p = arc(stall_flaps, max_flaps, range, radius - 3);
    white = arc_path(p);

    return {
      green: green,
      yellow: yellow,
      red: red,
      white: white
    };
  }

  /**
   * generate the airspeed arc parameters
   * @param {object}  options         - to set various airspeed limit arcs
   * @param {number}  options.range   - airspeed range 0..range
   * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
   * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
   * @param {number}  options.red     - 160 never-exceed speed
   * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
   * @inner
   */
  function airspeedArcs(options) {
    var radius = 48;
    var range = options.range;
    var stall_flaps = options.white[0];
    var max_flaps = options.white[1];
    var stall_clean = options.green[0];
    var max_cruise = options.green[1];
    var min_caution = options.yellow[0];
    var max_caution = options.yellow[1];
    var never_exceed = options.red;
    var arcs;

    arcs = makeLimitArcs(range,
      radius,
      stall_flaps,
      max_flaps,
      stall_clean,
      max_cruise,
      min_caution,
      max_caution,
      never_exceed
    );

    return arcs;
  }


  /** airspeed path element
   * <path stroke-width="3" stroke="#0f0" d="M13.72 81.43 A 48.00 48.00 0 0 0 86.28 81.43"/>
   */
  var airspeed_arc_def = {
    name: 'path',
    attr: [
      ['stroke-width', '3']
    ]
  };

  /**
   * draw an altimeter
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @inner
   */
  function drawTurn(parent, id) {
    var e;
    var g;
    var svg;

    var turn_path_def = {
      name: 'path',
      attr: [
        ['d', "M20 65 A 120.00 120.00 0 0 0 80 65"],
        ['stroke-width', '10'],
        ['fill', '#000']
      ]
    };

    var turn_e1_def = {
      name: 'ellipse',
      attr: [
        ["fill", '#000'],
        ['stroke-width', '0.5'],
        ['cx', '50'],
        ['cy', '69'],
        ['rx', '5.5'],
        ['ry', '5.5']
      ]
    };

    var turn_e2_def = {
      name: 'ellipse',
      attr: [
        ['cx', '0'],
        ['cy', '0'],
        ['rx', '4'],
        ['ry', '4']
      ]
    };

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name, background_def.attr, null);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name, dial_def.attr,null);
    svg.appendChild(e);

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    g.setAttribute('stroke-width', '2.0');
    g.setAttribute('stroke', '#fff');
    svg.appendChild(g);

    e = drawLine(90.00, 50.00, 99.00, 50.00);
    g.appendChild(e);
    e = drawLine(88.45, 61.03, 97.10, 63.51);
    g.appendChild(e);
    e = drawLine(11.55, 61.03, 2.90, 63.51);
    g.appendChild(e);
    e = drawLine(10.00, 50.00, 1.00, 50.00);
    g.appendChild(e);

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    g.setAttribute('stroke-width', '0.5');
    g.setAttribute('stroke', '#fff');
    g.setAttribute('fill', '#fff');
    g.setAttribute('font-family', 'sans-serif');
    g.setAttribute('font-size', '6');
    g.setAttribute('text-anchor', 'middle');
    svg.appendChild(g);

    e = drawText(12, 72, 'L');
    g.appendChild(e);

    e = drawText(88, 72, 'R');
    g.appendChild(e);

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    g.setAttribute('stroke-width', '0.1');
    g.setAttribute('stroke', '#fff');
    g.setAttribute('fill', '#fff');
    g.setAttribute('font-family', 'sans-serif');
    g.setAttribute('text-anchor', 'middle');
    svg.appendChild(g);

    e = drawText(50, 60, 'TURN COORDINATOR', 3);
    g.appendChild(e);

    e = drawText(50, 80, '2 MIN', 4);
    g.appendChild(e);

    e = drawText(50, 88, 'NO PITCH', 3);
    g.appendChild(e);

    e = drawText(50, 93, 'INFORMATION', 3);
    g.appendChild(e);

    e = _createElementSvg(turn_path_def.name, turn_path_def.attr, null);
    g.appendChild(e);

    e = drawLine(44, 63, 44, 80, 0.5);
    e.setAttribute('stroke', '#000');
    g.appendChild(e);

    e = drawLine(56, 63, 56, 80, 0.5);
    e.setAttribute('stroke', '#000');
    g.appendChild(e);

    e = _createElementSvg(turn_e1_def.name, turn_e1_def.attr, id + '-ball');
    svg.appendChild(e);

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, id + '-plane');
    g.setAttribute('stroke-width', '1');
    g.setAttribute('stroke', '#fff');
    g.setAttribute('fill', '#fff');
    svg.appendChild(g);

    e = _createElementSvg(turn_e2_def.name, turn_e2_def.attr, null);
    g.appendChild(e);

    e = drawLine(-38, 0, 38, 0, 2);
    g.appendChild(e);

    e = drawLine(-10, -5, 10, -5);
    g.appendChild(e);

    e = drawLine(0, -10, 0, 0);
    g.appendChild(e);
  }

  /**
   * draw an altimeter
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @inner
   */
  function drawAltimeter(parent, id) {
    var e;
    var g;
    var svg;

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name, background_def.attr, null);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name, dial_def.attr, null);
    svg.appendChild(e);

    // drum text
    e = _createElementSvg(alt_drum_text_def.name, alt_drum_text_def.attr, id + '-drum');
    svg.appendChild(e);

    // pressure text
    e = _createElementSvg(alt_pressure_text_def.name, alt_pressure_text_def.attr, id + '-pwin');
    e.textContent = pad(29.92, 5, 2);
    svg.appendChild(e);

    // needle
    g = _createElementSvg(needle_group_def.name, needle_group_def.attr, id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name, needle_path_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name, needle_tail_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_center_def.name, needle_center_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name, needle_tail2_def.attr, null);
    g.appendChild(e);

    altimeterTicks(svg);
  }

  /**
   * draw an airspeed indicator
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @param {object}  options         - to set various airspeed limit arcs
   * @param {number}  options.range   - airspeed range 0..range
   * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
   * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
   * @param {number}  options.red     - 160 red   never-exceed
   * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
   * @inner
   */
  function drawAirspeed(parent, id, options) {
    var e;
    var g;
    var arcs;
    var svg;

    // get arc definitions
    arcs = airspeedArcs(options);

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name, background_def.attr, null);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name, dial_def.attr, null);
    svg.appendChild(e);

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name, airspeed_arc_def.attr, null);
    e.setAttribute('stroke', '#0f0');
    e.setAttribute('d', arcs.green);
    svg.appendChild(e);

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name, airspeed_arc_def.attr, null);
    e.setAttribute('stroke', '#ff0');
    e.setAttribute('d', arcs.yellow);
    svg.appendChild(e);

    // green,yellow and white are behind ticks
    e = _createElementSvg(airspeed_arc_def.name, airspeed_arc_def.attr, null);
    e.setAttribute('stroke', '#fff');
    e.setAttribute('d', arcs.white);
    svg.appendChild(e);

    airspeedTicks(svg, 20);

    // red is on top of ticks
    e = _createElementSvg(airspeed_arc_def.name, airspeed_arc_def.attr, null);
    e.setAttribute('stroke', '#f00');
    e.setAttribute('d', arcs.red);
    svg.appendChild(e);

    // needle group
    g = _createElementSvg(needle_group_def.name, needle_group_def.attr, id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name, needle_path_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(airspeed_arc_def.name, airspeed_arc_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name, needle_tail_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_center_def.name, needle_center_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name, needle_tail2_def.attr, null);
    g.appendChild(e);
    // ===== end of needle
  }

  /**
   * draw a VSI
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @inner
   */
  function drawVSI(parent, id) {
    var e;
    var g;
    var svg;

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name, background_def.attr, null);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name, dial_def.attr, null);
    svg.appendChild(e);

    // needle
    g = _createElementSvg(needle_group_def.name, needle_group_def.attr, id + '-needle');
    svg.appendChild(g);

    e = _createElementSvg(needle_path_def.name, needle_path_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail_def.name, needle_tail_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_center_def.name, needle_center_def.attr, null);
    g.appendChild(e);

    e = _createElementSvg(needle_tail2_def.name, needle_tail2_def.attr, null);
    g.appendChild(e);

    // text annotation
    vsiAnnotation(svg);

    // ticks
    vsiTicks(svg);
  }

  /**
   * draw an attitude indicator
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @inner
   */
  function drawAttitude(parent, id) {
    var e;
    var g;
    var svg;

    var pos_group = {
      name: 'g',
      attr: [
        ['stroke-width', '1'],
        ['stroke', '#fff'],
        ['fill', '#fff'],
        ['transform', 'translate(50,50) rotate(0)'],
        ['font-family', 'sans-serif'],
        ['text-anchor', 'middle'],
        ['font-size', '6']
      ]
    };

    var dial_group = {
      name: 'g',
      attr: [
        ['stroke-width', '1'],
        ['stroke', '#fff']
      ]
    };

    var rectBlue = {
      name: 'rect',
      attr: [
        ['fill', '#29B6F6'],
        ['x', '-100'],
        ['y', '-200'],
        ['width', '200'],
        ['height', '200']
      ]
    };

    var rectBrown = {
      name: 'rect',
      attr: [
        ['fill', '#8B4513'],
        ['x', '-100'],
        ['y', '0'],
        ['width', '200'],
        ['height', '200']
      ]
    };

    var dial_path = {
      name: 'path',
      attr: [
        ['fill', '#fff'],
        ['d', 'M-4 -50 L4 -50 L 0 -40 ']
      ]
    };

    var pointer_path = {
      name: 'path',
      attr: [
        ['stroke-width', '1'],
        ['stroke', '#ff0'],
        ['fill', '#ff0'],
        ['d', 'M46 18 L54 18 L50 11 z']
      ]
    };

    var outline_rect = {
      name: 'rect',
      attr: [
        ['fill', 'transparent'],
        ['stroke', '#9e9e9e'],
        ['stroke-width', '8'],
        ['x', '0'],
        ['y', '0'],
        ['width', '100'],
        ['height', '100']
      ]
    };

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    g = _createElementSvg(pos_group.name, pos_group.attr, id + '-pos');
    svg.appendChild(g);

    e = _createElementSvg(rectBlue.name, rectBlue.attr, null);
    g.appendChild(e);

    e = _createElementSvg(rectBrown.name, rectBrown.attr, null);
    g.appendChild(e);

    // draw pitch angle ticks
    var angle = -60.0;
    for (var i = 0; i <= 13; i++) {
      if (i == 6) {
        angle += 10.0;
        continue;
      }
      var a = angle * 1.25;
      var dy = -6.25;
      var b = a - dy;

      e = drawLine(-8, b, 8, b);
      g.appendChild(e);

      e = drawLine(-16, a, -4, a);
      g.appendChild(e);

      e = drawText(0, a + 2, Math.abs(angle).toString());
      e.setAttribute('stroke-width', '0.1');
      g.appendChild(e);

      // e = drawLine( 4   ,-75.0    ,16 ,-75.0 );
      e = drawLine(4, a, 16, a);
      g.appendChild(e);

      angle += 10.0;
    }

    g = _createElementSvg(standard_group_def.name, standard_group_def.attr, null);
    g.setAttribute('stroke-width', '2');
    g.setAttribute('stroke', '#ff0');
    svg.appendChild(g);
    e = drawLine(30, 50, 43, 50);
    g.appendChild(e);
    e = drawLine(42, 50, 42, 53);
    g.appendChild(e);
    e = drawLine(49, 50, 51, 50);
    g.appendChild(e);
    e = drawLine(58, 53, 58, 50);
    g.appendChild(e);
    e = drawLine(57, 50, 70, 50);
    g.appendChild(e);

    g = _createElementSvg(dial_group.name, dial_group.attr, id + '-dial');
    svg.appendChild(g);
    e = drawLine(20.00, -34.64, 24.50, -42.44, 2);
    g.appendChild(e);
    e = drawLine(34.64, -20.00, 42.44, -24.50, 2);
    g.appendChild(e);
    e = drawLine(40.00, 0.00, 49.00, 0.00, 2);
    g.appendChild(e);
    e = drawLine(-20.00, -34.64, -24.50, -42.44, 2);
    g.appendChild(e);
    e = drawLine(-34.64, -20.00, -42.44, -24.50, 2);
    g.appendChild(e);
    e = drawLine(-40.00, -0.00, -49.00, -0.00, 2);
    g.appendChild(e);

    e = drawLine(6.95, -39.39, 7.81, -44.32);
    g.appendChild(e);
    e = drawLine(13.68, -37.59, 15.39, -42.29);
    g.appendChild(e);
    e = drawLine(28.28, -28.28, 31.82, -31.82);
    g.appendChild(e);
    e = drawLine(-6.95, -39.39, -7.81, -44.32);
    g.appendChild(e);
    e = drawLine(-13.68, -37.59, -15.39, -42.29);
    g.appendChild(e);
    e = drawLine(-28.28, -28.28, -31.82, -31.82);
    g.appendChild(e);
    e = drawLine(0.00, -40.00, 0.00, -45.00);
    g.appendChild(e);
    e = _createElementSvg(dial_path.name, dial_path.attr, null);
    g.appendChild(e);

    e = _createElementSvg(pointer_path.name, pointer_path.attr, null);
    svg.appendChild(e);

    e = _createElementSvg(outline_rect.name, outline_rect.attr, null);
    svg.appendChild(e);
  }

  /**
   * draw a heading indicator
   * @param parent reference to parent element, such as a div
   * @param id     id to attach or reference to existing svg
   * @inner
   */
  function drawHeading(parent, id) {
    var e;
    var svg;

    var hdg_l1_def = {
      name: 'line',
      attr: [
        ['stroke', '#fff'],
        ['stroke-width', '0.5'],
        ['x1', '50'],
        ['y1', '5'],
        ['x2', '50'],
        ['y2', '20']
      ]
    };
    //<path stroke='#fff' stroke-width='0.5' d="M30,58 L30,50 L46,34 L46,26 L50,16.4 L54,26 L54,34 L70,50 L70,58 L54,50 L54,66 L62,70 L62,76.4 L50,71.6 L38,76.4 L38,70 L46,66 L46,50 L30,58"/>
    var hdg_ac_def = {
      name: 'path',
      attr: [
        ['stroke', '#fff'],
        ['stroke-width', '0.5'],
        ['d', 'M30,58 L30,50 L46,34 L46,26 L50,16.4 L54,26 L54,34 L70,50 L70,58 L54,50 L54,66 L62,70 L62,76.4 L50,71.6 L38,76.4 L38,70 L46,66 L46,50 L30,58']
      ]
    };

    // svg element
    svg = _createElementSvg(svg_def.name, svg_def.attr, id);
    parent.appendChild(svg);

    // background rect
    e = _createElementSvg(background_def.name, background_def.attr, null);
    svg.appendChild(e);

    // dial circle
    e = _createElementSvg(dial_def.name, dial_def.attr, null);
    svg.appendChild(e);

    e = _createElementSvg(hdg_l1_def.name, hdg_l1_def.attr, null);
    svg.appendChild(e);

    e = _createElementSvg(hdg_ac_def.name, hdg_ac_def.attr, null);
    svg.appendChild(e);

    // draw the dial
    headingDial(svg, id);
  }

  /* ==================================== */
  /* CONSTRUCTORS                         */
  /* ==================================== */

  /**
   * Altimeter
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @return {object} {@link AltimeterInstance}
   * @global
   * @alias svg_ac_inst:Altimeter
   */
  function Altimeter(parent, id, draw) {
    var altimeter;
    var needle;
    var drum;
    var pwindow;

    if (draw) {
      drawAltimeter(parent, id);
    }
    altimeter = global.querySelector('#' + id);
    needle = global.querySelector('#' + id + '-needle');
    drum = global.querySelector('#' + id + '-drum');
    pwindow = global.querySelector('#' + id + '-pwin');

    /**
     * @global
     * @namespace
     */
    var AltimeterInstance = {
      /** @param altitude altitude in feet
       * @inner
       */
      set: function (altitude) {
        if (altitude >= 999999) {
          altitude = 999999;
        }
        var d = (altitude % 1000) * (360.0 / 1000.0) - 90;
        drum.textContent = pad(altitude, 6, 0);
        needle.setAttribute('transform', 'translate(50,50),rotate(' + d + ')');
      },
      /** @param pressure altimeter setting
       * @inner
       */
      setPressure: function (pressure) {
        pwindow.textContent = pad(pressure, 5, 2);
      },
      /** @param size new size in feet
       * @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        altimeter.setAttribute('width', s);
        altimeter.setAttribute('height', s);
      }
    };
    return AltimeterInstance;
  }

  /**
   * Airspeed Indicator
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @param {object}  options         - to set various airspeed limit arcs
   * @param {number}  options.range   - airspeed range 0..range
   * @param {array}   options.green   - [80,140]  green arc from clean stall to max cruise
   * @param {array}   options.yellow  - [140,160] yellow arc from max cruise to never-exceed
   * @param {number}  options.red     - 160 red never-exceed
   * @param {array}   options.white   - [50,100]  white arc for stall-flaps to max-flaps
   * @return {object} reference to an {@link  AirspeedInstance}
   * @global
   * @alias svg_ac_inst:Airspeed
   */
  function Airspeed(parent, id, draw, options) {
    var airspeed;
    var needle;

    if (draw) {
      drawAirspeed(parent, id, options);
    }
    airspeed = global.querySelector('#' + id);
    needle   = global.querySelector('#' + id + '-needle');

    /**
     * @global
     * @namespace
     */
    var AirspeedInstance = {
      /**
       * @param knots speed in knots
       * @inner
       */
      set: function (knots) {
        if (knots >= 230) {
          knots = 230;
        }
        var d = knots * (360.0 / 230.0) - 90.0;
        needle.setAttribute('transform', 'translate(50,50),rotate(' + d + ')');
      },
      /** @param size new size in pixels (square)
       * @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        airspeed.setAttribute('width', s);
        airspeed.setAttribute('height', s);
      }
    };
    return AirspeedInstance;
  }

  /**
   * heading Indicator
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @return {object} reference to a {@link HeadingInstance}
   * @global
   * @alias svg_ac_inst:Heading
   */
  function Heading(parent, id, draw) {

    if (draw) {
      drawHeading(parent, id);
    }

    var heading = global.querySelector('#' + id);
    var dial = global.querySelector('#' + id + '-dial');

    /**
     * @global
     * @namespace
     */
    var HeadingInstance = {
      /** @param degrees heading in degrees
       */
      set: function (degrees) {
        degrees *= -1;
        dial.setAttribute('transform', 'translate(50 50) rotate(' + degrees.toFixed(0) + ')');
      },
      /** @param size new size in pixels (square)
       * @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        heading.setAttribute('width', s);
        heading.setAttribute('height', s);
      }
    };
    return HeadingInstance;
  }

  /**
   * Attitude Indicator
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @return {object} reference to an {@link AttitudeInstance}
   * @global
   * @alias svg_ac_inst:Attitude
   */
  function Attitude(parent, id, draw) {

    if (draw) {
      drawAttitude(parent, id);
    }
    var attitude = global.querySelector('#' + id);
    var pos = global.querySelector('#' + id + '-pos');
    var dial = global.querySelector('#' + id + '-dial');

    function setDial(d, roll) {
      var x;
      var y;
      var t;

      x = 50;
      y = 50;
      t = 'translate(' + x + ',' + y + ')' + 'rotate(' + roll + ')';
      d.setAttribute('transform', t);
    }

    /**
     * @global
     * @namespace
     */
    var AttitudeInstance = {
      /**
       * @param pitch aircraft pitch in degrees (positive up)
       * @param roll aircraft roll in degrees (positive right)
       * @inner
       */
      set: function (pitch, roll) {
        var p;
        var t;
        p = (pitch * 1.25);
        t = 'translate(50,50) rotate(' + roll + ') translate(0,' + p + ')';
        pos.setAttribute('transform', t);
        setDial(dial, roll);
      },

      /** @param size new size in pixels (square)
       * @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        attitude.setAttribute('width', s);
        attitude.setAttribute('height', s);
      }
    };

    return AttitudeInstance;
  }

  /**
   * Turn Coordinator
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @return {object} reference to a {@link TurnInstance}
   * @global
   * @alias svg_ac_inst:Turn
   */
  function Turn(parent, id, draw) {
    if (draw) {
      drawTurn(parent, id);
    }

    var turn = global.querySelector('#' + id);
    var plane = global.querySelector('#' + id + '-plane');
    var ball = global.querySelector('#' + id + '-ball');

    /**
     * @global
     * @namespace
     */
    var TurnInstance = {
      /**
       * @param rate turn rate in degrees per second
       * @param accel lateral acceleration in units -10 (full left deflection) to +10 (full right deflection)
       * @inner
       */
      set: function (rate, accel) {
        var x;
        var y;
        var r = 119.0;
        var cx = 50;
        var cy = -50;
        // plane
        plane.setAttribute('transform', 'translate(50,50) rotate(' + (rate * 5.3).toFixed(0) + ')');
        // ball
        accel += 90.0;
        x = Math.cos(accel * (Math.PI / 180.0)) * r + cx;
        y = Math.sin(accel * (Math.PI / 180.0)) * r + cy;
        ball.setAttribute('cx', x);
        ball.setAttribute('cy', y);
      },
      /** @param size new size in pixels (square)
       * @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        turn.setAttribute('width', s);
        turn.setAttribute('height', s);
      }
    };
    return TurnInstance;
  }

  /**
   * Vertical Speed Indicator
   * @param {Element} parent parent element, such as a div
   * @param {string}  id id of airspeed object
   * @param {boolean} draw true to draw on client, false to use static svg with same id
   * @return {object} {@link VSIInstance}
   * @global
   * @alias svg_ac_inst:VSI
   */
  function VSI(parent, id, draw) {
    if (draw) {
      drawVSI(parent, id);
    }

    var vsi = global.querySelector('#' + id);
    var needle = global.querySelector('#' + id + '-needle');

    /**
     * @global
     * @namespace
     */
    var VSIInstance = {
      /**
       * @param vertical_speed vertical speed in feet per minute (positive up)
       * @inner
       */
      set: function (vertical_speed) {
        if (vertical_speed >= 2000) {
          vertical_speed = 2000;
        }
        else if (vertical_speed <= -2000) {
          vertical_speed = -2000;
        }
        var d = vertical_speed * (360.0 / 4000) - 180.0;
        needle.setAttribute('transform', 'translate(50,50),rotate(' + d + ')');
      },
      /** @param size new size in pixels (square)
       *  @inner
       */
      resize: function (size) {
        var s = size.toString() + 'px';
        vsi.setAttribute('width', s);
        vsi.setAttribute('height', s);
      }
    };

    return VSIInstance;
  }

  return {
    Altimeter: Altimeter,
    Airspeed: Airspeed,
    Heading: Heading,
    Attitude: Attitude,
    Turn: Turn,
    VSI: VSI
  };
}(document));
