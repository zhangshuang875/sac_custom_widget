(function () {
  const template = document.createElement('template')
  template.innerHTML = `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
      }

      #root {
        width: 100%;
        height: 100%;
        background: #f4f1ec;
        display: flex;
        flex-direction: column;
        padding: 16px;
        overflow: auto;
      }

      header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 14px;
        flex-wrap: wrap;
        gap: 10px;
      }

      header h1 {
        font-family: 'Space Mono', 'Courier New', monospace;
        font-size: 16px;
        font-weight: 700;
        color: #23272f;
        letter-spacing: -0.5px;
      }

      header .subtitle {
        font-size: 11px;
        color: #8a8d94;
        margin-top: 2px;
      }

      .legend {
        display: flex;
        gap: 14px;
        align-items: center;
        font-size: 11px;
        color: #6b6e76;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        border: 1.5px solid;
        flex-shrink: 0;
      }

      .legend-dot.ok   { background: rgba(34,139,84,0.13); border-color: #228b54; }
      .legend-dot.warn { background: rgba(210,43,43,0.13);  border-color: #d22b2b; }

      .map-wrap {
        background: #fff;
        border: 1px solid #d6d3cd;
        border-radius: 10px;
        box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        padding: 14px;
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      svg {
        display: block;
        width: 100%;
        height: auto;
      }

      /* Tooltip lives inside the shadow root, positioned relative to #root */
      #tip {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        background: #23272f;
        color: #fff;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 12px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.22);
        opacity: 0;
        transition: opacity 0.15s;
        font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif;
        max-width: 220px;
      }

      #tip.show { opacity: 1; }

      .t-name  { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
      .t-row   { display: flex; justify-content: space-between; gap: 16px; margin-top: 3px; font-family: 'Space Mono', 'Courier New', monospace; font-size: 12px; }
      .t-warn  { color: #ff6b6b; font-size: 11px; margin-top: 6px; font-weight: 600; }
      .t-ok-val   { color: #4ade80; }
      .t-warn-val { color: #ff6b6b; }

      .zone { cursor: pointer; transition: filter 0.2s; }
      .zone:hover { filter: brightness(1.04); }
    </style>

    <div id="root">
      <header>
        <div>
          <h1>Floor Layout — Production Work Centers</h1>
          <div class="subtitle">Manufacturing Plant — Capacity Overview</div>
        </div>
        <div class="legend">
          <div class="legend-item"><div class="legend-dot ok"></div> Within Capacity</div>
          <div class="legend-item"><div class="legend-dot warn"></div> Over Capacity</div>
        </div>
      </header>

      <div class="map-wrap">
        <svg viewBox="0 0 1060 720" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-ok" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(34,139,84,0.08)" stroke-width="2"/>
            </pattern>
            <pattern id="hatch-warn" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(210,43,43,0.08)" stroke-width="2"/>
            </pattern>
            <pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="none"/>
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e8e5df" stroke-width="0.5"/>
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#b0a99a"/>
            </marker>
          </defs>

          <!-- Background grid -->
          <rect width="1060" height="720" fill="url(#grid)"/>

          <!-- Outer walls -->
          <rect x="20" y="20" width="1020" height="680" rx="4" fill="none" stroke="#8a8680" stroke-width="3"/>
          <rect x="24" y="24" width="1012" height="672" rx="3" fill="none" stroke="#c5c0b8" stroke-width="0.7" stroke-dasharray="2,4"/>

          <!-- === CORRIDORS === -->
          <rect x="20" y="330" width="1020" height="52" fill="#f0ede7"/>
          <line x1="20" y1="330" x2="1040" y2="330" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>
          <line x1="20" y1="382" x2="1040" y2="382" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>
          <text x="530" y="360" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="8" fill="#b0a99a" letter-spacing="3">MAIN CORRIDOR</text>

          <rect x="510" y="20" width="44" height="310" fill="#f0ede7"/>
          <line x1="510" y1="20" x2="510" y2="330" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>
          <line x1="554" y1="20" x2="554" y2="330" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>
          <rect x="510" y="382" width="44" height="318" fill="#f0ede7"/>
          <line x1="510" y1="382" x2="510" y2="700" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>
          <line x1="554" y1="382" x2="554" y2="700" stroke="#c5c0b8" stroke-width="1" stroke-dasharray="8,4"/>

          <!-- ============ ZONE 1: FABRICATION (top-left) ============ -->
          <g class="zone" data-id="fab">
            <rect x="24" y="24" width="482" height="302" rx="2" fill="rgba(210,43,43,0.06)"/>
            <rect x="24" y="24" width="482" height="302" rx="2" fill="url(#hatch-warn)" stroke="#d22b2b" stroke-width="2"/>

            <circle cx="52" cy="52" r="14" fill="#d22b2b"/>
            <text x="52" y="56" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">1</text>

            <text x="260" y="58" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="16" fill="#23272f" font-weight="700">Fabrication</text>
            <text x="260" y="74" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#d22b2b" font-weight="700">420h / 400h — 105%</text>

            <!-- CNC row -->
            <rect x="50" y="100" width="56" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="78" y="124" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">CNC-01</text>
            <rect x="116" y="100" width="56" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="144" y="124" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">CNC-02</text>
            <rect x="182" y="100" width="56" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="210" y="124" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">CNC-03</text>
            <rect x="248" y="100" width="56" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="276" y="124" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">CNC-04</text>

            <!-- Laser cutters -->
            <rect x="340" y="100" width="70" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="375" y="128" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">LASER-01</text>
            <rect x="420" y="100" width="70" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="455" y="128" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">LASER-02</text>

            <!-- Welding -->
            <circle cx="72" cy="188" r="22" fill="none" stroke="#c5c0b8"/>
            <text x="72" y="192" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">WELD</text>
            <circle cx="130" cy="188" r="22" fill="none" stroke="#c5c0b8"/>
            <text x="130" y="192" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">WELD</text>
            <circle cx="188" cy="188" r="22" fill="none" stroke="#c5c0b8"/>
            <text x="188" y="192" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">WELD</text>

            <!-- Press brake -->
            <rect x="250" y="170" width="90" height="36" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="295" y="192" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">PRESS BRAKE</text>

            <!-- Material racks -->
            <rect x="380" y="170" width="110" height="14" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="380" y="190" width="110" height="14" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="380" y="210" width="110" height="14" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="435" y="240" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">MATERIAL STORAGE</text>

            <!-- Work tables -->
            <rect x="50" y="240" width="80" height="28" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <rect x="140" y="240" width="80" height="28" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <rect x="230" y="240" width="80" height="28" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="175" y="290" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">WORK TABLES</text>

            <!-- Doors -->
            <rect x="180" y="320" width="40" height="14" rx="1" fill="#f0ede7"/>
            <rect x="360" y="320" width="40" height="14" rx="1" fill="#f0ede7"/>
          </g>

          <!-- ============ ZONE 2: WHEEL SHOP (top-right) ============ -->
          <g class="zone" data-id="wheel">
            <rect x="558" y="24" width="478" height="302" rx="2" fill="rgba(34,139,84,0.06)"/>
            <rect x="558" y="24" width="478" height="302" rx="2" fill="url(#hatch-ok)" stroke="#228b54" stroke-width="1.5"/>

            <circle cx="586" cy="52" r="14" fill="#228b54"/>
            <text x="586" y="56" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">2</text>

            <text x="796" y="58" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="16" fill="#23272f" font-weight="700">Wheel Shop</text>
            <text x="796" y="74" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#228b54" font-weight="700">180h / 200h — 90%</text>

            <!-- Lathes -->
            <rect x="584" y="100" width="64" height="48" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <circle cx="616" cy="124" r="14" fill="none" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="616" y="160" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">LATHE-01</text>
            <rect x="660" y="100" width="64" height="48" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <circle cx="692" cy="124" r="14" fill="none" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="692" y="160" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">LATHE-02</text>
            <rect x="736" y="100" width="64" height="48" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <circle cx="768" cy="124" r="14" fill="none" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="768" y="160" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">LATHE-03</text>

            <!-- Balancing -->
            <circle cx="870" cy="130" r="30" fill="none" stroke="#c5c0b8"/>
            <circle cx="870" cy="130" r="8" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="870" y="172" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">BALANCE-01</text>
            <circle cx="946" cy="130" r="30" fill="none" stroke="#c5c0b8"/>
            <circle cx="946" cy="130" r="8" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="946" y="172" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">BALANCE-02</text>

            <!-- Tire mount / press -->
            <rect x="584" y="190" width="100" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="634" y="220" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">TIRE MOUNT</text>
            <rect x="696" y="190" width="100" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="746" y="220" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">TIRE PRESS</text>

            <!-- Rim racks -->
            <rect x="830" y="190" width="16" height="110" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="854" y="190" width="16" height="110" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="878" y="190" width="16" height="110" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="902" y="190" width="16" height="110" rx="2" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="876" y="316" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">RIM STORAGE</text>

            <!-- Work benches -->
            <rect x="584" y="262" width="120" height="24" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <rect x="584" y="292" width="120" height="24" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>

            <!-- Door -->
            <rect x="680" y="320" width="40" height="14" rx="1" fill="#f0ede7"/>
          </g>

          <!-- ============ ZONE 3: PAINT SHOP (mid-left) ============ -->
          <g class="zone" data-id="paint">
            <rect x="24" y="386" width="240" height="178" rx="2" fill="rgba(210,43,43,0.06)"/>
            <rect x="24" y="386" width="240" height="178" rx="2" fill="url(#hatch-warn)" stroke="#d22b2b" stroke-width="2"/>

            <circle cx="52" cy="414" r="14" fill="#d22b2b"/>
            <text x="52" y="418" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">3</text>

            <text x="156" y="414" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="15" fill="#23272f" font-weight="700">Paint Shop</text>
            <text x="144" y="430" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="9" fill="#d22b2b" font-weight="700">350h / 320h — 109%</text>

            <!-- Spray booths -->
            <rect x="40" y="446" width="66" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <rect x="44" y="450" width="58" height="42" rx="2" fill="none" stroke="#c5c0b8" stroke-width="0.5" stroke-dasharray="3,2"/>
            <text x="73" y="476" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">BOOTH 1</text>
            <rect x="116" y="446" width="66" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <rect x="120" y="450" width="58" height="42" rx="2" fill="none" stroke="#c5c0b8" stroke-width="0.5" stroke-dasharray="3,2"/>
            <text x="149" y="476" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">BOOTH 2</text>
            <rect x="192" y="446" width="66" height="50" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <rect x="196" y="450" width="58" height="42" rx="2" fill="none" stroke="#c5c0b8" stroke-width="0.5" stroke-dasharray="3,2"/>
            <text x="225" y="476" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">BOOTH 3</text>

            <!-- Drying oven -->
            <rect x="40" y="510" width="216" height="40" rx="3" fill="#e2ddd5" stroke="#c5c0b8"/>
            <text x="148" y="534" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">DRYING OVEN</text>
            <path d="M60,518 Q66,523 60,528" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <path d="M80,518 Q86,523 80,528" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <path d="M100,518 Q106,523 100,528" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <path d="M200,518 Q206,523 200,528" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>

            <rect x="100" y="382" width="36" height="8" rx="1" fill="#f0ede7"/>
          </g>

          <!-- ============ ZONE 4: FINAL ASSEMBLY (mid-center) ============ -->
          <g class="zone" data-id="assembly">
            <rect x="268" y="386" width="238" height="312" rx="2" fill="rgba(34,139,84,0.06)"/>
            <rect x="268" y="386" width="238" height="312" rx="2" fill="url(#hatch-ok)" stroke="#228b54" stroke-width="1.5"/>

            <circle cx="296" cy="414" r="14" fill="#228b54"/>
            <text x="296" y="418" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">4</text>

            <text x="400" y="414" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="15" fill="#23272f" font-weight="700">Final Assembly</text>
            <text x="387" y="430" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="9" fill="#228b54" font-weight="700">280h / 360h — 78%</text>

            <!-- Main conveyor -->
            <rect x="290" y="450" width="196" height="16" rx="4" fill="#d9d5ce" stroke="#c5c0b8"/>
            <line x1="310" y1="450" x2="310" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="330" y1="450" x2="330" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="350" y1="450" x2="350" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="370" y1="450" x2="370" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="390" y1="450" x2="390" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="410" y1="450" x2="410" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="430" y1="450" x2="430" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="450" y1="450" x2="450" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="470" y1="450" x2="470" y2="466" stroke="#c5c0b8" stroke-width="0.5"/>
            <line x1="290" y1="458" x2="486" y2="458" stroke="#b0a99a" stroke-width="1" marker-end="url(#arrow)"/>
            <text x="388" y="444" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">MAIN LINE</text>

            <!-- Stations row 1 -->
            <rect x="290" y="482" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="318" y="508" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-A1</text>
            <rect x="356" y="482" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="384" y="508" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-A2</text>
            <rect x="422" y="482" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="450" y="508" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-A3</text>

            <!-- Sub-assembly conveyor -->
            <rect x="290" y="544" width="196" height="16" rx="4" fill="#d9d5ce" stroke="#c5c0b8"/>
            <line x1="290" y1="552" x2="486" y2="552" stroke="#b0a99a" stroke-width="1" marker-end="url(#arrow)"/>
            <text x="388" y="538" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">SUB-ASSEMBLY</text>

            <!-- Stations row 2 -->
            <rect x="290" y="576" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="318" y="602" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-B1</text>
            <rect x="356" y="576" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="384" y="602" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-B2</text>
            <rect x="422" y="576" width="56" height="44" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="450" y="602" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">STN-B3</text>

            <!-- Tool crib -->
            <rect x="290" y="640" width="60" height="46" rx="3" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="320" y="666" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">TOOLS</text>
            <rect x="358" y="640" width="60" height="46" rx="3" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="388" y="666" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">PARTS</text>
            <rect x="426" y="640" width="60" height="46" rx="3" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.7"/>
            <text x="456" y="666" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">JIGS</text>

            <rect x="350" y="382" width="36" height="8" rx="1" fill="#f0ede7"/>
          </g>

          <!-- ============ ZONE 5: QUALITY CONTROL (right) ============ -->
          <g class="zone" data-id="qc">
            <rect x="558" y="386" width="240" height="178" rx="2" fill="rgba(34,139,84,0.06)"/>
            <rect x="558" y="386" width="240" height="178" rx="2" fill="url(#hatch-ok)" stroke="#228b54" stroke-width="1.5"/>

            <circle cx="586" cy="414" r="14" fill="#228b54"/>
            <text x="586" y="418" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">5</text>

            <text x="694" y="414" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="14" fill="#23272f" font-weight="700">Quality Control</text>
            <text x="678" y="430" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="9" fill="#228b54" font-weight="700">200h / 200h — 100%</text>

            <!-- Inspect tables -->
            <rect x="574" y="448" width="80" height="36" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="614" y="470" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">INSPECT-01</text>
            <rect x="664" y="448" width="80" height="36" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="704" y="470" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">INSPECT-02</text>

            <!-- CMM -->
            <rect x="574" y="498" width="66" height="54" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <rect x="582" y="506" width="50" height="38" rx="2" fill="none" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="607" y="560" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">CMM</text>

            <!-- Test equipment -->
            <rect x="654" y="498" width="50" height="54" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="679" y="560" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">HARDNESS</text>
            <rect x="714" y="498" width="50" height="54" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="739" y="560" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">TENSILE</text>

            <rect x="640" y="382" width="36" height="8" rx="1" fill="#f0ede7"/>
          </g>

          <!-- ============ ZONE 6: PACKAGING (bottom-left) ============ -->
          <g class="zone" data-id="pack">
            <rect x="24" y="568" width="240" height="128" rx="2" fill="rgba(210,43,43,0.06)"/>
            <rect x="24" y="568" width="240" height="128" rx="2" fill="url(#hatch-warn)" stroke="#d22b2b" stroke-width="2"/>

            <circle cx="52" cy="596" r="14" fill="#d22b2b"/>
            <text x="52" y="600" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="10" fill="#fff" font-weight="700">6</text>

            <text x="156" y="596" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="15" fill="#23272f" font-weight="700">Packaging</text>
            <text x="144" y="612" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="9" fill="#d22b2b" font-weight="700">260h / 240h — 108%</text>

            <rect x="40" y="628" width="72" height="28" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="76" y="646" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">PACK-01</text>
            <rect x="120" y="628" width="72" height="28" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="156" y="646" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">PACK-02</text>
            <rect x="200" y="628" width="50" height="28" rx="3" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="225" y="646" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">WRAP</text>

            <rect x="40" y="668" width="24" height="18" rx="1" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="70" y="668" width="24" height="18" rx="1" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="100" y="668" width="24" height="18" rx="1" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="130" y="668" width="24" height="18" rx="1" fill="#d9d5ce" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="96" y="694" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="5" fill="#b0a99a">PALLETS</text>
          </g>

          <!-- ============ SHIPPING / RECEIVING ============ -->
          <g>
            <rect x="558" y="568" width="478" height="128" rx="2" fill="#f7f5f1" stroke="#c5c0b8" stroke-dasharray="4,3"/>
            <text x="796" y="600" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="14" fill="#b0a99a" font-weight="600">Shipping &amp; Receiving</text>

            <rect x="590" y="660" width="60" height="30" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="620" y="680" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">DOCK 1</text>
            <rect x="666" y="660" width="60" height="30" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="696" y="680" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">DOCK 2</text>
            <rect x="742" y="660" width="60" height="30" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="772" y="680" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">DOCK 3</text>
            <rect x="818" y="660" width="60" height="30" rx="2" fill="#e8e5df" stroke="#c5c0b8"/>
            <text x="848" y="680" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#8a8680">DOCK 4</text>

            <rect x="590" y="618" width="120" height="28" rx="2" fill="#f0ede7" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="650" y="636" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">STAGING AREA</text>

            <path d="M900,618 L900,656" stroke="#c5c0b8" stroke-width="0.7" stroke-dasharray="3,3"/>
            <path d="M940,618 L940,656" stroke="#c5c0b8" stroke-width="0.7" stroke-dasharray="3,3"/>
            <text x="920" y="640" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="5" fill="#c5c0b8" transform="rotate(-90,920,640)">FORKLIFT</text>
          </g>

          <!-- ============ OFFICE ============ -->
          <g>
            <rect x="802" y="386" width="234" height="178" rx="2" fill="#f7f5f1" stroke="#c5c0b8" stroke-dasharray="4,3"/>
            <text x="919" y="468" text-anchor="middle" font-family="DM Sans,Segoe UI,Arial,sans-serif" font-size="12" fill="#b0a99a" font-weight="600">Plant Office</text>
            <text x="919" y="484" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#c5c0b8">Control Room</text>
            <!-- desks -->
            <rect x="830" y="410" width="40" height="24" rx="2" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="880" y="410" width="40" height="24" rx="2" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="930" y="410" width="40" height="24" rx="2" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="980" y="410" width="40" height="24" rx="2" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <rect x="830" y="500" width="90" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="875" y="524" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">MEETING ROOM</text>
            <rect x="940" y="500" width="70" height="40" rx="3" fill="#e8e5df" stroke="#c5c0b8" stroke-width="0.5"/>
            <text x="975" y="524" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="6" fill="#b0a99a">SERVER</text>
          </g>

          <!-- ============ FLOW ARROWS ============ -->
          <g opacity="0.45">
            <path d="M255,330 L255,356 Q255,366 245,366 L144,366 Q134,366 134,376 L134,386" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
            <path d="M400,330 L400,356 Q400,366 390,366 L387,366 Q377,366 377,376 L377,386" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
            <path d="M700,330 L700,356 Q700,366 690,366 L450,366 Q440,366 440,376 L440,386" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
            <path d="M506,480 L532,480 Q542,480 542,490 L542,500 Q542,510 552,510 L558,510" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
            <path d="M574,564 L574,580 Q574,590 564,590 L268,590 Q264,590 264,590" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
            <path d="M264,640 L510,640 Q530,640 540,640 L558,640" fill="none" stroke="#8a8680" stroke-width="1.5" marker-end="url(#arrow)"/>
          </g>

          <!-- Scale bar -->
          <g transform="translate(900,30)">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#8a8680" stroke-width="1.5"/>
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#8a8680" stroke-width="1.5"/>
            <line x1="100" y1="-4" x2="100" y2="4" stroke="#8a8680" stroke-width="1.5"/>
            <text x="50" y="14" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="7" fill="#8a8680">~50m</text>
          </g>

          <!-- North arrow -->
          <g transform="translate(44,700)">
            <polygon points="0,-14 4,0 -4,0" fill="#8a8680"/>
            <text x="0" y="-18" text-anchor="middle" font-family="Space Mono,Courier New,monospace" font-size="8" fill="#8a8680" font-weight="700">N</text>
          </g>
        </svg>
      </div>
    </div>

    <div id="tip"></div>
  `

  // ── Dummy sample data (mirroring the original HTML) ──────────────────────
  const ZONE_DATA = {
    fab:      { name: 'Fabrication',    planned: 420, capacity: 400 },
    wheel:    { name: 'Wheel Shop',     planned: 180, capacity: 200 },
    paint:    { name: 'Paint Shop',     planned: 350, capacity: 320 },
    assembly: { name: 'Final Assembly', planned: 280, capacity: 360 },
    qc:       { name: 'Quality Control',planned: 200, capacity: 200 },
    pack:     { name: 'Packaging',      planned: 260, capacity: 240 },
  }

  class Main extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._tip  = this._shadowRoot.getElementById('tip')
    }

    connectedCallback () {
      this._initTooltips()
    }

    // ── SAP Custom Widget lifecycle hooks ─────────────────────────────────
    onCustomWidgetResize (width, height) {
      // The SVG is responsive (viewBox + width:100%), so no manual resize needed.
    }

    onCustomWidgetAfterUpdate (changedProps) {
      // No data-binding used; chart is fully driven by ZONE_DATA above.
    }

    onCustomWidgetDestroy () {
      // Nothing to tear down (event listeners are scoped to shadow DOM).
    }

    // ── Tooltip wiring ────────────────────────────────────────────────────
    _initTooltips () {
      const tip = this._tip

      this._shadowRoot.querySelectorAll('.zone').forEach(zone => {
        const id = zone.dataset.id
        const d  = ZONE_DATA[id]
        if (!d) return

        const over = d.planned > d.capacity
        const pct  = Math.round((d.planned / d.capacity) * 100)
        const valClass = over ? 't-warn-val' : 't-ok-val'

        zone.addEventListener('mouseenter', () => {
          tip.innerHTML = `
            <div class="t-name">${d.name}</div>
            <div class="t-row"><span>Planned</span><span class="${valClass}">${d.planned}h</span></div>
            <div class="t-row"><span>Capacity</span><span>${d.capacity}h</span></div>
            <div class="t-row"><span>Load</span><span class="${valClass}">${pct}%</span></div>
            ${over ? '<div class="t-warn">&#9888; OVER CAPACITY</div>' : ''}
          `
          tip.classList.add('show')
        })

        zone.addEventListener('mousemove', e => {
          tip.style.left = (e.clientX + 16) + 'px'
          tip.style.top  = (e.clientY - 10) + 'px'
        })

        zone.addEventListener('mouseleave', () => {
          tip.classList.remove('show')
        })
      })
    }
  }

  customElements.define('com-sap-sac-capacity-zhangshuang875-main', Main)
})()
