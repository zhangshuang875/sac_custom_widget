(function () {
  const template = document.createElement('template')
  template.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      .widget-wrapper {
        width: 100%;
        height: 100%;
        background: #ffffff;
        font-family: "72", "72full", Arial, Helvetica, sans-serif;
        position: relative;
        overflow: hidden;
      }
      .chart-container {
        width: 100%;
        height: 100%;
      }
      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #556b82;
        font-size: 13px;
        flex-direction: column;
        gap: 12px;
      }
      .loading-spinner {
        width: 28px;
        height: 28px;
        border: 3px solid #e5e5e6;
        border-top-color: #0070f2;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
    <div class="widget-wrapper">
      <div id="chart" class="chart-container">
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <span>Loading chart...</span>
        </div>
      </div>
    </div>
  `

  const SAP = {
    brand: '#0070f2', text: '#1d2d3e', label: '#556b82',
    neutral: '#556b82', border: '#e5e5e6', white: '#ffffff',
    chart: [
      '#0070f2', '#75b300', '#bf60a7', '#da3b0a', '#c87b00',
      '#089d9b', '#4d75aa', '#c95f14', '#1a9969', '#ab4dab'
    ]
  }

  const BIKE_MODELS = {
    'Cruiser':       { color: SAP.chart[0] },
    'Mountain Bike': { color: SAP.chart[1] },
    'E-Bike':        { color: SAP.chart[2] },
    'Race Bike':     { color: SAP.chart[3] },
    'Youth Bike':    { color: SAP.chart[4] }
  }

  const COMPONENTS = {
    'Chain':                 ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Brake Cables':          ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Pedals':                ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Headset Bearings':      ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Seat Clamp':            ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Handlebar Grips':       ['Cruiser','Mountain Bike','Race Bike','Youth Bike'],
    'Standard Saddle':       ['Cruiser','Mountain Bike','E-Bike','Youth Bike'],
    'Reflector Kit':         ['Cruiser','E-Bike','Youth Bike'],
    'Disc Brakes':           ['Mountain Bike','E-Bike','Race Bike'],
    'Quick-Release Skewers': ['Mountain Bike','Race Bike','E-Bike'],
    'Derailleur Hanger':     ['Mountain Bike','Race Bike','E-Bike'],
    'Spoke Set 700c':        ['Cruiser','Race Bike','E-Bike'],
    'Rim Tape':              ['Cruiser','Mountain Bike','Race Bike','Youth Bike'],
    'Tire Valve Stems':      ['Cruiser','Mountain Bike','E-Bike','Race Bike','Youth Bike'],
    'Bottom Bracket':        ['Cruiser','Mountain Bike','Race Bike'],
    'Shift Cables':          ['Mountain Bike','E-Bike','Race Bike'],
    'Cruiser Frame':         ['Cruiser'],
    'Swept-Back Handlebar':  ['Cruiser'],
    'Coaster Brake Hub':     ['Cruiser'],
    'Balloon Tires 26"':     ['Cruiser'],
    'Beach Fenders':         ['Cruiser'],
    'MTB Carbon Frame':      ['Mountain Bike'],
    'Suspension Fork 150mm': ['Mountain Bike'],
    'Rear Shock':            ['Mountain Bike'],
    'Knobby Tires 29"':      ['Mountain Bike'],
    'Dropper Seat Post':     ['Mountain Bike'],
    'E-Bike Alloy Frame':    ['E-Bike'],
    'Mid-Drive Motor 250W':  ['E-Bike'],
    'Battery Pack 504Wh':    ['E-Bike'],
    'LCD Display Controller':['E-Bike'],
    'Torque Sensor':         ['E-Bike'],
    'Aero Carbon Frame':     ['Race Bike'],
    'Carbon Fork':           ['Race Bike'],
    'Drop Handlebar':        ['Race Bike'],
    'Clipless Pedals':       ['Race Bike'],
    'Slick Tires 700x25c':  ['Race Bike'],
    'Youth Steel Frame':     ['Youth Bike'],
    'Training Wheels':       ['Youth Bike'],
    'Coaster Brake':         ['Youth Bike'],
    'Foam Grips':            ['Youth Bike'],
    'Tires 20"':             ['Youth Bike']
  }

  class Main extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._chartEl = this._shadowRoot.getElementById('chart')
      this._chart = null
      this._echartsLoaded = false
      this._echartsLoading = false
      this._loadEChartsAndRender()
    }

    onCustomWidgetResize (width, height) {
      if (this._chart) {
        this._chart.resize()
      }
    }

    onCustomWidgetAfterUpdate (changedProps) {
      if (this._echartsLoaded) {
        this.render()
      }
    }

    onCustomWidgetDestroy () {
      if (this._chart) {
        this._chart.dispose()
        this._chart = null
      }
    }

    _loadEChartsAndRender () {
      if (this._echartsLoaded) { this.render(); return }
      if (this._echartsLoading) { return }
      this._echartsLoading = true

      var script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js'
      script.onload = () => {
        this._echartsLoaded = true
        this._echartsLoading = false
        this.render()
      }
      script.onerror = () => {
        this._echartsLoading = false
        this._chartEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#556b82;font-size:13px;">Failed to load ECharts library.</div>'
      }
      document.head.appendChild(script)
    }

    render () {
      if (!this._echartsLoaded || typeof echarts === 'undefined') { return }

      var bikeNames = Object.keys(BIKE_MODELS)
      var nodes = []
      var links = []
      var categories = []

      bikeNames.forEach(function (n) { categories.push({ name: n }) })
      categories.push({ name: 'Shared Component' })
      categories.push({ name: 'Unique Component' })

      var sharedCatIdx = bikeNames.length
      var uniqueCatIdx = bikeNames.length + 1

      var bikeCounts = {}
      bikeNames.forEach(function (b) { bikeCounts[b] = { total: 0, shared: 0, unique: 0 } })

      // Bike hub nodes
      bikeNames.forEach(function (name, i) {
        var color = BIKE_MODELS[name].color
        nodes.push({
          id: 'bike__' + name, name: name,
          symbolSize: 60, symbol: 'circle', category: i,
          itemStyle: {
            color: color, borderColor: SAP.white, borderWidth: 3,
            shadowBlur: 12, shadowColor: color + '30'
          },
          label: {
            show: true, fontSize: 12,
            fontFamily: '"72", Arial, sans-serif',
            fontWeight: 700, color: SAP.white,
            formatter: function (p) { return p.name.replace(/ /g, '\n') }
          },
          _isBike: true
        })
      })

      // Component nodes + links
      Object.keys(COMPONENTS).forEach(function (comp) {
        var bikes = COMPONENTS[comp]
        var isShared = bikes.length > 1
        var size = isShared ? 12 + bikes.length * 3.5 : 10
        var nodeColor = isShared ? SAP.brand : BIKE_MODELS[bikes[0]].color

        nodes.push({
          id: 'comp__' + comp, name: comp,
          symbolSize: size,
          symbol: isShared ? 'roundRect' : 'diamond',
          category: isShared ? sharedCatIdx : uniqueCatIdx,
          itemStyle: {
            color: isShared ? SAP.brand + '15' : nodeColor + '12',
            borderColor: isShared ? SAP.brand : nodeColor,
            borderWidth: isShared ? 2 : 1.5
          },
          label: {
            show: bikes.length >= 3, fontSize: 10,
            fontFamily: '"72", Arial, sans-serif',
            fontWeight: 400, color: SAP.label,
            position: 'right', distance: 8
          },
          _isBike: false, _usageCount: bikes.length, _bikes: bikes
        })

        bikes.forEach(function (bike) {
          bikeCounts[bike].total++
          if (isShared) { bikeCounts[bike].shared++ } else { bikeCounts[bike].unique++ }

          var bikeColor = BIKE_MODELS[bike].color
          links.push({
            source: 'bike__' + bike, target: 'comp__' + comp,
            lineStyle: {
              color: isShared ? (SAP.brand + '25') : (bikeColor + '15'),
              width: isShared ? 1.6 : 1,
              curveness: 0.12 + Math.random() * 0.14
            }
          })
        })
      })

      // Init or reuse chart
      if (!this._chart) {
        this._chartEl.innerHTML = ''
        this._chart = echarts.init(this._chartEl)
      }

      this._chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: SAP.white, borderColor: SAP.border, borderWidth: 1,
          padding: [14, 18],
          textStyle: { fontFamily: '"72", Arial, sans-serif', fontSize: 12, color: SAP.text },
          extraCssText: 'box-shadow:0 2px 8px rgba(0,0,0,.1),0 8px 16px rgba(0,0,0,.06);border-radius:10px;',
          formatter: function (params) {
            if (params.dataType === 'node') {
              var d = params.data
              if (d._isBike) {
                var c = bikeCounts[d.name]
                return '<div style="font-weight:700;font-size:14px;margin-bottom:8px;color:' + BIKE_MODELS[d.name].color + '">' + d.name + '</div>' +
                  '<div style="font-size:12px;color:' + SAP.label + ';line-height:2">' +
                  'Total Components: <b style="color:' + SAP.text + '">' + c.total + '</b><br/>' +
                  'Shared: <b style="color:' + SAP.brand + '">' + c.shared + '</b><br/>' +
                  'Unique: <b style="color:' + SAP.text + '">' + c.unique + '</b></div>'
              } else {
                var bikes = d._bikes || []
                var isS = bikes.length > 1
                return '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:' + (isS ? SAP.brand : SAP.text) + '">' + d.name + '</div>' +
                  '<div style="font-size:12px;color:' + SAP.label + ';line-height:2">' +
                  'Type: <b style="color:' + (isS ? SAP.brand : SAP.neutral) + '">' + (isS ? 'Shared' : 'Unique') + '</b><br/>' +
                  'Used by: <b style="color:' + SAP.text + '">' + bikes.length + ' model' + (bikes.length > 1 ? 's' : '') + '</b><br/>' +
                  bikes.map(function (b) { return '<span style="color:' + BIKE_MODELS[b].color + '">● ' + b + '</span>' }).join('<br/>') + '</div>'
              }
            }
            if (params.dataType === 'edge') {
              return '<span style="font-size:12px;color:' + SAP.label + '">' +
                params.data.source.replace('bike__', '') + ' → ' +
                params.data.target.replace('comp__', '') + '</span>'
            }
          }
        },
        legend: {
          bottom: 8, left: 'center',
          itemWidth: 14, itemHeight: 14, itemGap: 16,
          textStyle: { fontFamily: '"72", Arial, sans-serif', fontSize: 11, color: SAP.label },
          data: categories.map(function (c) { return c.name })
        },
        animationDuration: 1200,
        animationEasingUpdate: 'cubicInOut',
        series: [{
          type: 'graph', layout: 'force',
          data: nodes, links: links, categories: categories,
          roam: true, draggable: true,
          force: {
            repulsion: 320, edgeLength: [80, 200],
            gravity: 0.08, friction: 0.6, layoutAnimation: true
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3, opacity: 1 },
            itemStyle: { shadowBlur: 14, shadowColor: 'rgba(0,112,242,0.25)' },
            label: { show: true, fontSize: 12, fontWeight: 700, color: SAP.text }
          },
          blur: { itemStyle: { opacity: 0.06 }, lineStyle: { opacity: 0.02 } },
          lineStyle: { opacity: 0.6 },
          label: { position: 'right', distance: 8 },
          edgeLabel: { show: false },
          scaleLimit: { min: 0.4, max: 3 }
        }]
      }, true)

      this._chart.resize()
    }
  }

  customElements.define('com-sap-sac-exercise-zhangshuang875-main', Main)
})()
