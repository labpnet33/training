var e={id:`lab-floor`,h:{en:`Hands-on: plan channels for an office floor`,hi:`Hands-on: office floor ke liye channels plan karo`},body:{en:`
<p>A seating planner at a wedding has four long tables in a row and only three colours of tablecloth. Neighbouring tables must never share a colour, so the pattern is red, blue, green, red. The two red tables are at opposite ends of the hall, and if the guests at those tables speak quietly enough, they never disturb each other. That is exactly the plan you will build in this lab.</p>

<h3>The lab floor</h3>
<p>Four ceiling APs, <b>AP1 to AP4</b>, hang in a row along a 60 m open-plan floor, <b>18 m apart</b>. They are lightweight APs in VLAN 10 (10.30.10.0/24), found the controller <b>WLC1</b> (10.30.99.10, VLAN 99) through DHCP option 43 on router <b>R1</b>, and serve the SSID <code>CORP-OFFICE</code> (WPA2-PSK) in VLAN 20. Out of the box, every 2.4 GHz radio is on channel 1 at full power (level 1 = 20 dBm), AP1 and AP2 share 5 GHz channel 36, and the installer left AP3 and AP4 on DFS channels 52 and 100.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Office floor channel plan">
<rect x="10" y="20" width="620" height="120" rx="10" fill="#e2e8f0"/>
<circle cx="80" cy="80" r="40" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="80" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 17 dBm</text>
<circle cx="240" cy="80" r="52" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP2</text><text x="240" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 6, 20 dBm</text>
<circle cx="400" cy="80" r="52" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP3</text><text x="400" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 11, 20 dBm</text>
<circle cx="560" cy="80" r="40" fill="#bae6fd"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP4</text><text x="560" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 17 dBm</text>
<text x="160" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text><text x="480" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">2.4 GHz target: 1, 6, 11, 1 with lower power at the ends</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">5 GHz target: 36, 40, 44, 48 (all non-DFS)</text>
</svg><p class="cap">The finished plan. AP1 and AP4 reuse channel 1 because they are 54 m apart and a little quieter.</p></div>

<h3>Step 1: read the current plan</h3>
<pre class="code"><span class="c">! on WLC1</span>
show ap summary
show advanced 802.11b channel</pre>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel
802.11b/g/n (2.4 GHz) channel plan   (non-overlapping 20 MHz channels: 1, 6, 11)
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1) AP4(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1) AP4(1)
AP3            1        2412      1 (20 dBm)   Up        AP2(1) AP4(1) AP1(1)
AP4            1        2412      1 (20 dBm)   Up        AP3(1) AP2(1) AP1(1)

<span class="hl">Interference: 6 AP pair(s) on overlapping channels</span>
  AP1 &lt;-&gt; AP2     ch 1/1     -64 dBm   18 m   co-channel
  AP1 &lt;-&gt; AP3     ch 1/1     -74 dBm   36 m   co-channel
  <span class="hl">AP1 &lt;-&gt; AP4     ch 1/1     -81 dBm   54 m   co-channel</span>
  AP2 &lt;-&gt; AP3     ch 1/1     -64 dBm   18 m   co-channel
  AP2 &lt;-&gt; AP4     ch 1/1     -74 dBm   36 m   co-channel
  AP3 &lt;-&gt; AP4     ch 1/1     -64 dBm   18 m   co-channel</pre>
<p>Four APs that all hear each other form 4 x 3 / 2 = <b>6 pairs</b>. Even AP1 and AP4, 54 m apart, hear each other at -81 dBm, just above the roughly -82 dBm level at which APs defer to each other. The whole floor is effectively one channel.</p>

<h3>Step 2: apply 1, 6, 11 and reuse 1</h3>
<pre class="code">config 802.11b channel ap AP1 1
config 802.11b channel ap AP2 6
config 802.11b channel ap AP3 11
config 802.11b channel ap AP4 1</pre>
<p>Neighbours now differ. Only AP1 and AP4 still share channel 1, 54 m apart at -81 dBm.</p>

<h3>Step 3: use transmit power to make reuse clean</h3>
<p>Power levels on this controller start at level 1 = 20 dBm, and each level is 3 dB lower (level 2 = 17 dBm, level 3 = 14 dBm). Lower AP1 and AP4 by one level. The controller counts a pair if <i>either</i> AP hears the other, so both must change.</p>
<pre class="code">config 802.11b txPower ap AP1 2
config 802.11b txPower ap AP4 2
show advanced 802.11b channel</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      2 (17 dBm)   Up        -
AP2            6        2437      1 (20 dBm)   Up        -
AP3            11       2462      1 (20 dBm)   Up        -
AP4            1        2412      2 (17 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<div class="eg"><p><b>Worked example.</b> At 54 m, AP4 was heard at -81 dBm when sending at 20 dBm. Lowering it by 3 dB to 17 dBm gives about -84 dBm, below the -82 dBm threshold, so AP1 no longer defers to AP4. The end APs also sit against the outer walls, so a slightly smaller cell costs little useful coverage, and a smaller cell leaks less into the car park.</p></div>

<h3>Step 4: fix 5 GHz and avoid DFS</h3>
<pre class="code">show advanced 802.11a channel
config 802.11a channel ap AP1 36
config 802.11a channel ap AP2 40
config 802.11a channel ap AP3 44
config 802.11a channel ap AP4 48</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            36       5180      1 (20 dBm)   Up        -
AP2            40       5200      1 (20 dBm)   Up        -
AP3            44       5220      1 (20 dBm)   Up        -
AP4            48       5240      1 (20 dBm)   Up        -
<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<p>All four are U-NII-1 channels: unique, non-overlapping and free of radar rules. With only four APs you can afford a unique 5 GHz channel each; on a larger floor you would reuse them in a pattern, just as in 2.4 GHz.</p>

<h3>Step 5: channel maths</h3>
<pre class="out">(WLC1) &gt;show ap config 802.11b AP2
<span class="hl">Current Channel.................................. 6 (2437 MHz)</span>
Channel Width.................................... 20 MHz
Current Tx Power Level........................... 1 (20 dBm)</pre>
<p>2407 + 5 x 6 = 2437 MHz. For 5 GHz, 5000 + 5 x 44 = 5220 MHz.</p>
<p>In production, the controller's <b>radio resource management (RRM)</b> would run this process for you: dynamic channel assignment and transmit power control, re-evaluated regularly. Doing it by hand once teaches you to read and check what RRM decides.</p>

<div class="warn"><p><b>Common mistake.</b> Solving the last co-channel pair by moving AP4 to channel 3 or 9. That creates adjacent-channel interference with channel 1 or 11 and hides the pair from a "same channel" check while making the air worse. Use power, not overlapping channels.</p></div>

<div class="exam"><p><b>Exam trap.</b> With more APs than non-overlapping channels, the answer is channel <b>reuse</b> with enough separation, controlled by distance and transmit power, not extra 2.4 GHz channels. Lower power means smaller cells and more reuse.</p></div>

<div class="scn"><h4>The floor that got faster by getting quieter</h4><p>A real office with this exact layout measured 6 Mbps per user at lunchtime on 2.4 GHz. After the 1, 6, 11, 1 plan, one power step down on the end APs and unique U-NII-1 channels on 5 GHz, an active survey showed 24 Mbps per user on 2.4 GHz and far more on 5 GHz, with no new hardware. Users near the windows had also stopped roaming to a neighbour's AP.</p><p><b>Lesson:</b> channel and power planning is the cheapest capacity upgrade you will ever make.</p></div>

<div class="iv"><p class="q">"You have four APs in a line and only three clean 2.4 GHz channels. How do you plan them?"</p><p>Strong answer: alternate 1, 6, 11 and reuse 1 on the fourth AP, so neighbours never share or overlap; then make sure the two channel-1 APs cannot hear each other above about -82 dBm, using distance and lower transmit power on those APs. Verify with the controller's channel plan or a survey. Put capacity on 5 GHz with unique non-DFS channels, and let RRM maintain it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the plan first: show advanced 802.11b / 802.11a channel lists channels, power and interfering pairs.</li>
<li>2.4 GHz: alternate 1, 6, 11; reuse a channel only where cells are far apart or quieter.</li>
<li>Power level 1 = 20 dBm, each level 3 dB lower; lower power shrinks cells and enables reuse.</li>
<li>5 GHz: unique non-DFS channels (36 to 48, 149 to 165) near radar; every 20 MHz channel is non-overlapping.</li>
<li>Centre frequency: 2407 + 5 x channel (2.4 GHz), 5000 + 5 x channel (5 GHz).</li>
</ul></div>
`,hi:`
<p>Ek shaadi mein seating planner ke paas line mein chaar lambi tables hain aur tablecloth ke sirf teen rang. Padosi tables kabhi same rang share nahi kar sakti, isliye pattern hai laal, neela, hara, laal. Do laal tables hall ke ulte ends par hain, aur agar un tables ke guests itna dheere bolein, to woh kabhi ek doosre ko disturb nahi karte. Bilkul yahi plan aap is lab mein banaoge.</p>

<h3>Lab floor</h3>
<p>Chaar ceiling APs, <b>AP1 se AP4</b>, 60 m ke open-plan floor par ek line mein latke hain, <b>18 m door</b>. Yeh VLAN 10 (10.30.10.0/24) mein lightweight APs hain, inhone router <b>R1</b> par DHCP option 43 se controller <b>WLC1</b> (10.30.99.10, VLAN 99) dhoondha, aur VLAN 20 mein SSID <code>CORP-OFFICE</code> (WPA2-PSK) serve karte hain. Box se nikalte hi har 2.4 GHz radio full power (level 1 = 20 dBm) par channel 1 par hai, AP1 aur AP2 5 GHz channel 36 share karte hain, aur installer ne AP3 aur AP4 ko DFS channels 52 aur 100 par chhod diya.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Office floor channel plan">
<rect x="10" y="20" width="620" height="120" rx="10" fill="#e2e8f0"/>
<circle cx="80" cy="80" r="40" fill="#bae6fd"/><text x="80" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP1</text><text x="80" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 17 dBm</text>
<circle cx="240" cy="80" r="52" fill="#bbf7d0"/><text x="240" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP2</text><text x="240" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 6, 20 dBm</text>
<circle cx="400" cy="80" r="52" fill="#fde68a"/><text x="400" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP3</text><text x="400" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 11, 20 dBm</text>
<circle cx="560" cy="80" r="40" fill="#bae6fd"/><text x="560" y="76" text-anchor="middle" class="svg-ink" font-size="13">AP4</text><text x="560" y="93" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 17 dBm</text>
<text x="160" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text><text x="480" y="165" text-anchor="middle" class="svg-muted" font-size="12">18 m</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="13">2.4 GHz target: 1, 6, 11, 1, ends par kam power</text>
<text x="320" y="222" text-anchor="middle" class="svg-ink" font-size="12">5 GHz target: 36, 40, 44, 48 (sab non-DFS)</text>
</svg><p class="cap">Poora plan. AP1 aur AP4 channel 1 reuse karte hain kyunki woh 54 m door aur thode dheeme hain.</p></div>

<h3>Step 1: current plan padho</h3>
<pre class="code"><span class="c">! WLC1 par</span>
show ap summary
show advanced 802.11b channel</pre>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel
802.11b/g/n (2.4 GHz) channel plan   (non-overlapping 20 MHz channels: 1, 6, 11)
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1) AP4(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1) AP4(1)
AP3            1        2412      1 (20 dBm)   Up        AP2(1) AP4(1) AP1(1)
AP4            1        2412      1 (20 dBm)   Up        AP3(1) AP2(1) AP1(1)

<span class="hl">Interference: 6 AP pair(s) on overlapping channels</span>
  AP1 &lt;-&gt; AP2     ch 1/1     -64 dBm   18 m   co-channel
  AP1 &lt;-&gt; AP3     ch 1/1     -74 dBm   36 m   co-channel
  <span class="hl">AP1 &lt;-&gt; AP4     ch 1/1     -81 dBm   54 m   co-channel</span>
  AP2 &lt;-&gt; AP3     ch 1/1     -64 dBm   18 m   co-channel
  AP2 &lt;-&gt; AP4     ch 1/1     -74 dBm   36 m   co-channel
  AP3 &lt;-&gt; AP4     ch 1/1     -64 dBm   18 m   co-channel</pre>
<p>Chaar APs jo sab ek doosre ko sunte hain 4 x 3 / 2 = <b>6 pairs</b> banate hain. 54 m door AP1 aur AP4 bhi ek doosre ko -81 dBm par sunte hain, lagbhag -82 dBm level se bas upar jahan APs ek doosre ke liye rukte hain. Poora floor asal mein ek channel hai.</p>

<h3>Step 2: 1, 6, 11 lagao aur 1 reuse karo</h3>
<pre class="code">config 802.11b channel ap AP1 1
config 802.11b channel ap AP2 6
config 802.11b channel ap AP3 11
config 802.11b channel ap AP4 1</pre>
<p>Ab padosi alag hain. Sirf AP1 aur AP4 abhi bhi channel 1 share karte hain, 54 m door -81 dBm par.</p>

<h3>Step 3: reuse ko clean banane ke liye transmit power use karo</h3>
<p>Is controller par power levels level 1 = 20 dBm se shuru hote hain, aur har level 3 dB kam hai (level 2 = 17 dBm, level 3 = 14 dBm). AP1 aur AP4 ko ek level kam karo. Controller pair ginta hai agar <i>koi bhi</i> AP doosre ko sune, isliye dono badalne honge.</p>
<pre class="code">config 802.11b txPower ap AP1 2
config 802.11b txPower ap AP4 2
show advanced 802.11b channel</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      2 (17 dBm)   Up        -
AP2            6        2437      1 (20 dBm)   Up        -
AP3            11       2462      1 (20 dBm)   Up        -
AP4            1        2412      2 (17 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<div class="eg"><p><b>Worked example.</b> 54 m par, 20 dBm bhejte hue AP4 -81 dBm par suna jaata tha. Ise 3 dB kam karke 17 dBm karne se lagbhag -84 dBm milta hai, -82 dBm threshold se neeche, isliye AP1 ab AP4 ke liye nahi rukta. End wale APs bahar ki deewaron ke saath bhi hain, isliye thoda chhota cell kam useful coverage khota hai, aur chhota cell car park mein kam leak karta hai.</p></div>

<h3>Step 4: 5 GHz theek karo aur DFS se bacho</h3>
<pre class="code">show advanced 802.11a channel
config 802.11a channel ap AP1 36
config 802.11a channel ap AP2 40
config 802.11a channel ap AP3 44
config 802.11a channel ap AP4 48</pre>
<pre class="out">AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            36       5180      1 (20 dBm)   Up        -
AP2            40       5200      1 (20 dBm)   Up        -
AP3            44       5220      1 (20 dBm)   Up        -
AP4            48       5240      1 (20 dBm)   Up        -
<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>
<p>Chaaron U-NII-1 channels hain: unique, non-overlapping aur radar rules se free. Sirf chaar APs ke saath aap har ek ko unique 5 GHz channel de sakte ho; bade floor par aap unhe 2.4 GHz ki tarah ek pattern mein reuse karoge.</p>

<h3>Step 5: channel maths</h3>
<pre class="out">(WLC1) &gt;show ap config 802.11b AP2
<span class="hl">Current Channel.................................. 6 (2437 MHz)</span>
Channel Width.................................... 20 MHz
Current Tx Power Level........................... 1 (20 dBm)</pre>
<p>2407 + 5 x 6 = 2437 MHz. 5 GHz ke liye, 5000 + 5 x 44 = 5220 MHz.</p>
<p>Production mein controller ka <b>radio resource management (RRM)</b> yeh process aapke liye chalayega: dynamic channel assignment aur transmit power control, regularly re-evaluate hote hue. Ek baar haath se karna aapko sikhata hai ki RRM jo tay kare use kaise padhein aur check karein.</p>

<div class="warn"><p><b>Common galti.</b> Aakhri co-channel pair ko AP4 ko channel 3 ya 9 par le jaakar solve karna. Isse channel 1 ya 11 ke saath adjacent-channel interference banta hai aur "same channel" check se pair chhup jaata hai jabki hawa aur kharab hoti hai. Power use karo, overlapping channels nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab non-overlapping channels se zyada APs hon, to jawab kaafi separation ke saath channel <b>reuse</b> hai, doori aur transmit power se controlled, extra 2.4 GHz channels nahi. Kam power matlab chhote cells aur zyada reuse.</p></div>

<div class="scn"><h4>Floor jo shaant hokar tez hua</h4><p>Bilkul isi layout wale ek asli office ne lunch time par 2.4 GHz par har user ko 6 Mbps measure kiya. 1, 6, 11, 1 plan, end APs par ek power step kam aur 5 GHz par unique U-NII-1 channels ke baad, active survey ne 2.4 GHz par har user ko 24 Mbps aur 5 GHz par kahin zyada dikhaya, bina naye hardware ke. Khidkiyon ke paas ke users ne padosi ke AP par roam karna bhi band kar diya.</p><p><b>Seekh:</b> channel aur power planning sabse sasta capacity upgrade hai jo aap kabhi karoge.</p></div>

<div class="iv"><p class="q">"Aapke paas line mein chaar APs hain aur sirf teen clean 2.4 GHz channels. Aap unhe kaise plan karoge?"</p><p>Strong answer: 1, 6, 11 alternate karo aur chauthe AP par 1 reuse karo, taaki padosi kabhi share ya overlap na karein; phir pakka karo ki do channel-1 APs ek doosre ko lagbhag -82 dBm se upar na sun sakein, doori aur un APs par kam transmit power use karke. Controller ke channel plan ya survey se verify karo. Capacity unique non-DFS channels ke saath 5 GHz par rakho, aur RRM ko ise maintain karne do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle plan padho: show advanced 802.11b / 802.11a channel channels, power aur interfering pairs list karta hai.</li>
<li>2.4 GHz: 1, 6, 11 alternate karo; channel sirf wahan reuse karo jahan cells door ya dheeme hon.</li>
<li>Power level 1 = 20 dBm, har level 3 dB kam; kam power cells chhote karti hai aur reuse possible banati hai.</li>
<li>5 GHz: radar ke paas unique non-DFS channels (36 se 48, 149 se 165); har 20 MHz channel non-overlapping hai.</li>
<li>Centre frequency: 2407 + 5 x channel (2.4 GHz), 5000 + 5 x channel (5 GHz).</li>
</ul></div>
`}};export{e as default};