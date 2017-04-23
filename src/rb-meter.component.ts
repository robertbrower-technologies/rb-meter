import {Component, Input, ViewChild, AfterViewInit} from "@angular/core";

import {RbMeterConfig} from './rb-meter.config';

@Component({
  selector: `rb-meter`,
  template: `<canvas #myCanvas width="{{width}}" height="{{height}}"></canvas>`
})

export class RbMeterComponent implements AfterViewInit {
    
    settings: any;
    
    @Input('width') width: number;
    
    @Input('height') height: number;
    
    @Input('config') config: any;
    
    @ViewChild("myCanvas") myCanvas;
    
    running: boolean;
    
    ngOnInit() {
        this.running = true;
    }

    ngOnDestroy() {
        this.running = false;
    }

    ngAfterViewInit() {
        
        this.tick();
    }

    tick() {
        if (this.running) {
            this.settings = Object.assign({}, RbMeterConfig, this.config);
            this.draw()
            requestAnimationFrame(()=> {
                this.tick()
            });
        }
    }
  
    draw() {
        this.settings.width = this.width;
        this.settings.height = this.height;

        if (this.settings.canvas == undefined) {
            this.settings.canvas = this.myCanvas.nativeElement;
            
        } else {
            this.settings.context.clearRect(0, 0, this.settings.canvas.width, this.settings.canvas.height);
        }
                        
        if (this.settings.width > this.settings.height) {

            var topLeft = {
                x: (this.settings.width - this.settings.height) / 2
                , y: 0
            };

            var bottomRight = {
                x: topLeft.x + this.settings.height
                , y: this.settings.height
            };

            this.settings.drawRect = {
                topLeft: topLeft
                , bottomRight: bottomRight
            };

        } else if (this.settings.height > this.settings.width) {

            var topLeft = {
                x: 0
                , y: (this.settings.height - this.settings.width) / 2
            };

            var bottomRight = {
                x: this.settings.width
                , y: topLeft.y + this.settings.width
            };

            this.settings.drawRect = {
                topLeft: topLeft
                , bottomRight: bottomRight
            };

        } else {

            var topLeft = {
                x: 0
                , y: 0
            };

            var bottomRight = {
                x: this.settings.width
                , y: this.settings.height
            };

            this.settings.drawRect = {
                topLeft: topLeft
                , bottomRight: bottomRight
            };

        }

        this.settings.drawRect.diameter = this.settings.drawRect.bottomRight.x - this.settings.drawRect.topLeft.x;
        this.settings.ringRect = this.settings.drawRect;
        this.settings.ringWidth = this.settings.ringWidthPercent * this.settings.drawRect.diameter;
        
        this.settings.bevelRect = {
            topLeft: {
                x: this.settings.ringRect.topLeft.x + this.settings.ringWidth
                , y: this.settings.ringRect.topLeft.y + this.settings.ringWidth
            }
            , bottomRight: {
                x: this.settings.ringRect.bottomRight.x - this.settings.ringWidth
                , y: this.settings.ringRect.bottomRight.y - this.settings.ringWidth
            }
        };

        this.settings.bevelRect.diameter = this.settings.bevelRect.bottomRight.x - this.settings.bevelRect.topLeft.x;
        this.settings.bevelWidth = this.settings.bevelWidthPercent * (this.settings.ringRect.diameter - (this.settings.ringWidth * 2));

        this.settings.backgroundRect = {
            topLeft: {
                x: this.settings.bevelRect.topLeft.x + this.settings.bevelWidth
                , y: this.settings.bevelRect.topLeft.y + this.settings.bevelWidth
            }
            , bottomRight: {
                x: this.settings.bevelRect.bottomRight.x - this.settings.bevelWidth
                , y: this.settings.bevelRect.bottomRight.y - this.settings.bevelWidth
            }
        };

        this.settings.backgroundRect.diameter = this.settings.backgroundRect.bottomRight.x - this.settings.backgroundRect.topLeft.x;
        this.settings.context = this.settings.canvas.getContext("2d");

        this.drawRing();
        this.drawBackground();
        this.drawTicks();
        this.drawDigits();
        this.drawUnits();
        this.drawIndicator();
        this.drawReflection();

    }
    
