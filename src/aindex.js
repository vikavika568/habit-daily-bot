const
    fs = require("fs"),
    {createCanvas} = require("canvas");

function generateJpeg() {
  const WIDTH = 1130;
  const HEIGHT = 900;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#000000';
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);

  function fillRowColor(row) {
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, (row - 1) * 30,  WIDTH, 30);
  }

  function fillCell(row, cell) {
    ctx.fillStyle = "#000";
    ctx.fillRect((cell - 1) * 30 + 200 + 2, (row - 1) * 30 + 2,  30 - 4, 30 - 4);
  }

  function fillText(text, row, small = true) {
    ctx.font = small ? "16px serif" : "20px serif";
    ctx.fillStyle = "#000000";
    ctx.fillText( text, 10, (row - 1) * 30 + 20);
  }

  function fillDay(text, cell) {
    ctx.font = "10px serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = 'center';
    ctx.fillText( text, ((cell - 1) * 30 + 200) + 15, 20);
  }

  fillRowColor(2);
  fillRowColor(11);
  fillRowColor(21);
  fillText("Общие", 2, false);
  fillText("Витя", 11, false);
  fillText("Викулик", 21, false);
  fillCell(3,1);

  fillText("Чистая кухня вечером", 3);

  for (let i = 1; i <= 31; i++) {
    fillDay(`${String(i).padStart(2, '0')}.10`, i)
  }

  for (let i = 1; i <= 30; i++) {
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(0, i * 30);
    ctx.lineTo(WIDTH, i * 30);
    ctx.stroke();
    ctx.closePath();
  }

  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(200, HEIGHT);
  ctx.stroke();
  ctx.closePath();

  for (let i = 1; i <= 31; i++) {
    ctx.strokeStyle = i % 7 ? '#ccc' : '#000';
    ctx.beginPath();
    ctx.moveTo((i * 30) + 200, 0);
    ctx.lineTo((i * 30) + 200, HEIGHT);
    ctx.stroke();
    ctx.closePath();
  }

  return canvas.toBuffer("image/png");
  
}

module.exports= generateJpeg
