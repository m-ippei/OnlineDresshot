class ImageBuild {

    constructor(importItems = {}) {
        if (importItems !== {}) {
            this.items = importItems
            this.urls = []
            this.genImg = null
            this.lineArtCanvas = null


            this.itemOptions = document.querySelector('#styles')
            if (this.items.items) {
                for (let i = 0; i < this.items.items.length; i++) {
                    const itemOption = document.createElement('option')
                    itemOption.textContent = this.items.items[i]["style"] + "▼"
                    itemOption.value = i
                    this.itemOptions.appendChild(itemOption)
                }
            }

            if (this.items.items[0]["LineArtURL"]) {
                this.partsOptions = document.querySelector('#parts')
                for (let i = 0; i < this.items.items[0]["parts"].length; i++) {
                    const partsOption = document.createElement('option')
                    partsOption.textContent = this.items.items[0]["parts"][i]["name"] + "▼"
                    partsOption.value = this.items.items[0]["parts"][i]["url"]
                    this.partsOptions.appendChild(partsOption)
                }
            }



            const userAgent = navigator.userAgent.toLocaleLowerCase()

            if (userAgent.indexOf('chrome') != -1) {
                this.itemOptions.addEventListener('change', (event) => {
                    IM.resetStyleOptions(event.target.value)
                })

                this.partsOptions.addEventListener('change', (event) => {
                    IM.loadImage(event.target.value)
                    IM.genCanvas.hidden = true
                    IM.preview()
                })
            } else if (userAgent.indexOf('safari') != -1) {
                this.itemOptions.addEventListener('focusout', (event) => {
                    IM.resetStyleOptions(event.target.value)
                })
                this.partsOptions.addEventListener('focusout', (event) => {
                    IM.loadImage(event.target.value)
                    IM.genCanvas.hidden = true
                    IM.preview()
                })
            } else {
                this.itemOptions.addEventListener('change', (event) => {
                    IM.resetStyleOptions(event.target.value)
                })
                this.partsOptions.addEventListener('change', (event) => {
                    IM.loadImage(event.target.value)
                    IM.genCanvas.hidden = true
                    IM.preview()
                })
            }


            this.itemOptions.options[0].selected = true



            this.loadLineArtImage(this.items.items[0]["LineArtURL"])

            //this.loadLineArtImage(items.lineArtURL)

        }
    }

    Init() {
        this.videoCaptureWidth = 0
        this.videoCaptureHeight = 0
        this.video = document.createElement('video')
        this.video.playsInline = true
        this.video.autoplay = true
        document.body.appendChild(this.video)



        this.baseCanvas = this.createCanvas('baseCanvas')
        this.frameCanvas = this.createCanvas('frameCanvas', false, window.innerWidth)
        this.shotCanvas = this.createCanvas('shotCanvas')
        this.preCanvas = this.createCanvas('preCanvas')
        this.genCanvas = this.createCanvas('genCanvas')

        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'environment',
            }
        }).then((stream) => {
            this.video.srcObject = stream

            IM.videoCaptureWidth = stream.getVideoTracks()[0].getSettings().width
            IM.videoCaptureHeight = stream.getVideoTracks()[0].getSettings().height

        }).catch((error) => {
            console.log(error.message)
            document.body.textContent = 'error'
        })
    }

    loadLineArtImage(URL) {

        this.lineImg = this.createImageFromURL(URL, URL.replace(/\//g, "_").replace(/:/g, "_").replace(/\./g, "_"))
        document.body.appendChild(this.lineImg)

        this.lineImg.onload = function () {
            IM.width = this.naturalWidth
            IM.height = this.naturalHeight
            IM.lineArtCanvas = IM.createCanvas('lineArtCanvas', false)
            IM.lineArtCanvas.getContext('2d').drawImage(IM.lineImg, 0, 0)
            const laImg = IM.lineArtCanvas.getContext('2d').getImageData(0, 0, IM.width, IM.height)

            for (let i = 3; i < laImg.data.length; i += 4) {
                if (laImg.data[i] === 255) {
                    laImg.data[i - 3] = 0
                    laImg.data[i - 2] = 0
                    laImg.data[i - 1] = 0
                    laImg.data[i] = 128
                }
            }
            IM.lineArtCanvas.getContext('2d').putImageData(laImg, 0, 0)
            IM.Init()
            IM.loadImage(IM.partsOptions.value)
        }
    }

    loadImage(URL) {
        if (this.urls.includes(URL)) {
            this.baseImg = document.querySelector(`#${URL.replace(/\//g, "_").replace(/:/g, "_").replace(/\./g, "_")}`)
            this.refreshBaseAndFrame(this.baseImg, this.baseCanvas, this.frameCanvas)
            IM.video.hidden = false
        } else {
            this.baseImg = this.createImageFromURL(URL, URL.replace(/\//g, "_").replace(/:/g, "_").replace(/\./g, "_"))
            document.body.appendChild(this.baseImg)
            this.urls.unshift(URL)
            this.baseImg.onload = function () {
                IM.refreshBaseAndFrame(IM.baseImg, IM.baseCanvas, IM.frameCanvas)
                IM.video.hidden = false
            }
        }
    }

    resetStyleOptions(styleID) {
        this.video.hidden = true

        this.partsOptions.innerHTML = ""
        if (this.items.items[styleID]) {
            for (let i = 0; i < this.items.items[styleID]["parts"].length; i++) {
                const partsOption = document.createElement('option')
                partsOption.textContent = this.items.items[styleID]["parts"][i]["name"] + "▼"
                partsOption.value = this.items.items[styleID]["parts"][i]["url"]
                this.partsOptions.appendChild(partsOption)
            }
        }


        document.querySelectorAll('.images').forEach((element) => {
            document.body.removeChild(element)
        })

        document.querySelectorAll('canvas').forEach((element) => {
            document.body.removeChild(element)
        })

        this.urls = []



        const URL = this.items.items[styleID]["LineArtURL"]


        this.lineImg = this.createImageFromURL(URL, URL.replace(/\//g, "_").replace(/:/g, "_").replace(/\./g, "_"))
        document.body.appendChild(this.lineImg)

        this.lineImg.onload = function () {
            IM.width = this.naturalWidth
            IM.height = this.naturalHeight
            IM.lineArtCanvas = IM.createCanvas('lineArtCanvas', false)
            IM.lineArtCanvas.getContext('2d').drawImage(IM.lineImg, 0, 0)
            const laImg = IM.lineArtCanvas.getContext('2d').getImageData(0, 0, IM.width, IM.height)

            for (let i = 3; i < laImg.data.length; i += 4) {
                if (laImg.data[i] === 255) {
                    laImg.data[i - 3] = 0
                    laImg.data[i - 2] = 0
                    laImg.data[i - 1] = 0
                    laImg.data[i] = 128
                }
            }
            IM.lineArtCanvas.getContext('2d').putImageData(laImg, 0, 0)
            IM.baseCanvas = IM.createCanvas('baseCanvas')
            IM.frameCanvas = IM.createCanvas('frameCanvas', false, window.innerWidth)
            IM.shotCanvas = IM.createCanvas('shotCanvas')
            IM.preCanvas = IM.createCanvas('preCanvas')
            IM.genCanvas = IM.createCanvas('genCanvas')
            IM.loadImage(IM.partsOptions.value)

            IM.reset()
            //IM.preview()

        }
    }

    refreshBaseAndFrame(Img, Base, Frame) {
        Base.getContext('2d').putImageData(Base.getContext('2d').createImageData(this.width, this.height), 0, 0)
        Base.getContext('2d').drawImage(Img, 0, 0)

        const whiteImg = Frame.getContext('2d').createImageData(window.innerWidth, this.height)
        const frameImg = Base.getContext('2d').getImageData(0, 0, this.width, this.height)

        for (let i = 0; i < whiteImg.data.length; i += 1) {
            whiteImg.data[i] = 255
        }

        for (let i = 3; i < frameImg.data.length; i += 4) {
            if (frameImg.data[i] === 255) {
                frameImg.data[i] = 0
            } else {
                frameImg.data[i - 3] = 255
                frameImg.data[i - 2] = 255
                frameImg.data[i - 1] = 255
                frameImg.data[i] = 255
            }
        }

        Frame.getContext('2d').putImageData(whiteImg, 0, 0)
        Frame.getContext('2d').putImageData(frameImg, (window.innerWidth / 2) - (this.width / 2), 0)
    }

    createImageFromURL(URL, ID) {
        const Img = new Image()
        Img.crossOrigin = "Anonymous"
        Img.src = URL
        Img.id = ID
        Img.setAttribute('class', 'images')
        Img.hidden = true
        return Img
    }

    createCanvas(ID, isHidden = true, canvasWidth) {
        const cv = document.createElement('canvas')

        cv.width = canvasWidth ? canvasWidth : this.width
        cv.height = this.height
        cv.id = ID
        cv.hidden = isHidden

        document.body.appendChild(cv)
        return cv
    }

    preview() {
        this.genCanvas.hidden = true
        this.preCanvas.hidden = true
        this.frameCanvas.hidden = false
        this.video.hidden = false
    }

    shot() {

        const elementVideoWidth = parseInt(window.getComputedStyle(document.querySelector('video')).getPropertyValue('width'))
        const elementCanvasWidth = parseInt(window.getComputedStyle(this.lineArtCanvas).getPropertyValue('width'))
        const fixedCaptureCanvasWidth = ((1 / (elementVideoWidth / this.videoCaptureWidth)) * elementCanvasWidth)
        const fixedCaptureCanvasLeft = (this.videoCaptureWidth / 2) - (fixedCaptureCanvasWidth / 2)
        this.frameCanvas.hidden = true
        this.video.hidden = true
        this.shotCanvas.getContext('2d').drawImage(this.video, fixedCaptureCanvasLeft, 0, fixedCaptureCanvasWidth, this.videoCaptureHeight, 0, 0, this.width, this.height)
        this.generate(this.baseCanvas)
        this.preCanvas.hidden = false
    }

    showAll() {
        this.video.hidden = true
        this.frameCanvas.hidden = true
        this.genCanvas.hidden = false
    }

    reset() {
        this.preCanvas.hidden = true
        this.genImg = this.genCanvas.getContext('2d').createImageData(this.width, this.height)
        this.genCanvas.getContext('2d').putImageData(this.genImg, 0, 0)

    }

    generate(Base) {
        if (this.genImg === null) {
            this.genImg = this.genCanvas.getContext('2d').createImageData(this.width, this.height)
        }

        const preImg = this.preCanvas.getContext('2d').createImageData(this.width, this.height)
        const baseImg = Base.getContext('2d').getImageData(0, 0, this.width, this.height)
        const shotImg = this.shotCanvas.getContext('2d').getImageData(0, 0, this.width, this.height)

        for (let i = 3; i < baseImg.data.length; i += 4) {
            if (baseImg.data[i] === 255) {
                this.genImg.data[i] = baseImg.data[i]
                this.genImg.data[i - 3] = shotImg.data[i - 3]
                this.genImg.data[i - 2] = shotImg.data[i - 2]
                this.genImg.data[i - 1] = shotImg.data[i - 1]

                preImg.data[i] = baseImg.data[i]
                preImg.data[i - 3] = shotImg.data[i - 3]
                preImg.data[i - 2] = shotImg.data[i - 2]
                preImg.data[i - 1] = shotImg.data[i - 1]
            }
        }

        this.genCanvas.getContext('2d').putImageData(this.genImg, 0, 0)
        this.preCanvas.getContext('2d').putImageData(preImg, 0, 0)
    }

    disable() {
        if (window.getComputedStyle(document.querySelector('.uicontrol')).getPropertyValue('display') === 'none') {
            document.querySelectorAll('.uicontrol').forEach((element) => {
                element.style.display = 'grid'
            })
        } else {
            document.querySelectorAll('.uicontrol').forEach((element) => {
                element.style.display = 'none'
            })
        }
    }

}

import { items as importITEMS } from './items_json.js'

document.addEventListener('touchmove', (event) => { event.preventDefault() }, { passive: false })

window.IM = new ImageBuild(importITEMS)