    drawRing() {
                
        this.drawEllipse(this.settings.context, this.settings.ringRect.topLeft.x, this.settings.ringRect.topLeft.y, this.settings.ringRect.diameter, this.settings.ringRect.diameter);
        var gradient = this.settings.context.createLinearGradient(this.settings.ringRect.topLeft.x, this.settings.ringRect.topLeft.y, this.settings.ringRect.bottomRight.x, this.settings.ringRect.bottomRight.y);
        gradient.addColorStop(0, this.settings.ringGradientColorStop1);
        gradient.addColorStop(1, this.settings.ringGradientColorStop0);
        this.settings.context.fillStyle = gradient;
        this.settings.context.fill();

        this.drawEllipse(this.settings.context, this.settings.bevelRect.topLeft.x, this.settings.bevelRect.topLeft.y, this.settings.bevelRect.diameter, this.settings.bevelRect.diameter);
        gradient = this.settings.context.createLinearGradient(this.settings.bevelRect.topLeft.x, this.settings.bevelRect.topLeft.y, this.settings.bevelRect.bottomRight.x, this.settings.bevelRect.bottomRight.y);
        gradient.addColorStop(0, this.settings.ringGradientColorStop0);
        gradient.addColorStop(1, this.settings.ringGradientColorStop1);
        this.settings.context.fillStyle = gradient;
        this.settings.context.fill();

    }
        
    drawBackground() {
                        
        this.settings.context.save();

        this.drawEllipse(this.settings.context,
            this.settings.backgroundRect.topLeft.x,
            this.settings.backgroundRect.topLeft.y,
            this.settings.backgroundRect.diameter,
            this.settings.backgroundRect.diameter);

        var gradient = this.settings.context.createRadialGradient(
            this.settings.backgroundRect.topLeft.x + (this.settings.backgroundRect.diameter / 2),
            this.settings.backgroundRect.topLeft.y + (this.settings.backgroundRect.diameter * this.settings.backgroundGradientYPercent),
            this.settings.backgroundRect.diameter / (this.settings.backgroundRect.diameter / 2),
            this.settings.backgroundRect.topLeft.x + (this.settings.backgroundRect.diameter / 2),
            this.settings.backgroundRect.topLeft.y + (this.settings.backgroundRect.diameter / 2),
            this.settings.backgroundRect.diameter / 2);
        
        var color = undefined;
        for (var j=0; j<this.settings.backgroundGradientColorStop0Ranges.length; j++) {
            let range = this.settings.backgroundGradientColorStop0Ranges[j];
            if (this.settings.value <= range.maxValue) {
                color = range.color;
                break;
            }
        }
                        
        gradient.addColorStop(0, color);
        
        for (var j=0; j<this.settings.backgroundGradientColorStop1Ranges.length; j++) {
            let range = this.settings.backgroundGradientColorStop1Ranges[j];
            if (this.settings.value <= range.maxValue) {
                color = range.color;
                break;
            }
        }
        
        gradient.addColorStop(1, color);
        this.settings.context.fillStyle = gradient;
        this.settings.context.fill();

        this.settings.context.restore();

    }
    
