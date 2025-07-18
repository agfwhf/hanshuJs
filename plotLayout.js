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

            /* 原点O标注特别样式 */
            #plot .annotations text[text-anchor="middle"] {
                fill: white !important;
                font-size: 16px !important;
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
                font-size: 20px;
                font-weight: bold;
                color: #1976d2;
                background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
                margin-bottom: 10px;
                text-align: center;
                letter-spacing: 2px;
                border-radius: 6px;
                box-shadow: 0 1px 4px rgba(66, 165, 245, 0.10);
                padding: 6px 0 6px 0;
                text-shadow: none;
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

    // 添加原点标注
    function addOriginLabel(instance) {
        const plotElement = document.getElementById('plot');
        const svg = plotElement.querySelector('svg');
        
        if (svg && instance) {
            // 移除已存在的原点标注
            const existingOrigin = svg.querySelector('#origin-label');
            if (existingOrigin) {
                existingOrigin.remove();
            }
            
            // 获取坐标转换信息
            const xScale = instance.meta.xScale;
            const yScale = instance.meta.yScale;
            
            if (xScale && yScale) {
                // 计算原点(0,0)在SVG中的像素位置
                const originX = xScale(0);
                const originY = yScale(0);
                
                // 创建文本元素
                const originLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                originLabel.setAttribute('id', 'origin-label');
                originLabel.setAttribute('x', originX - 10);
                originLabel.setAttribute('y', originY - 10);
                originLabel.setAttribute('fill', 'white');
                originLabel.setAttribute('font-size', '16px');
                originLabel.setAttribute('font-weight', 'bold');
                originLabel.setAttribute('text-anchor', 'middle');
                originLabel.textContent = 'O';
                
                // 添加到SVG中
                svg.appendChild(originLabel);
            }
        }
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
            script.src = 'https://cdn.jsdelivr.net/npm/function-plot@1.22.7/dist/function-plot.js';
            script.onload = function() {
                console.log('function-plot loaded');
            };
            document.head.appendChild(script);
        }
    }

    // 渲染参数滑块区块
    function renderSliders(functions) {
        let html = '';
        functions.forEach(fn => {
            // 自动用exprs作为标题和唯一标识
            const idBase = fn.name || fn.exprs;
            html += `
                <div class="function-block">
                    <div class="function-title">${fn.exprs}</div>
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

    // 区间解析
    function parseRange(rangeStr) {
        const match = rangeStr.match(/^\s*([\[\(])\s*([\-\d\.]+)\s*,\s*([\-\d\.]+)\s*([\]\)])\s*$/);
        if (!match) return null;
        return {
            leftType: match[1],
            left: parseFloat(match[2]),
            right: parseFloat(match[3]),
            rightType: match[4]
        };
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
            Object.keys(params).forEach(key => {
                expr = expr.replace(new RegExp(key, 'g'), params[key]);
            });
            const rangeInfo = parseRange(ranges[i]);
            if (!rangeInfo) continue;
            // 判断是否为参数方程
            if (input.graphType === 'parametric') {
                const [xExpr, yExpr] = exprs;
                dataArr.push({
                    fnType: 'parametric',
                    graphType: 'polyline',
                    color: colors[i] || colors[0],
                    nSamples: input.nSamples || 200,
                    range: [rangeInfo.left, rangeInfo.right],
                    x: `(${xExpr})`,
                    y: `(${yExpr})`,
                    scope: params
                });
                break;
            }
            // 判断是否为单点
            if (rangeInfo.left === rangeInfo.right) {
                let y;
                try {
                    y = eval(expr.replace(/x/g, `(${rangeInfo.left})`));
                } catch { y = NaN; }
                if (!isNaN(y)) {
                    pointsArr.push({
                        points: [[rangeInfo.left, y]],
                        color: colors[i] || colors[0],
                        fnType: 'points',
                        graphType: 'scatter',
                        attr: { r: 8, fill: colors[i] || colors[0], stroke: 'white', 'stroke-width': 2 }
                    });
                }
            } else {
                // 主函数线，修正：加scope: params
                dataArr.push({
                    fn: expr,
                    color: colors[i] || colors[0],
                    graphType: input.graphType,
                    nSamples: input.nSamples,
                    range: [rangeInfo.left, rangeInfo.right],
                    scope: params
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
                        // 添加原点O标注
                        addOriginLabel(instance);
                        // 添加事件监听器来确保原点O跟随所有变换
                        const svg = plotElement.querySelector('svg');
                        if (svg) {
                            svg.addEventListener('wheel', () => {
                                setTimeout(() => addOriginLabel(instance), 50);
                            });
                            svg.addEventListener('mousedown', () => {
                                const handleMouseMove = () => {
                                    setTimeout(() => addOriginLabel(instance), 10);
                                };
                                const handleMouseUp = () => {
                                    setTimeout(() => addOriginLabel(instance), 50);
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                };
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                            });
                            svg.addEventListener('dblclick', () => {
                                setTimeout(() => addOriginLabel(instance), 100);
                            });
                            const observer = new MutationObserver(() => {
                                setTimeout(() => addOriginLabel(instance), 10);
                            });
                            observer.observe(svg, {
                                childList: true,
                                subtree: true,
                                attributes: true,
                                attributeFilter: ['transform']
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
        // 获取原点标注函数
        addOriginLabel: addOriginLabel,
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