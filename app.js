document.addEventListener('DOMContentLoaded', () => {
    
    // --- Grid Drawing Utility ---
    const drawGrid = (ctx, width, height, originX, originY, scaleX, scaleY) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        // Verticals
        for(let x = 0; x < width; x += scaleX) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        // Horizontals
        for(let y = 0; y < height; y += scaleY) {
            ctx.moveTo(0, y); ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Axes
        ctx.beginPath();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.moveTo(0, originY); ctx.lineTo(width, originY); // X
        ctx.moveTo(originX, 0); ctx.lineTo(originX, height); // Y
        ctx.stroke();
    };

    // --- Riemann Sum Animation ---
    const drawRiemannAnimation = () => {
        const canvas = document.getElementById('riemann-canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        let animationFrame;
        let rectCount = 2;
        const maxRects = 40;
        
        const f = (x) => 2 * x - 4;
        const scaleX = width / 6;
        const scaleY = height / 10;
        const originX = 1 * scaleX;
        const originY = 6 * scaleY;

        const renderFrame = () => {
            ctx.clearRect(0, 0, width, height);
            drawGrid(ctx, width, height, originX, originY, scaleX, scaleY);

            // Draw Rectangles
            const rectWidth = 4 / rectCount;
            for(let i = 0; i < rectCount; i++) {
                const x = 0 + (i * rectWidth); // start at x=0
                // Use right endpoint for height
                const y = f(x + rectWidth); 
                
                const px = originX + (x * scaleX);
                const py = originY;
                const pWidth = rectWidth * scaleX;
                const pHeight = -y * scaleY;

                ctx.beginPath();
                ctx.rect(px, py, pWidth, pHeight);
                ctx.fillStyle = y >= 0 ? 'rgba(0, 255, 128, 0.3)' : 'rgba(255, 64, 64, 0.3)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Draw Curve
            ctx.beginPath();
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 3;
            ctx.moveTo(originX, originY - f(0) * scaleY);
            ctx.lineTo(originX + 4 * scaleX, originY - f(4) * scaleY);
            ctx.stroke();

            // Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Rectangles: ${Math.floor(rectCount)}`, 20, 30);
        };

        renderFrame(); // initial draw

        document.getElementById('btn-animate-riemann').addEventListener('click', () => {
            rectCount = 2;
            cancelAnimationFrame(animationFrame);
            
            const animate = () => {
                rectCount += 0.5; // speed
                renderFrame();
                if(rectCount < maxRects) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };
            animate();
        });
    };
    drawRiemannAnimation();

    // --- Visual Architect Main Graph ---
    const drawMainGraph = () => {
        const canvas = document.getElementById('main-graph');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const scaleX = width / 6; 
        const scaleY = height / 10; 
        const originX = 1 * scaleX;
        const originY = 6 * scaleY;
        
        drawGrid(ctx, width, height, originX, originY, scaleX, scaleY);
        
        const f = (x) => 2 * x - 4;
        
        // Iceberg Fill
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 2 * scaleX, originY);
        ctx.lineTo(originX, originY - f(0) * scaleY);
        ctx.fillStyle = 'rgba(255, 64, 64, 0.5)';
        ctx.fill();
        
        // Mountain Fill
        ctx.beginPath();
        ctx.moveTo(originX + 2 * scaleX, originY); 
        ctx.lineTo(originX + 4 * scaleX, originY); 
        ctx.lineTo(originX + 4 * scaleX, originY - f(4) * scaleY); 
        ctx.fillStyle = 'rgba(0, 255, 128, 0.5)';
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 4;
        ctx.moveTo(originX, originY - f(0) * scaleY);
        ctx.lineTo(originX + 4 * scaleX, originY - f(4) * scaleY);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText('x=0', originX - 30, originY + 20);
        ctx.fillText('x=2 (Intercept)', originX + 2 * scaleX - 40, originY - 10);
        ctx.fillText('x=4', originX + 4 * scaleX - 15, originY + 20);
    };
    drawMainGraph();

    // --- Interactive Intercept Finder ---
    const setupInterceptActivity = () => {
        const canvas = document.getElementById('intercept-canvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const feedback = document.getElementById('intercept-feedback');
        const geoExp = document.getElementById('geometry-explanation');
        
        const scaleX = width / 5;
        const originY = height / 2;
        
        const drawAxes = () => {
            ctx.clearRect(0, 0, width, height);
            
            // X-axis glow
            ctx.shadowColor = '#00d2ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 3;
            ctx.moveTo(0, originY);
            ctx.lineTo(width, originY);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
            
            // Ticks
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px sans-serif';
            for(let i=0; i<=5; i++) {
                ctx.beginPath();
                ctx.moveTo(i*scaleX, originY - 8);
                ctx.lineTo(i*scaleX, originY + 8);
                ctx.stroke();
                ctx.fillText(i, i*scaleX + 8, originY - 15);
            }
            
            // Draw Line roughly
            ctx.beginPath();
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 4;
            ctx.moveTo(0, height);
            ctx.lineTo(4 * scaleX, 0); 
            ctx.stroke();
        };
        drawAxes();
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            // Adjust for CSS scaling if necessary
            const scaleFactor = canvas.width / rect.width;
            const x = (e.clientX - rect.left) * scaleFactor;
            
            const graphX = x / scaleX;
            
            if (Math.abs(graphX - 2) < 0.25) {
                feedback.innerHTML = "🎯 <strong>Correct!</strong> The iceberg turns into a mountain exactly at x = 2.";
                feedback.className = "feedback success";
                geoExp.classList.remove('hidden');
                
                drawAxes();
                ctx.beginPath();
                ctx.arc(2 * scaleX, originY, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#00ff80';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                feedback.textContent = "Not quite. Look closely where the purple line crosses the glowing blue x-axis.";
                feedback.className = "feedback error";
            }
        });
    };
    setupInterceptActivity();

    // --- Step-by-Step Reveal ---
    let currentStep = 0;
    const maxSteps = 3;
    const btnNext = document.getElementById('btn-next-step');
    const btnReset = document.getElementById('btn-reset-steps');
    
    btnNext.addEventListener('click', () => {
        if (currentStep < maxSteps) {
            currentStep++;
            const stepEl = document.getElementById(`step${currentStep}`);
            stepEl.classList.remove('hidden');
            // Trigger reflow for animation
            void stepEl.offsetWidth; 
        }
        if (currentStep === maxSteps) {
            btnNext.disabled = true;
            btnNext.style.opacity = 0.5;
            btnNext.style.cursor = "not-allowed";
        }
    });
    
    btnReset.addEventListener('click', () => {
        for (let i = 1; i <= maxSteps; i++) {
            document.getElementById(`step${i}`).classList.add('hidden');
        }
        currentStep = 0;
        btnNext.disabled = false;
        btnNext.style.opacity = 1;
        btnNext.style.cursor = "pointer";
    });

    // --- Interactive Graphing Demo (Closer) ---
    const drawDemo = () => {
        const canvas = document.getElementById('demo-canvas');
        const ctx = canvas.getContext('2d');
        const funcType = document.getElementById('func-select').value;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        let f, minX, maxX, minY, maxY, step, netA, totA;
        
        if (funcType === 'linear') {
            f = x => 2*x - 4;
            minX = 0; maxX = 4; minY = -5; maxY = 5;
            netA = 0; totA = 8;
        } else if (funcType === 'sine') {
            f = x => Math.sin(x);
            minX = 0; maxX = 2*Math.PI; minY = -1.5; maxY = 1.5;
            netA = 0; totA = 4;
        } else if (funcType === 'cubic') {
            f = x => x*x*x - x;
            minX = -1.2; maxX = 1.2; minY = -1; maxY = 1;
            netA = 0; totA = 0.5; // Area of x^3-x on [-1,1]
        }
        
        // Animate numbers counting up
        document.getElementById('stat-net').textContent = netA.toFixed(2);
        document.getElementById('stat-total').textContent = totA.toFixed(2);
        
        const scaleX = width / (maxX - minX + 1);
        const scaleY = height / (maxY - minY + 0.5);
        const originX = (0 - minX + 0.5) * scaleX;
        const originY = height - (0 - minY + 0.25) * scaleY;
        
        drawGrid(ctx, width, height, originX, originY, scaleX, scaleY);
        
        // Fill Area
        step = (maxX - minX) / 200;
        for (let x = minX; x <= maxX; x += step) {
            const y = f(x);
            const nextY = f(x + step);
            
            ctx.beginPath();
            ctx.moveTo(originX + x * scaleX, originY);
            ctx.lineTo(originX + x * scaleX, originY - y * scaleY);
            ctx.lineTo(originX + (x + step) * scaleX, originY - nextY * scaleY);
            ctx.lineTo(originX + (x + step) * scaleX, originY);
            
            if (y >= 0) {
                ctx.fillStyle = 'rgba(0, 255, 128, 0.4)';
            } else {
                ctx.fillStyle = 'rgba(255, 64, 64, 0.4)';
            }
            ctx.fill();
        }
        
        // Draw Curve
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        for (let x = minX; x <= maxX; x += step) {
            const y = f(x);
            const cx = originX + x * scaleX;
            const cy = originY - y * scaleY;
            if (x === minX) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
    };
    
    document.getElementById('func-select').addEventListener('change', drawDemo);
    drawDemo(); // Init

    // --- Quiz Logic ---
    const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
    const quizFeedback = document.getElementById('quiz-feedback');
    
    btnSubmitQuiz.addEventListener('click', () => {
        const selected = document.querySelector('input[name="q1"]:checked');
        if (!selected) {
            quizFeedback.textContent = "Please select an answer first.";
            quizFeedback.className = "feedback";
            return;
        }
        
        if (selected.value === 'correct') {
            quizFeedback.innerHTML = "✅ <strong>Spot on!</strong> The negative 'icebergs' outline a larger physical area than the positive 'mountains', pulling the net total below zero.";
            quizFeedback.className = "feedback success";
        } else {
            quizFeedback.innerHTML = "❌ <strong>Not quite.</strong> Remember the waterline analogy: Integrals compute NET area. If the net is negative, the icebergs are bigger than the mountains.";
            quizFeedback.className = "feedback error";
        }
    });
});