    drawTicks() {
        
        this.settings.tickColorRanges.sort(function (a, b) {
            return ((a.maxValue < b.maxValue) ? -1 : ((a.maxValue > b.maxValue) ? 1 : 0));
        });

        this.settings.majorTickRotation = (this.settings.tickEndAngle - this.settings.tickStartAngle) / this.settings.majorDivisions;
        this.settings.minorTickRotation = this.settings.majorTickRotation / this.settings.minorDivisions;
        this.settings.majorValueIncrement = (this.settings.maxValue - this.settings.minValue) / this.settings.majorDivisions;
        this.settings.minorValueIncrement = this.settings.majorValueIncrement / this.settings.minorDivisions;
        
        for (var i = 0; i < this.settings.majorDivisions + 1; i++) {

            var tickValue = this.settings.minValue + (i * this.settings.majorValueIncrement);

            var color = undefined;
            for (var j=0; j<this.settings.tickColorRanges.length; j++) {
                let range = this.settings.tickColorRanges[j];
                if (tickValue <= range.maxValue) {
                    color = range.color;
                    break;
                }
            }

            this.settings.context.save();

            this.settings.context.translate(this.settings.canvas.width / 2, this.settings.canvas.height / 2);
            this.settings.context.rotate((this.settings.tickStartAngle + (i * this.settings.majorTickRotation)) * Math.PI / 180);
            this.settings.context.translate(-this.settings.canvas.width / 2, -this.settings.canvas.height / 2);
            this.settings.context.fillStyle = color;
            this.settings.context.fillRect(
                this.settings.backgroundRect.topLeft.x + (this.settings.backgroundRect.diameter / 2) - (this.settings.majorTickWidth / 2),
                this.settings.backgroundRect.topLeft.y + this.settings.majorTickPadding,
                this.settings.majorTickWidth, this.settings.majorTickLength);

            this.settings.context.restore();
        }

        for (var i = 0; i < this.settings.majorDivisions; i++)
        {
            for (var j = 0; j < this.settings.minorDivisions; j++)
            {
                var majorTickValue = this.settings.minValue + (i * this.settings.majorValueIncrement);
                var minorTickValue = majorTickValue + (j * this.settings.minorValueIncrement);

                if (minorTickValue == majorTickValue) {
                    continue;
                }

                var majorRotation = this.settings.tickStartAngle + (i * this.settings.majorTickRotation);
                var minorRotation = majorRotation + (j * this.settings.minorTickRotation);

                var color = undefined;
                for (var k=0; k<this.settings.tickColorRanges.length; k++) {
                    let range = this.settings.tickColorRanges[k];
                    if (minorTickValue <= range.maxValue) {
                        color = range.color;
                        break;
                    }
                }

                this.settings.context.save();

                this.settings.context.translate(this.settings.canvas.width / 2, this.settings.canvas.height / 2);
                this.settings.context.rotate(minorRotation * Math.PI / 180);
                this.settings.context.translate(-this.settings.canvas.width / 2, -this.settings.canvas.height / 2);
                this.settings.context.fillStyle = color;
                this.settings.context.fillRect(
                    this.settings.backgroundRect.topLeft.x + (this.settings.backgroundRect.diameter / 2) - (this.settings.minorTickWidth / 2),
                    this.settings.backgroundRect.topLeft.y + this.settings.minorTickPadding,
                    this.settings.minorTickWidth, this.settings.minorTickLength);

                this.settings.context.restore();
            }
        }
    }

    // see http://www.informit.com/articles/article.aspx?p=1903884&seqNum=5

    drawDigits() {

        this.settings.digitColorRanges.sort(function (a, b) {
            return ((a.maxValue < b.maxValue) ? -1 : ((a.maxValue > b.maxValue) ? 1 : 0));
        });

        for (var i = 0; i < this.settings.majorDivisions + 1; i++)
        {
            var digitValue = this.settings.minValue + (i * this.settings.majorValueIncrement);
            var text = digitValue.toFixed(this.settings.digitDecimalPlaces);
            var angle = (this.settings.tickStartAngle + (i * this.settings.majorTickRotation) - 90) * (Math.PI / 180);

            var color = undefined;
            for (var j=0; j<this.settings.digitColorRanges.length; j++) {
                let range = this.settings.digitColorRanges[j];
                if (digitValue <= range.maxValue) {
                    color = range.color;
                    break;
                }
            }

            this.settings.context.save();
            
            this.settings.context.font = this.settings.digitFontHeight + "px " + this.settings.digitFontName;
            this.settings.context.textAlign = "center";
            this.settings.context.textBaseline = "middle";
            this.settings.context.fillStyle = color;
                        
            var textWidth = this.settings.context.measureText(text).width;

            this.settings.context.fillText(text,
                this.settings.canvas.width / 2 + Math.cos(angle) * (this.settings.backgroundRect.diameter / 2 - this.settings.majorTickPadding - this.settings.majorTickLength - this.settings.digitPadding),
                this.settings.canvas.height / 2 + Math.sin(angle) * (this.settings.backgroundRect.diameter / 2 - this.settings.majorTickPadding - this.settings.majorTickLength - this.settings.digitPadding));

                        
            this.settings.context.restore();
        }

    }

    drawUnits() {
                
        this.settings.context.save();

        this.settings.context.font = this.settings.unitsFont;
        this.settings.context.textAlign = "center";
        this.settings.context.textBaseline = "middle";
        this.settings.context.fillStyle = this.settings.unitsColor;
        this.settings.context.fillText(this.settings.units,
            this.settings.backgroundRect.topLeft.x + (this.settings.backgroundRect.diameter / 2),
            this.settings.backgroundRect.topLeft.y + (this.settings.backgroundRect.diameter / 2) + this.settings.backgroundRect.diameter / 2 * this.settings.unitsPadding);

        this.settings.context.restore();
        
    }

