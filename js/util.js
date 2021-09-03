class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(v) {
		this.x = this.x + v.x;
		this.y = this.y + v.y;
		return this
	}
	sub(v) {
		this.x = (this.x - v.x);
		this.y = (this.y - v.y);
		return this
	}
	static subV1V2(v1, v2) {
		return new Vector2((v1.x - v2.x), (v1.y - v2.y));
	}
	multS(k) {
		this.x = this.x * k;
		this.y = this.y * k;
		return this
	}
	divS(k) {
		this.x = this.x / k;
		this.y = this.y / k;
		return this;
	}
	dist(v){
		return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
	}
	magSq() {
		const x = this.x;
		const y = this.y;
		return x * x + y * y;
	};
	mag(){
		return Math.sqrt(this.magSq());
	}
	normalize(){
		const len = this.mag();
		if (len !== 0) this.multS(1 / len);
		return this;
	}
	setMag(k) {
		return this.normalize().multS(k);
	}
	limit(max) {
		const mSq = this.magSq();
		if (mSq > max * max) {
			this.divS(Math.sqrt(mSq)).multS(max);
		}
		return this;
	};
	dot(v) {
		return this.x * v.x + this.y * v.y;
	};
	static angleBetween(v1, v2){
			return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
	}
	angle(){
		return (this.y < 0) ? -Vector2.angleBetween(this, new Vector2(1,0)) : Vector2.angleBetween(this, new Vector2(1,0));
	}
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
};

function map(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return this.constrain(newval, start2, stop2);
  } else {
    return this.constrain(newval, stop2, start2);
  }
};

function getRandomArb(min, max) {
  return Math.random() * (max - min) + min;
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}