// plotLayout.js
(function() {
    // 创建样式并添加到页面
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: Arial, sans-serif;
                background-color: #1a1a1a;
                color: #fff;
                margin: 0;
                padding: 0;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
            }

            .plot-container {
                width: 100vw;
                height: 100vh;
                position: relative;
            }

            #plot {
                width: 100%;
                height: 100%;
                background: #252525;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
            }

            /* 修改坐标轴和刻度标签颜色为白色 */
            #plot .axis {
                color: white !important;
            }

            #plot .axis text {
                fill: white !important;
                font-size: 16px !important;
                font-weight: bold !important;
            }

            #plot .axis line {
                stroke: white !important;
            }

            #plot .axis path {
                stroke: white !important;
            }

            #plot .tick text {
                fill: white !important;
            }

            /* 标注样式 */
            #plot .annotations text {
                fill: white !important;
                font-size: 28px !important;
                font-weight: bold !important;
            }

            /* 网格线样式 */
            #plot .grid line {
                stroke: rgba(255, 255, 255, 0.2) !important;
            }

            .control-panel {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                width: 320px;
                background: rgba(40, 44, 52, 0.95);
                padding: 20px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                z-index: 1000;
                transition: none;
                display: none;
            }

            .control-panel-header {
                padding: 10px;
                margin: -20px -20px 20px -20px;
                background: rgba(66, 165, 245, 0.2);
                border-radius: 10px 10px 0 0;
                cursor: move;
                user-select: none;
            }

            .slider-container {
                margin: 20px 0;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }

            .slider-value {
                font-size: 18px;
                margin-bottom: 10px;
            }

            input[type="range"] {
                width: 100%;
                height: 8px;
                -webkit-appearance: none;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 4px;
                outline: none;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                background: #42a5f5;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid white;
            }

            .function-toggle {
                margin: 10px 0;
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .function-toggle label {
                font-size: 16px;
                cursor: pointer;
            }

            .function-title {
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin-bottom: 15px;
                text-align: center;
                letter-spacing: 0.5px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                padding: 16px 20px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                font-family: 'Courier New', monospace;
                position: relative;
                overflow: hidden;
                line-height: 1.4;
            }

            .function-title sup {
                font-size: 0.7em;
                vertical-align: super;
                color: #ffd700;
                font-weight: bold;
            }

            .coordinate-display {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 5px;
                display: none;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
            }

            input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }

            h2 {
                text-align: center;
                margin: 0;
                color: #42a5f5;
                text-shadow: 0 0 10px rgba(66, 165, 245, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    // 创建DOM结构
    function createDOM() {
        const container = document.createElement('div');
        container.className = 'plot-container';
        container.innerHTML = `
            <div id="plot"></div>
            <div class="coordinate-display" id="coordinate-display"></div>
            <div class="control-panel" id="control-panel">
                <div class="control-panel-header">
                    <h2 id="panel-title">函数图像</h2>
                </div>
                <div id="control-content"></div>
            </div>
        `;
        document.body.appendChild(container);
    }

    // 初始化拖拽功能
    function initDrag() {
        const controlPanel = document.getElementById("control-panel");
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        function handleDragStart(e) {
            if (e.target.closest('.control-panel-header')) {
                isDragging = true;
                
                startX = e.clientX;
                startY = e.clientY;
                
                const rect = controlPanel.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                
                controlPanel.style.transform = 'none';
                controlPanel.style.left = startLeft + 'px';
                controlPanel.style.top = startTop + 'px';
            }
        }

        function handleDrag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            const maxX = window.innerWidth - controlPanel.offsetWidth;
            const maxY = window.innerHeight - controlPanel.offsetHeight;
            
            newLeft = Math.max(0, Math.min(maxX, newLeft));
            newTop = Math.max(0, Math.min(maxY, newTop));
            
            controlPanel.style.left = newLeft + 'px';
            controlPanel.style.top = newTop + 'px';
        }

        function handleDragEnd() {
            isDragging = false;
        }

        controlPanel.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
    }

    // 初始化基础功能
    function initBaseFunctions() {
        // 监听窗口大小改变
        window.addEventListener('resize', function() {
            if (window.plotInstance) {
                window.redrawPlot();
            }
        });
    }

    // 初始化样式和布局
    function initPlotLayout() {
        injectStyles();
        createDOM();
        initDrag();
        initBaseFunctions();
        
        // 确保function-plot已加载
        if (typeof functionPlot === 'undefined') {
            const script = document.createElement('script');
            // script.src = 'https://cdn.jsdelivr.net/npm/function-plot@1.22.7/dist/function-plot.js';
            script.src = 'https://cnrvlcbdgwyb.sealoshzh.site/static/function-plot.js';
            script.onload = function() {
                console.log('function-plot loaded');
            };
            document.head.appendChild(script);
        }
    }

    // 格式化数学表达式，使其更美观
    function formatMathExpression(expr) {
        // 替换数学符号为更美观的显示
        let formatted = expr
            .replace(/\^(\d+)/g, '<sup>$1</sup>')  // 将 ^数字 替换为 <sup>数字</sup>
            .replace(/\*/g, '·')  // 将 * 替换为 ·
            .replace(/sin/g, 'sin')
            .replace(/cos/g, 'cos')
            .replace(/tan/g, 'tan')
            .replace(/exp\(([^)]+)\)/g, 'e<sup>$1</sup>')  // 将 exp(内容) 替换为 e<sup>内容</sup>
            .replace(/log/g, 'ln')
            .replace(/sqrt/g, '√')
            // 分数处理：匹配简单的 a/b 形式，避免与幂运算冲突
            .replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '<span style="display: inline-block; vertical-align: middle; text-align: center;"><span style="border-bottom: 1px solid #e0e0e0; padding: 0 2px;">$1</span><span style="display: block; font-size: 0.9em; color: #b0b0b0;">$2</span></span>');
        
        return formatted;
    }

    // 渲染参数滑块区块
    function renderSliders(functions) {
        let html = '';
        functions.forEach((fn, index) => {
            // 自动用exprs作为标题和唯一标识
            const idBase = fn.name || fn.exprs;
            
            // 格式化函数表达式，使其更易读
            let formattedExpr = fn.exprs;
            if (fn.graphType === 'parametric') {
                // 参数方程格式化为更美观的形式
                const parts = fn.exprs.split(',');
                if (parts.length === 2) {
                    // 移除可能存在的x=和y=前缀
                    let xExpr = parts[0].trim();
                    let yExpr = parts[1].trim();
                    
                    // 如果表达式已经包含x=或y=，则移除
                    xExpr = xExpr.replace(/^x\s*=\s*/i, '');
                    yExpr = yExpr.replace(/^y\s*=\s*/i, '');
                    
                    const formattedX = formatMathExpression(xExpr);
                    const formattedY = formatMathExpression(yExpr);
                    formattedExpr = `<div style="text-align: left; line-height: 1.4; font-family: 'Courier New', monospace;">
                        <div style="margin-bottom: 8px; color: #e0e0e0;">x = ${formattedX}</div>
                        <div style="color: #e0e0e0;">y = ${formattedY}</div>
                    </div>`;
                }
            } else {
                // 普通函数添加 y = 前缀并格式化
                const formatted = formatMathExpression(formattedExpr);
                formattedExpr = `<div style="text-align: center; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; color: #e0e0e0;">
                    y = ${formatted}
                </div>`;
            }
            
            html += `
                <div class="function-block">
                    <div class="function-title">${formattedExpr}</div>
            `;
            for (const key in fn.params) {
                const p = fn.params[key];
                html += `
                    <div class="slider-container">
                        <div class="slider-value">${key}: <span id="${idBase}-${key}-value">${p.value}</span></div>
                        <input id="${idBase}-${key}-slider" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}">
                    </div>
                `;
            }
            html += `</div>`;
        });
        return html;
    }

    // 获取所有参数当前值
    function getAllParamValues(functions) {
        const allValues = {};
        functions.forEach(fn => {
            const idBase = fn.name || fn.exprs;
            allValues[idBase] = {};
            for (const key in fn.params) {
                const slider = document.getElementById(`${idBase}-${key}-slider`);
                allValues[idBase][key] = slider ? parseFloat(slider.value) : fn.params[key].value;
            }
        });
        return allValues;
    }

    // 区间解析 - 支持参数化区间
    function parseRange(rangeStr, params = {}) {
        // 先尝试匹配纯数字区间
        const match = rangeStr.match(/^([\[\(])\s*([\-\d\.]+)\s*,\s*([\-\d\.]+)\s*([\]\)])$/);
        if (match) {
            return {
                leftType: match[1],
                left: parseFloat(match[2]),
                right: parseFloat(match[3]),
                rightType: match[4]
            };
        }
        
        // 匹配包含参数的区间
        const paramMatch = rangeStr.match(/^([\[\(])\s*([^,]+)\s*,\s*([^,\]]+)\s*([\]\)])$/);
        if (paramMatch) {
            let leftExpr = paramMatch[2].trim();
            let rightExpr = paramMatch[3].trim();
            
            // 先处理负数的幂运算（在参数替换之前）
            leftExpr = leftExpr.replace(/(\-\d+\.?\d*)\^(\d+)/g, 'Math.pow($1, $2)');
            rightExpr = rightExpr.replace(/(\-\d+\.?\d*)\^(\d+)/g, 'Math.pow($1, $2)');
            
            // 先处理变量的幂运算（在参数替换之前）
            leftExpr = leftExpr.replace(/([a-zA-Z_][a-zA-Z0-9]*)\^(\d+)/g, 'Math.pow($1, $2)');
            rightExpr = rightExpr.replace(/([a-zA-Z_][a-zA-Z0-9]*)\^(\d+)/g, 'Math.pow($1, $2)');
            
            // 替换参数（使用单词边界来避免匹配Math中的字母）
            Object.keys(params).forEach(key => {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                leftExpr = leftExpr.replace(regex, params[key]);
                rightExpr = rightExpr.replace(regex, params[key]);
            });
            
            // 将数学符号转换为JavaScript语法（仅用于eval计算）
            // 处理负数的特殊情况
            leftExpr = leftExpr.replace(/(\-\d+\.?\d*)\*\*/g, '($1)**');
            rightExpr = rightExpr.replace(/(\-\d+\.?\d*)\*\*/g, '($1)**');
            
            // 处理负数的特殊情况
            leftExpr = leftExpr.replace(/(\-\d+\.?\d*)\*\*/g, '($1)**');
            rightExpr = rightExpr.replace(/(\-\d+\.?\d*)\*\*/g, '($1)**');
            
            // 添加数学函数支持
            const mathFunctions = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs'];
            mathFunctions.forEach(func => {
                leftExpr = leftExpr.replace(new RegExp(func + '\\(', 'g'), 'Math.' + func + '(');
                rightExpr = rightExpr.replace(new RegExp(func + '\\(', 'g'), 'Math.' + func + '(');
            });
            
            // 处理数学常量
            leftExpr = leftExpr.replace(/\be\b/g, '2.718281828459045');
            rightExpr = rightExpr.replace(/\be\b/g, '2.718281828459045');
            leftExpr = leftExpr.replace(/\bpi\b/g, '3.141592653589793');
            rightExpr = rightExpr.replace(/\bpi\b/g, '3.141592653589793');
            
            // 计算表达式值
            let left, right;
            try {
                console.log(`区间解析: ${rangeStr} -> leftExpr: "${leftExpr}", rightExpr: "${rightExpr}"`);
                left = eval(leftExpr);
                right = eval(rightExpr);
                console.log(`计算结果: left=${left}, right=${right}`);
            } catch (e) {
                console.error('区间表达式计算错误:', e);
                return null;
            }
            
            return {
                leftType: paramMatch[1],
                left: left,
                right: right,
                rightType: paramMatch[4]
            };
        }
        
        return null;
    }

    // 表达式解析
    function parseStandardInput(input, params = {}) {
        let exprs = input.exprs.split(',');
        const ranges = input.ranges.split(';');
        const colors = input.colors.split(',');

        // 如果只有一个exprs但有多个ranges，则扩展exprs
        if (exprs.length === 1 && ranges.length > 1) {
            exprs = Array(ranges.length).fill(exprs[0]);
        }
        const dataArr = [];
        const pointsArr = [];
        for (let i = 0; i < exprs.length; i++) {
            let expr = exprs[i];
            
            // 先处理负数的幂运算（在参数替换之前）
            expr = expr.replace(/(\-\d+\.?\d*)\^(\d+)/g, 'Math.pow($1, $2)');
            
            Object.keys(params).forEach(key => {
                expr = expr.replace(new RegExp(`\\b${key}\\b`, 'g'), params[key]);
            });
            // 将数学符号转换为JavaScript语法（仅用于eval计算）
            // 使用Math.pow来避免JavaScript幂运算的语法问题
            // 处理负数的幂运算，确保括号正确
            expr = expr.replace(/([a-zA-Z_][a-zA-Z0-9]*)\^(\d+)/g, 'Math.pow($1, $2)');
            
            // 处理负数的特殊情况
            expr = expr.replace(/(\-\d+\.?\d*)\*\*/g, '($1)**');
            
            // 添加数学函数支持
            const mathFunctions = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt', 'abs'];
            mathFunctions.forEach(func => {
                expr = expr.replace(new RegExp(func + '\\(', 'g'), 'Math.' + func + '(');
            });
            
            // 处理数学常量
            expr = expr.replace(/\be\b/g, '2.718281828459045');
            expr = expr.replace(/\bpi\b/g, '3.141592653589793');
            const rangeInfo = parseRange(ranges[i], params);
            if (!rangeInfo) continue;
            
            // 检查区间是否有效（左端点小于右端点，但允许单点）
            if (rangeInfo.left > rangeInfo.right) {
                console.warn(`无效区间: [${rangeInfo.left}, ${rangeInfo.right}]`);
                continue;
            }
            // 判断是否为参数方程
            if (input.graphType === 'parametric') {
                const [xExpr, yExpr] = exprs;
                
                // 确保参数方程中的数学常量也被正确处理
                let processedXExpr = xExpr;
                let processedYExpr = yExpr;
                
                // 处理数学常量
                processedXExpr = processedXExpr.replace(/\bpi\b/g, '3.141592653589793');
                processedYExpr = processedYExpr.replace(/\bpi\b/g, '3.141592653589793');
                processedXExpr = processedXExpr.replace(/\be\b/g, '2.718281828459045');
                processedYExpr = processedYExpr.replace(/\be\b/g, '2.718281828459045');
                
                // 在 scope 中添加数学常量
                const scopeWithConstants = {
                    ...params,
                    pi: 3.141592653589793,
                    e: 2.718281828459045
                };
                
                dataArr.push({
                    fnType: 'parametric',
                    graphType: 'polyline',
                    color: colors[i] || colors[0],
                    nSamples: input.nSamples || 200,
                    range: [rangeInfo.left, rangeInfo.right],
                    x: `(${processedXExpr})`,
                    y: `(${processedYExpr})`,
                    scope: scopeWithConstants
                });
                break;
            }
            // 判断是否为单点
            if (rangeInfo.left === rangeInfo.right) {
                let y;
                try {
                    // 先进行参数替换，再计算y值
                    let evalExpr = expr;
                    Object.keys(params).forEach(key => {
                        evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), params[key]);
                    });
                    y = eval(evalExpr.replace(/x/g, `(${rangeInfo.left})`));
                    console.log(`单点计算: expr="${expr}", x=${rangeInfo.left}, y=${y}`);
                } catch (e) { 
                    y = NaN; 
                    console.error('单点计算错误:', e);
                }
                if (!isNaN(y)) {
                    pointsArr.push({
                        points: [[rangeInfo.left, y]],
                        color: colors[i] || colors[0],
                        fnType: 'points',
                        graphType: 'scatter',
                        attr: { r: 8, fill: colors[i] || colors[0], stroke: 'white', 'stroke-width': 2 }
                    });
                    console.log(`添加单点: [${rangeInfo.left}, ${y}], 颜色: ${colors[i] || colors[0]}`);
                }
            } else {
                // 主函数线，修正：加scope: params
                console.log(`绘制函数: ${expr}, 区间: [${rangeInfo.left}, ${rangeInfo.right}], 颜色: ${colors[i] || colors[0]}`);
                
                // 为function-plot创建正确的表达式（保持^符号）
                let plotExpr = exprs[i];
                Object.keys(params).forEach(key => {
                    plotExpr = plotExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), params[key]);
                });
                // 处理数学常量
                plotExpr = plotExpr.replace(/\be\b/g, '2.718281828459045');  // 将独立的 e 替换为数值
                plotExpr = plotExpr.replace(/\bpi\b/g, '3.141592653589793');  // 将独立的 pi 替换为数值
                
                // 确保所有数学常量都被正确替换
                plotExpr = plotExpr.replace(/\bpi\b/g, '3.141592653589793');
                
                // 在 scope 中添加数学常量
                const scopeWithConstants = {
                    ...params,
                    pi: 3.141592653589793,
                    e: 2.718281828459045
                };
                
                dataArr.push({
                    fn: plotExpr,
                    color: colors[i] || colors[0],
                    graphType: input.graphType,
                    nSamples: input.nSamples,
                    range: [rangeInfo.left, rangeInfo.right],
                    scope: scopeWithConstants
                });
                // 不再绘制区间端点圆点
            }
        }
        return dataArr.concat(pointsArr);
    }

    // PlotLayout对象
    var PlotLayout = {
        // 初始化布局
        init: function(title = "函数图像") {
            initPlotLayout();
            document.getElementById('panel-title').textContent = title;
        },
        // 设置控制面板内容
        setControlContent: function(html) {
            document.getElementById('control-content').innerHTML = html;
            const panel = document.getElementById('control-panel');
            if (!html || html.trim() === "") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        },
        // 绘制图像
        drawPlot: function(config) {
            try {
                // 清除旧的图表
                const plotElement = document.getElementById('plot');
                plotElement.innerHTML = '';
                // 创建新的图表
                const instance = functionPlot({
                    target: '#plot',
                    width: document.querySelector('.plot-container').clientWidth,
                    height: document.querySelector('.plot-container').clientHeight,
                    ...config
                });
                window.plotInstance = instance;
                // 应用样式并添加原点标注
                setTimeout(() => {
                    const plotElement = document.getElementById('plot');
                    if (plotElement) {
                        // 强制应用轴标签颜色
                        const axisTexts = plotElement.querySelectorAll('.axis text');
                        axisTexts.forEach(text => {
                            text.style.fill = 'white';
                        });
                        // 强制应用刻度标签颜色
                        const tickTexts = plotElement.querySelectorAll('.tick text');
                        tickTexts.forEach(text => {
                            text.style.fill = 'white';
                        });
                        // 强制应用标注颜色
                        const annotationTexts = plotElement.querySelectorAll('.annotations text');
                        annotationTexts.forEach(text => {
                            text.style.fill = 'white';
                        });
                        // 添加事件监听器来确保图表正确渲染
                        const svg = plotElement.querySelector('svg');
                        if (svg) {
                            svg.addEventListener('wheel', () => {
                                // 重新应用样式
                                setTimeout(() => {
                                    const axisTexts = plotElement.querySelectorAll('.axis text');
                                    axisTexts.forEach(text => {
                                        text.style.fill = 'white';
                                    });
                                    const tickTexts = plotElement.querySelectorAll('.tick text');
                                    tickTexts.forEach(text => {
                                        text.style.fill = 'white';
                                    });
                                }, 50);
                            });
                        }
                    }
                }, 100);
                return instance;
            } catch (error) {
                console.error('绘图错误:', error);
                return null;
            }
        },
        // 主入口
        run: function(data) {
            PlotLayout.init("");
            PlotLayout.setControlContent(renderSliders(data.functions));
            // 更新绘图
            window.updatePlot = function() {
                const allParamValues = getAllParamValues(data.functions);
                // 更新显示
                data.functions.forEach(fn => {
                    const idBase = fn.name || fn.exprs;
                    for (const key in fn.params) {
                        document.getElementById(`${idBase}-${key}-value`).textContent = allParamValues[idBase][key];
                    }
                });
                // 读取当前视图范围
                var xDomain = [-7, 10];
                var yDomain = [-10, 10];
                if (window.plotInstance && window.plotInstance.meta) {
                    if (window.plotInstance.meta.xScale && window.plotInstance.meta.yScale) {
                        if (typeof window.plotInstance.meta.xScale.domain === 'function') {
                            xDomain = window.plotInstance.meta.xScale.domain();
                        }
                        if (typeof window.plotInstance.meta.yScale.domain === 'function') {
                            yDomain = window.plotInstance.meta.yScale.domain();
                        }
                    }
                }
                // 合并所有函数的 data
                let plotData = [];
                data.functions.forEach(fn => {
                    const idBase = fn.name || fn.exprs;
                    plotData = plotData.concat(parseStandardInput(fn, allParamValues[idBase]));
                });
                window.plotInstance = PlotLayout.drawPlot({
                    grid: true,
                    xAxis: { domain: xDomain, label: 'x', color: 'white' },
                    yAxis: { domain: yDomain, label: 'y', color: 'white' },
                    disableZoom: false,
                    data: plotData,
                    annotations: [
                        {x: 0, text: 'y轴'},
                        {y: 0, text: 'x轴'}
                    ],
                    tip: {
                        renderer: function(x, y) {
                            return '(' + x.toFixed(2) + ', ' + y.toFixed(2) + ')';
                        }
                    }
                });
            };
            // 监听所有滑块
            document.addEventListener('DOMContentLoaded', function() {
                data.functions.forEach(fn => {
                    const idBase = fn.name || fn.exprs;
                    for (const key in fn.params) {
                        document.getElementById(`${idBase}-${key}-slider`).addEventListener('input', window.updatePlot);
                    }
                });
                window.updatePlot();
            });
        }
    };

    // 保证 PlotLayout 正确挂载到 window
    if (typeof window !== 'undefined') {
        window.PlotLayout = PlotLayout;
    }
})();