    drawIndicator() {

        var rotation =
            (((this.settings.value - this.settings.minValue) * (this.settings.tickEndAngle - this.settings.tickStartAngle)) / (this.settings.maxValue - this.settings.minValue)) + this.settings.tickStartAngle;

        this.settings.context.save();

        // shadow
        this.settings.context.translate(this.settings.canvas.width / 2, this.settings.canvas.height / 2);
        this.settings.context.rotate(rotation * Math.PI / 180);
        this.settings.context.translate(-this.settings.canvas.width / 2, -this.settings.canvas.height / 2);
        this.settings.context.fillStyle = this.settings.indicatorShadowColor;

        this.drawEllipse(this.settings.context,
            this.settings.canvas.width / 2 - (this.settings.indicatorCenterDiameter / 2) - this.settings.indicatorShadowXOffset,
            this.settings.canvas.height / 2 - (this.settings.indicatorCenterDiameter / 2) - this.settings.indicatorShadowYOffset,
            this.settings.indicatorCenterDiameter,
            this.settings.indicatorCenterDiameter);
                
        this.settings.context.fill();

        this.settings.context.beginPath();
        this.settings.context.moveTo(
            this.settings.canvas.width / 2 - (this.settings.indicatorCenterDiameter / 2) - this.settings.indicatorShadowXOffset,
            this.settings.canvas.height / 2 - this.settings.indicatorShadowYOffset);
        this.settings.context.lineTo(this.settings.canvas.width / 2 - this.settings.indicatorShadowXOffset, this.settings.backgroundRect.topLeft.y + this.settings.indicatorShadowYOffset);
        this.settings.context.lineTo(this.settings.canvas.width / 2 + (this.settings.indicatorCenterDiameter / 2) - this.settings.indicatorShadowXOffset, this.settings.canvas.height / 2 - this.settings.indicatorShadowYOffset);

        this.settings.context.fill();

        this.settings.context.restore();

        this.settings.context.save();

        // indicator
        this.settings.context.translate(this.settings.canvas.width / 2, this.settings.canvas.height / 2);
        this.settings.context.rotate(rotation * Math.PI / 180);
        this.settings.context.translate(-this.settings.canvas.width / 2, -this.settings.canvas.height / 2);
        this.settings.context.fillStyle = this.settings.indicatorColor;

        this.drawEllipse(this.settings.context,
            this.settings.canvas.width / 2 - (this.settings.indicatorCenterDiameter / 2),
            this.settings.canvas.height / 2 - (this.settings.indicatorCenterDiameter / 2),
            this.settings.indicatorCenterDiameter,
            this.settings.indicatorCenterDiameter);

        this.settings.context.fill();

        this.settings.context.beginPath();
        this.settings.context.moveTo(
            this.settings.canvas.width / 2 - (this.settings.indicatorCenterDiameter / 2),
            this.settings.canvas.height / 2);
        this.settings.context.lineTo(this.settings.canvas.width / 2, this.settings.backgroundRect.topLeft.y);
        this.settings.context.lineTo(this.settings.canvas.width / 2 + (this.settings.indicatorCenterDiameter / 2), this.settings.canvas.height / 2);

        this.settings.context.fill();
        
        this.settings.context.restore();

    }

    drawReflection() {

        this.settings.context.save();

        this.settings.context.fillStyle = this.settings.reflectionColor;

        var width = this.settings.backgroundRect.diameter * this.settings.reflectionWidthPercent;
        var height = this.settings.backgroundRect.diameter * this.settings.reflectionHeightPercent;

        this.drawEllipse(this.settings.context,
            this.settings.canvas.width / 2 - ((this.settings.backgroundRect.diameter * this.settings.reflectionWidthPercent) / 2),
            this.settings.backgroundRect.topLeft.y + this.settings.reflectionPadding,
            width,
            height);

        this.settings.context.globalAlpha = this.settings.reflectionTransparency;
        this.settings.context.fill();

        this.settings.context.restore();

    }

    drawEllipse(ctx, x, y, w, h) {
        var kappa = .5522848,
          ox = (w / 2) * kappa, // control point offset horizontal
          oy = (h / 2) * kappa, // control point offset vertical
          xe = x + w,           // x-end
          ye = y + h,           // y-end
          xm = x + w / 2,       // x-middle
          ym = y + h / 2;       // y-middle

        ctx.beginPath();
        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    }
}