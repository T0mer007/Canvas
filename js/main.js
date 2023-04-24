'use strict'


let gElCanvas
let gCtx
let gCurrShape = 'pencil'
let gStartPos
let gIsDrawing = false
let gUserColor = 'black'
let gUserBgColor = '#eeeded'
const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    gElCanvas = document.querySelector('.canvas')
    gCtx = gElCanvas.getContext('2d')
    resizeCanvas()
    addListeners()
    renderCanvas()
}

function onChangeBgColor(val) {
    gUserBgColor = val
    renderCanvas()
}

function onChangeUserColor(val) {
    gUserColor = val
}

function changeShape(val) {
    gCurrShape = val
}

function renderCanvas() {
    gCtx.fillStyle = gUserBgColor
    gCtx.fillRect(0, 0, gElCanvas.width, gElCanvas.height)
}

function resizeCanvas() {
    const elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.clientWidth
    gElCanvas.height = elContainer.clientHeight
}

function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', () => {
        onInit()
    })
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function onClearCanvas() {
    renderCanvas()
}

function onDown(ev) {
    const pos = getEvPos(ev)
    gIsDrawing = true
    gStartPos = pos
}

function onMove(ev) {
    if (!gIsDrawing) return
    document.querySelector('canvas').style.cursor = 'crosshair'
    const pos = getEvPos(ev)
    const dx = pos.x
    const dy = pos.y
    switch (gCurrShape) {
        case 'pencil':
            drawLine(gStartPos.x, gStartPos.y, dx, dy, gUserColor)
            break;
        case 'square':
            drawRect(dx, dy, gUserColor)
            break
        case 'circle':
            drawArc(dx, dy, 40, gUserColor)
    }
    gStartPos = pos
}

function onUp() {
    gIsDrawing = false
    document.querySelector('canvas').style.cursor = 'copy'
}

function getEvPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }
    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX + ev.target.offsetLeft - ev.target.clientLeft - 37,
            y: ev.pageY + ev.target.offsetTop - ev.target.clientTop - 37,
        }
        console.log('pos: ', pos)
    }
    return pos
}

//Circle

function drawArc(x, y, size = 60, color) {
    gCtx.beginPath()
    gCtx.lineWidth = '0'
    gCtx.arc(x, y, size, 0, 2 * Math.PI)
    gCtx.strokeStyle = 'grey'
    gCtx.stroke()
    gCtx.fillStyle = color
    gCtx.fill()
}

//pencil

function drawLine(x, y, xEnd, yEnd, color) {
    gCtx.beginPath()
    gCtx.moveTo(x, y)
    gCtx.lineTo(xEnd, yEnd)
    gCtx.lineWidth = 3
    gCtx.strokeStyle = color
    gCtx.stroke()
}

//Square

function drawRect(x, y, color) {
    gCtx.strokeStyle = 'grey'
    gCtx.strokeRect(x, y, 60, 90)
    gCtx.fillStyle = color
    gCtx.fillRect(x, y, 60, 90)
}

function onDownloadCanvas(elLink) {
    const data = gElCanvas.toDataURL()
    elLink.href = data
    elLink.download = 'my-img.jpg'
}

function drawImgFromlocal() {
    let file = document.querySelector('.upload').value
    console.log('file: ', file)
    const img = new Image()
    img.src = file
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
    }
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()
    reader.onload = function (event) {
        let img = new Image()
        img.src = event.target.result
        img.onload = () => onImageReady(img)
    }
    reader.readAsDataURL(ev.target.files[0])
}

function renderImg(img) {
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}

function onUploadImg() {
    const imgDataUrl = gElCanvas.toDataURL('image/jpeg')
    function onSuccess(uploadedImgUrl) {
        const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        console.log(encodedUploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}`)
    }
    doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
    const formData = new FormData()
    formData.append('img', imgDataUrl)
    const XHR = new XMLHttpRequest()
    XHR.onreadystatechange = () => {
        if (XHR.readyState !== XMLHttpRequest.DONE) return
        if (XHR.status !== 200) return console.error('Error uploading image')
        const { responseText: url } = XHR
        console.log('Got back live url:', url)
        onSuccess(url)
    }
    XHR.onerror = (req, ev) => {
        console.error('Error connecting to server with request:', req, '\nGot response data:', ev)
    }
    XHR.open('POST', '//ca-upload.com/here/upload.php')
    XHR.send(formData)
}


