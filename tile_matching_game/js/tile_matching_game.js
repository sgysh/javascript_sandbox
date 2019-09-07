class Game {
    constructor() {
        this.blockSize = 20;
        this.stageCanvas = document.getElementById("stage");
        this.stageHeightNum = this.stageCanvas.height / this.blockSize;
        this.stageWidthNum = this.stageCanvas.width / this.blockSize;
        this.backgroundColor = "gray";
        this.currentPos = {
            x: Math.floor(this.stageWidthNum / 2),
            y: 0
        };
        document.getElementById("rotate-button").onmousedown = (e) => {
            this.rotate();
        }
        document.getElementById("left-button").onmousedown = (e) => {
            this.left();
        }
        document.getElementById("fall-button").onmousedown = (e) => {
            this.fall();
        }
        document.getElementById("right-button").onmousedown = (e) => {
            this.right();
        }

        document.onkeydown = (e) => {
            switch (e.code) {
                case "ArrowUp":
                    this.rotate();
                    break;
                case "ArrowLeft":
                    this.left();
                    break;
                case "ArrowDown":
                    this.fall();
                    break;
                case "ArrowRight":
                    this.right();
                    break;
            }
        }

        this.blocks = [
            {
                shape: [[0, -1], [0, 0], [0, 1], [0, 2]],
                color: "yellow"
            },
            {
                shape: [[0, -1], [0, 0], [0, 1], [1, 0]],
                color: "green"
            },
            {
                shape: [[0, -1], [0, 0], [1, -1], [1, 0]],
                color: "blue"
            },
            {
                shape: [[0, -1], [0, 0], [0, 1], [1, 1]],
                color: "red"
            }
        ];
        this.newBlock();
    }

    startGame() {
        this.stageArray = new Array(this.stageHeightNum + 1);
        for (let y = 0; y < this.stageHeightNum; y++) {
            this.stageArray[y] = new Array(this.stageWidthNum + 2).fill({
                style: this.backgroundColor,
                empty: true
            });
            this.stageArray[y][0] = {
                style: null,
                empty: false
            };
            this.stageArray[y][this.stageWidthNum + 1] = {
                style: null,
                empty: false
            };
        }
        this.stageArray[this.stageHeightNum] = new Array(this.stageWidthNum + 2).fill({
            style: null,
            empty: false
        })
        this.timerID = setInterval(this.tick.bind(this), 500);
    }

    tick() {
        this.fall();
        this.refresh();
    }

    newBlock() {
        const next = this.blocks[Math.floor(Math.random() * this.blocks.length)];
        this.currentBlock = {
            shape: [],
            color: next.color
        };
        for (let n of next.shape) {
            this.currentBlock.shape.push([n[0], n[1]]);
        }
    }

    updateStage() {
        let deleted = 0;
        for (let y = this.stageHeightNum - 1; y >= 0; y--) {
            deleted += 1;
            for (let x = 1; x < this.stageWidthNum + 1; x++) {
                if (this.stageArray[y][x].empty === true) {
                    deleted -= 1;  // cancel
                    this.stageArray[y + deleted] = this.stageArray[y];
                    break;
                }
            }
        }

        for (let y = deleted - 1; y >= 0; y--) {
            this.stageArray[y] = new Array(this.stageWidthNum + 2).fill({
                style: this.backgroundColor,
                empty: true
            });
            this.stageArray[y][0] = {
                style: null,
                empty: false
            };
            this.stageArray[y][this.stageWidthNum + 1] = {
                style: null,
                empty: false
            };
        }
    }

    drawBlock(remove) {
        let color, isEmpty;
        const context = this.stageCanvas.getContext("2d");
        context.fillStyle = this.currentBlock.color;
        if (remove === true) {
            color = this.backgroundColor;
            isEmpty = true;
        } else {
            color = this.currentBlock.color;
            isEmpty = false;
        }
        for (let s of this.currentBlock.shape) {
            if (this.currentPos.y + s[1] >= 0) {
                this.stageArray[this.currentPos.y + s[1]][this.currentPos.x + s[0]] = {
                    style: color,
                    empty: isEmpty
                };
            }
        }
    }

    changeAngle() {
        for (let s of this.currentBlock.shape) {
            // Rotation matrix
            let tmpX = s[0];
            s[0] = s[1] * -1;
            s[1] = tmpX;
        }
    }

    rotate() {
        this.drawBlock(true);
        this.changeAngle();
        if (this.checkCollision(0, 0) === true) {
            this.changeAngle();
            this.changeAngle();
            this.changeAngle();
        }
        this.drawBlock(false);
    }

    fall() {
        this.drawBlock(true);
        if (this.checkCollision(0, 1) === true) {
            this.drawBlock(false);
            this.updateStage();
            if (this.checkGameover() === true) {
                clearInterval(this.timerID);
                this.refresh();
                return;
            }
            this.currentPos = {
                x: Math.floor(this.stageWidthNum / 2),
                y: 0
            };
            this.newBlock();
            return;
        }
        this.currentPos.y += 1;
        this.drawBlock(false);
    }

    right() {
        this.drawBlock(true);
        if (this.checkCollision(1, 0) === true) {
            this.drawBlock(false);
            return;
        }
        this.currentPos.x += 1;
        this.drawBlock(false);
    }

    left() {
        this.drawBlock(true);
        if (this.checkCollision(-1, 0) === true) {
            this.drawBlock(false);
            return;
        }
        this.currentPos.x -= 1;
        this.drawBlock(false);
    }

    refresh() {
        const context = this.stageCanvas.getContext("2d");
        for(let y = 0; y < this.stageHeightNum; y++) {
            for (let x = 1; x < this.stageWidthNum + 1; x++) {
                context.fillStyle = this.stageArray[y][x].style;

                context.fillRect(
                    (x - 1) * this.blockSize,
                    y * this.blockSize,
                    this.blockSize,
                    this.blockSize
                );
            }
        }
    }

    checkCollision(diffX, diffY) {
        for (let s of this.currentBlock.shape) {
            if (this.currentPos.y + diffY + s[1] >= 0 && this.stageArray[this.currentPos.y + diffY + s[1]][this.currentPos.x + diffX + s[0]].empty === false) {
                return true;
            }
        }
        return false;
    }

    checkGameover() {
        for (let s of this.currentBlock.shape) {
            if (this.currentPos.y + s[1] < 0) {
                return true;
            }
        }
        return false;
    }
}
