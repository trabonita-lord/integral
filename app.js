document.addEventListener('DOMContentLoaded', () => {
    
    // --- Visual Architect Graph ---
    const drawMainGraph = () => {
        const canvas = document.getElementById('main-graph');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Grid setup
        const scaleX = width / 6; // Range -1 to 5
        const scaleY = height / 10; // Range -6 to 4
        const originX = 1 * scaleX;
        const originY = 6 * scaleY;
        
        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        // X-axis
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        // Y-axis
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();
        
        // Function f(x) = 2x - 4
        const f = (x) => 2 * x - 4;
        
        // Draw Fill Areas
        ctx.beginPath();
        ctx.moveTo(originX, originY); // (0,0)
        ctx.lineTo(originX + 2 * scaleX, originY); // (2,0)
        ctx.lineTo(originX, originY - f(0) * scaleY); // (0, -4)
        ctx.fillStyle = 'rgba(255, 64, 64, 0.4)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(originX + 2 * scaleX, originY); // (2,0)
        ctx.lineTo(originX + 4 * scaleX, originY); // (4,0)
        ctx.lineTo(originX + 4 * scaleX, originY - f(4) * scaleY); // (4, 4)
        ctx.fillStyle = 'rgba(0, 255, 128, 0.4)';
        ctx.fill();

        // Draw Line
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.moveTo(originX + 0 * scaleX, originY - f(0) * scaleY);
        ctx.lineTo(originX + 4 * scaleX, originY - f(4) * scaleY);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#00d2ff';
        ctx.font = '16px sans-serif';
        ctx.fillText('f(x) = 2x - 4', width - 120, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText('x=0', originX - 30, originY + 20);
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
        
        const scaleX = width / 5; // x from 0 to 5
        const originY = height / 2; // y=0 in middle
        
        // Draw Axis
        const drawAxes = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.beginPath();
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 2;
            ctx.moveTo(0, originY);
            ctx.lineTo(width, originY);
            ctx.stroke();
            
            // Ticks
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            for(let i=0; i<=5; i++) {
                ctx.beginPath();
                ctx.moveTo(i*scaleX, originY - 5);
                ctx.lineTo(i*scaleX, originY + 5);
                ctx.stroke();
                ctx.fillText(i, i*scaleX + 5, originY - 10);
            }
            
            // Draw Line roughly
            ctx.beginPath();
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 3;
            // f(x) = 2x - 4. 
            // x=0 -> y=-4 (bottom of canvas)
            // x=2 -> y=0 (middle)
            // x=4 -> y=4 (top)
            ctx.moveTo(0, height);
            ctx.lineTo(4 * scaleX, 0); 
            ctx.stroke();
        };
        drawAxes();
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            // Convert x to graph units
            const graphX = x / scaleX;
            
            // Target is x=2
            if (Math.abs(graphX - 2) < 0.3) {
                feedback.textContent = "Correct! The line crosses exactly at x = 2.";
                feedback.className = "feedback success";
                geoExp.classList.remove('hidden');
                
                // Draw point
                drawAxes();
                ctx.beginPath();
                ctx.arc(2 * scaleX, originY, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#00ff80';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            } else {
                feedback.textContent = "Not quite. Look where the purple line intersects the blue x-axis.";
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
            document.getElementById(`step${currentStep}`).classList.remove('hidden');
        }
        if (currentStep === maxSteps) {
            btnNext.disabled = true;
            btnNext.style.opacity = 0.5;
        }
    });
    
    btnReset.addEventListener('click', () => {
        for (let i = 1; i <= maxSteps; i++) {
            document.getElementById(`step${i}`).classList.add('hidden');
        }
        currentStep = 0;
        btnNext.disabled = false;
        btnNext.style.opacity = 1;
    });

    // --- Interactive Graphing Demo ---
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
            minX = -1; maxX = 1; minY = -1; maxY = 1;
            netA = 0; totA = 0.5; // |-0.25| + |0.25|
        }
        
        document.getElementById('stat-net').textContent = netA.toFixed(2);
        document.getElementById('stat-total').textContent = totA.toFixed(2);
        
        const scaleX = width / (maxX - minX + 1); // Padding
        const scaleY = height / (maxY - minY);
        const originX = (0 - minX + 0.5) * scaleX;
        const originY = height - (0 - minY) * scaleY;
        
        // Draw Axis
        ctx.beginPath();
        ctx.strokeStyle = '#475569';
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();
        
        // Fill Area numerically
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
        ctx.lineWidth = 2;
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
            quizFeedback.textContent = "Please select an answer.";
            quizFeedback.className = "feedback";
            return;
        }
        
        if (selected.value === 'correct') {
            quizFeedback.textContent = "Correct! The negative 'icebergs' outline a larger area than the positive 'mountains'.";
            quizFeedback.className = "feedback success";
        } else {
            quizFeedback.textContent = "Not quite. Remember, definite integrals compute NET area, not total area or math errors. Try again!";
            quizFeedback.className = "feedback error";
        }
    });
});
