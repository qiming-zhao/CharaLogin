document.addEventListener('DOMContentLoaded', () => {

    const state = {
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,
        showPassword: false,
        password: "",
        isTyping: false,
        isLookingAtEachOther: false,
        isPurplePeeking: false,
        isPurpleBlinking: false,
        isBlackBlinking: false,
        isLoading: false,
        isDirty: true
    };


    const els = {
        emailInput: document.getElementById('email'),
        passwordInput: document.getElementById('password'),
        toggleBtn: document.getElementById('toggle-password'),
        iconEye: document.getElementById('icon-eye'),
        iconEyeOff: document.getElementById('icon-eye-off'),
        form: document.getElementById('login-form'),
        errorMsg: document.getElementById('error-message'),
        submitBtn: document.getElementById('submit-btn'),

        bodies: {
            purple: document.getElementById('char-purple'),
            black: document.getElementById('char-black'),
            orange: document.getElementById('char-orange'),
            yellow: document.getElementById('char-yellow')
        },
        eyeGroups: {
            purple: document.getElementById('eyes-purple'),
            black: document.getElementById('eyes-black'),
            orange: document.getElementById('eyes-orange'),
            yellow: document.getElementById('eyes-yellow')
        },
        mouthYellow: document.getElementById('mouth-yellow'),


        pupils: {
            purple: Array.from(document.getElementById('eyes-purple').querySelectorAll('.eye-wrapper')).map(el => ({ wrap: el, dot: el.querySelector('.pupil'), max: 5 })),
            black: Array.from(document.getElementById('eyes-black').querySelectorAll('.eye-wrapper')).map(el => ({ wrap: el, dot: el.querySelector('.pupil'), max: 4 })),
            orange: Array.from(document.getElementById('eyes-orange').querySelectorAll('.eye-wrapper')).map(el => ({ wrap: el, dot: el.querySelector('.pupil'), max: 5 })),
            yellow: Array.from(document.getElementById('eyes-yellow').querySelectorAll('.eye-wrapper')).map(el => ({ wrap: el, dot: el.querySelector('.pupil'), max: 5 }))
        }
    };


    const geoCache = {
        bodies: { purple: {}, black: {}, orange: {}, yellow: {} },
        pupils: { purple: [], black: [], orange: [], yellow: [] }
    };

    function updateGeometryCache() {

        for (const [key, el] of Object.entries(els.bodies)) {
            const rect = el.getBoundingClientRect();
            geoCache.bodies[key] = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 3 };
        }

        for (const [key, items] of Object.entries(els.pupils)) {
            geoCache.pupils[key] = items.map(item => {
                const rect = item.wrap.getBoundingClientRect();
                return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
            });
        }
        state.isDirty = true;
    }


    updateGeometryCache();
    window.addEventListener('resize', updateGeometryCache);


    window.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
        state.isDirty = true;
    });

    const setTyping = (val) => {
        state.isTyping = val;
        state.isDirty = true;
        if (val) {
            state.isLookingAtEachOther = true;
            setTimeout(() => { state.isLookingAtEachOther = false; state.isDirty = true; }, 800);
        }
    };

    els.emailInput.addEventListener('focus', () => setTyping(true));
    els.emailInput.addEventListener('blur', () => setTyping(false));
    els.passwordInput.addEventListener('focus', () => setTyping(true));
    els.passwordInput.addEventListener('blur', () => setTyping(false));

    els.passwordInput.addEventListener('input', (e) => {
        state.password = e.target.value;
        state.isDirty = true;
    });

    els.toggleBtn.addEventListener('click', () => {
        state.showPassword = !state.showPassword;
        els.passwordInput.type = state.showPassword ? 'text' : 'password';
        els.iconEye.classList.toggle('hidden', !state.showPassword);
        els.iconEyeOff.classList.toggle('hidden', state.showPassword);
        state.isDirty = true;
    });

    els.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        els.errorMsg.classList.add('hidden');
        els.submitBtn.textContent = "Signing in...";
        els.submitBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        if (els.emailInput.value === "erik@gmail.com" && els.passwordInput.value === "1234") {
            alert("Login successful! Welcome, Erik!");
        } else {
            els.errorMsg.textContent = "Invalid email or password. Please try again.";
            els.errorMsg.classList.remove('hidden');
        }
        els.submitBtn.textContent = "Log in";
        els.submitBtn.disabled = false;
    });


    const randomTimer = (min, max) => Math.random() * (max - min) + min;

    function blinkLoop(color) {
        setTimeout(() => {
            state[`is${color}Blinking`] = true;
            state.isDirty = true;
            setTimeout(() => {
                state[`is${color}Blinking`] = false;
                state.isDirty = true;
                blinkLoop(color);
            }, 150);
        }, randomTimer(3000, 7000));
    }
    blinkLoop('Purple');
    blinkLoop('Black');

    function peekLoop() {
        setTimeout(() => {
            if (state.password.length > 0 && state.showPassword) {
                state.isPurplePeeking = true;
                state.isDirty = true;
                setTimeout(() => { state.isPurplePeeking = false; state.isDirty = true; }, 800);
            }
            peekLoop();
        }, randomTimer(2000, 5000));
    }
    peekLoop();


    function calcRelativePos(cache) {
        const deltaX = state.mouseX - cache.cx;
        const deltaY = state.mouseY - cache.cy;
        return {
            fX: Math.max(-15, Math.min(15, deltaX / 20)),
            fY: Math.max(-10, Math.min(10, deltaY / 30)),
            skew: Math.max(-6, Math.min(6, -deltaX / 120))
        };
    }

    function renderLoop() {
        requestAnimationFrame(renderLoop);


        if (!state.isDirty) return;
        state.isDirty = false;

        const pLen = state.password.length > 0;
        const hasInputAndHidden = pLen && !state.showPassword;
        const isExposed = pLen && state.showPassword;


        const pPos = calcRelativePos(geoCache.bodies.purple);
        const bPos = calcRelativePos(geoCache.bodies.black);
        const oPos = calcRelativePos(geoCache.bodies.orange);
        const yPos = calcRelativePos(geoCache.bodies.yellow);




        els.bodies.purple.style.height = (state.isTyping || hasInputAndHidden) ? '440px' : '400px';
        const pBodyTransform = isExposed ? `skewX(0deg)` : (state.isTyping || hasInputAndHidden) ? `skewX(${pPos.skew - 12}deg) translateX(40px)` : `skewX(${pPos.skew}deg)`;
        els.bodies.purple.style.transform = `${pBodyTransform} translateZ(0)`;

        const pEX = isExposed ? 20 : state.isLookingAtEachOther ? 55 : 45 + pPos.fX;
        const pEY = isExposed ? 35 : state.isLookingAtEachOther ? 65 : 40 + pPos.fY;
        els.eyeGroups.purple.style.transform = `translate3d(${pEX}px, ${pEY}px, 0)`;


        const bBodyTransform = isExposed ? `skewX(0deg)` : state.isLookingAtEachOther ? `skewX(${bPos.skew * 1.5 + 10}deg) translateX(20px)` : (state.isTyping || hasInputAndHidden) ? `skewX(${bPos.skew * 1.5}deg)` : `skewX(${bPos.skew}deg)`;
        els.bodies.black.style.transform = `${bBodyTransform} translateZ(0)`;

        const bEX = isExposed ? 10 : state.isLookingAtEachOther ? 32 : 26 + bPos.fX;
        const bEY = isExposed ? 28 : state.isLookingAtEachOther ? 12 : 32 + bPos.fY;
        els.eyeGroups.black.style.transform = `translate3d(${bEX}px, ${bEY}px, 0)`;


        const oBodyTransform = isExposed ? `skewX(0deg)` : `skewX(${oPos.skew}deg)`;
        els.bodies.orange.style.transform = `${oBodyTransform} translateZ(0)`;

        const oEX = isExposed ? 50 : 82 + oPos.fX;
        const oEY = isExposed ? 85 : 90 + oPos.fY;
        els.eyeGroups.orange.style.transform = `translate3d(${oEX}px, ${oEY}px, 0)`;


        const yBodyTransform = isExposed ? `skewX(0deg)` : `skewX(${yPos.skew}deg)`;
        els.bodies.yellow.style.transform = `${yBodyTransform} translateZ(0)`;

        const yEX = isExposed ? 20 : 52 + yPos.fX;
        const yEY = isExposed ? 35 : 40 + yPos.fY;
        els.eyeGroups.yellow.style.transform = `translate3d(${yEX}px, ${yEY}px, 0)`;

        const mX = isExposed ? 10 : 40 + yPos.fX;
        const mY = isExposed ? 88 : 88 + yPos.fY;
        els.mouthYellow.style.transform = `translate3d(${mX}px, ${mY}px, 0)`;


        els.pupils.purple.forEach(p => p.wrap.style.height = state.isPurpleBlinking ? '2px' : '18px');
        els.pupils.black.forEach(p => p.wrap.style.height = state.isBlackBlinking ? '2px' : '16px');


        const calcPupil = (cache, maxDist, fX, fY) => {
            if (fX !== undefined && fY !== undefined) return { x: fX, y: fY };
            const dX = state.mouseX - cache.cx;
            const dY = state.mouseY - cache.cy;
            const dist = Math.min(Math.sqrt(dX * dX + dY * dY), maxDist);
            const angle = Math.atan2(dY, dX);
            return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
        };

        let pFX = isExposed ? (state.isPurplePeeking ? 4 : -4) : state.isLookingAtEachOther ? 3 : undefined;
        let pFY = isExposed ? (state.isPurplePeeking ? 5 : -4) : state.isLookingAtEachOther ? 4 : undefined;
        els.pupils.purple.forEach((p, i) => {
            if (!state.isPurpleBlinking) {
                const pos = calcPupil(geoCache.pupils.purple[i], p.max, pFX, pFY);
                p.dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            } else { p.dot.style.transform = 'translate(0,0)'; }
        });

        let bFX = isExposed ? -4 : state.isLookingAtEachOther ? 0 : undefined;
        let bFY = isExposed ? -4 : state.isLookingAtEachOther ? -4 : undefined;
        els.pupils.black.forEach((p, i) => {
            if (!state.isBlackBlinking) {
                const pos = calcPupil(geoCache.pupils.black[i], p.max, bFX, bFY);
                p.dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            } else { p.dot.style.transform = 'translate(0,0)'; }
        });

        let oFX = isExposed ? -5 : undefined, oFY = isExposed ? -4 : undefined;
        els.pupils.orange.forEach((p, i) => {
            const pos = calcPupil(geoCache.pupils.orange[i], p.max, oFX, oFY);
            p.dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        });

        let yFX = isExposed ? -5 : undefined, yFY = isExposed ? -4 : undefined;
        els.pupils.yellow.forEach((p, i) => {
            const pos = calcPupil(geoCache.pupils.yellow[i], p.max, yFX, yFY);
            p.dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        });
    }

    renderLoop();


    setTimeout(() => {
        updateGeometryCache();
    }, 1600);
});