var e={id:`channels-widths`,h:{en:`Channels and widths: 2.4 and 5 GHz plans, DFS, and Lab 2`,hi:`Channels aur widths: 2.4 aur 5 GHz plans, DFS, aur Lab 2`},body:{en:`
<p>A <b>channel</b> is a slice of the band that one cell uses. Think of a road: each lane is a channel, and a <b>wider channel</b> is a road with more lanes joined together. More lanes carry more cars (data), but a town only has so much land (spectrum), so wide roads leave room for fewer separate neighbourhoods.</p>

<h3>2.4 GHz: three clean channels</h3>
<p>The 2.4 GHz band is only about 83 MHz wide (2400 to 2483.5 MHz). Channel numbers 1 to 13 are 5 MHz apart, yet a Wi-Fi signal is about 20 to 22 MHz wide. So channels overlap unless they are at least five numbers apart. The non-overlapping set is <b>1, 6, 11</b>. Channel 14 is Japan-only and 802.11b-only. In India channels 1 to 13 are available, but a plan still uses 1, 6, 11 (some European plans use 1, 5, 9, 13, which overlaps slightly).</p>
<p>A 40 MHz channel on 2.4 GHz would take two of the three clean channels. That is why 2.4 GHz is run at <b>20 MHz</b> in nearly every enterprise design. You will fix exactly this in Lab 4.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="2.4 GHz channels">
<line x1="20" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M30 150 Q80 40 130 150Z" fill="#bae6fd"/><path d="M250 150 Q300 40 350 150Z" fill="#bbf7d0"/><path d="M470 150 Q520 40 570 150Z" fill="#fde68a"/>
<path d="M120 150 Q170 90 220 150Z" fill="#fed7aa" fill-opacity="0.6"/>
<text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 1</text><text x="300" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 6</text><text x="520" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 11</text><text x="170" y="140" text-anchor="middle" class="svg-muted" font-size="12">ch 3 overlaps 1 and 6</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">2400 MHz to 2483.5 MHz</text>
</svg><p class="cap">Channels 1, 6 and 11 do not touch. A channel 3 would overlap both neighbours.</p></div>

<h3>5 GHz: many channels, in four groups</h3>
<table class="cmp"><tr><th>Group</th><th>20 MHz channels</th><th>DFS?</th></tr>
<tr><td>UNII-1</td><td>36, 40, 44, 48</td><td>No</td></tr>
<tr><td>UNII-2</td><td>52, 56, 60, 64</td><td>Yes</td></tr>
<tr><td>UNII-2 Extended</td><td>100 to 144 (100, 104 ... 144)</td><td>Yes</td></tr>
<tr><td>UNII-3 / ISM</td><td>149, 153, 157, 161, 165</td><td>No</td></tr></table>
<p>Exactly which channels are legal depends on the <b>regulatory domain</b> (country code). In India, the 5 GHz band is available with DFS rules on part of it; always confirm against the current regulation for your site and model.</p>
<p><b>DFS (Dynamic Frequency Selection)</b> protects weather and military radar that share the band. Before using a DFS channel the AP listens for radar (the channel availability check, 60 seconds on most DFS channels). If it later detects radar it must stop transmitting on that channel quickly and stay off it for 30 minutes. Clients cannot send probe requests on a DFS channel until an AP beacon has been heard. DFS events are concept only in the simulator, which uses the non-DFS list 36, 40, 44, 48, 149, 153, 157, 161.</p>

<h3>Channel bonding: 20, 40, 80, 160 MHz</h3>
<p>Wider channels are made by bonding adjacent 20 MHz channels into fixed blocks. An AP has one <b>primary</b> 20 MHz channel (beacons and legacy control frames go there) and joins <b>secondary</b> channels to it.</p>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Channel bonding">
<rect x="20" y="20" width="140" height="30" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">36</text><rect x="165" y="20" width="140" height="30" fill="#bae6fd"/><text x="235" y="40" text-anchor="middle" class="svg-ink" font-size="12">40</text><rect x="310" y="20" width="140" height="30" fill="#bae6fd"/><text x="380" y="40" text-anchor="middle" class="svg-ink" font-size="12">44</text><rect x="455" y="20" width="140" height="30" fill="#bae6fd"/><text x="525" y="40" text-anchor="middle" class="svg-ink" font-size="12">48</text>
<rect x="20" y="60" width="285" height="30" fill="#bbf7d0"/><text x="162" y="80" text-anchor="middle" class="svg-ink" font-size="12">40 MHz (36+40)</text><rect x="310" y="60" width="285" height="30" fill="#bbf7d0"/><text x="452" y="80" text-anchor="middle" class="svg-ink" font-size="12">40 MHz (44+48)</text>
<rect x="20" y="100" width="575" height="30" fill="#ddd6fe"/><text x="307" y="120" text-anchor="middle" class="svg-ink" font-size="12">80 MHz (36 to 48)</text>
<text x="20" y="160" class="svg-muted" font-size="12">Four 20 MHz channels bond into two 40 MHz or one 80 MHz block. Blocks never straddle.</text>
</svg><p class="cap">UNII-1 gives eight 20 MHz, four 40 MHz and two 80 MHz blocks once UNII-3 (149 to 161) is added.</p></div>
<p>Bonded blocks: 40 MHz is 36+40, 44+48 and so on. 80 MHz is 36 to 48, 149 to 161. 160 MHz is 36 to 64 or 100 to 128. A 40 MHz AP on channel 36 plus 40 is <b>not</b> a plan with channel 40 free for a neighbour.</p>
<table class="cmp"><tr><th>Width</th><th>Non-DFS 5 GHz blocks in the model</th><th>Good for</th></tr>
<tr><td>20 MHz</td><td>8</td><td>High density, many APs</td></tr><tr><td>40 MHz</td><td>4</td><td>Medium density, balanced</td></tr><tr><td>80 MHz</td><td>2</td><td>Few APs, or home and small office</td></tr></table>
<p>A wider channel adds subcarriers (more speed) but also noise (3 dB per doubling), shrinks the number of non-overlapping cells, and the whole bonded channel is blocked when an interferer sits on any part of it (802.11ac and later can transmit on the clean part of the block, using dynamic bandwidth rules).</p>

<h3>Lab 2: build RF profile STD-5</h3>
<p>The floor has two APs and a Wi-Fi 6 laptop, so 40 MHz is affordable. Open an RF profile for 5 GHz, set the width, disable the three lowest rates (24 Mbps stays mandatory), bind it with an RF tag and tag both APs.</p>
<pre class="code"><span class="c">! RF profile for the 5 GHz band</span>
ap dot11 5ghz rf-profile STD-5
 channel chan-width 40
 rate RATE_6M disable
 rate RATE_9M disable
 rate RATE_12M disable
 no shutdown
<span class="c">! bind the profile to an RF tag, then tag the APs</span>
wireless tag rf RF-STD
 5ghz-rf-policy STD-5
ap name AP1 rf-tag RF-STD
ap name AP2 rf-tag RF-STD</pre>
<p>GUI path: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz Band tab: General, 802.11 data rates, RRM channel width), then <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b> for the RF tag, and <b>Configuration &gt; Wireless &gt; Access Points</b> to tag each AP. In this simulator the rates and width live on <b>Configuration &gt; Wireless &gt; RRM</b>.</p>
<pre class="out">WLC1# show ap dot11 5ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
-------------------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   36       1            <span class="hl">40 MHz</span>
AP2                  All      0011.2233.4411  Enabled   44       1            <span class="hl">40 MHz</span></pre>
<p>Sample output; your channels may differ, but the Width column is the proof. If an AP shows 20 MHz, the RF profile is shut down, the rf-tag is not applied, or the channel cannot form a block.</p>

<div class="warn"><p><b>Common mistake.</b> Changing an RF profile on a live controller without the "shutdown" step used in the lab hints, or tagging only one AP, leaving mixed widths on the same floor.</p></div>
<div class="exam"><p><b>Exam trap.</b> Non-overlapping 2.4 GHz channels are 1, 6 and 11 only at 20 MHz. At 40 MHz you effectively get one channel. And 5 GHz DFS channels are 52 to 144, not 149 to 165.</p></div>

<div class="scn"><h4>80 MHz everywhere in a 12-AP office</h4><p>A new office had 12 APs, all at 80 MHz, and users saw low throughput and many retries. Only two 80 MHz non-DFS blocks existed, so six APs shared each block. Switching to 20 MHz gave eight non-DFS channels, and enabling DFS gave many more; throughput per user rose despite the narrower channel.</p><p><b>Lesson:</b> design channel width from AP count and density, not from the maximum the client supports.</p></div>

<div class="iv"><p class="q">"Why use 20 MHz on 2.4 GHz and 40 MHz on 5 GHz in an office?"</p><p>Strong answer: 2.4 GHz has only three clean channels, so 40 MHz would force co-channel interference between neighbouring APs. 5 GHz has enough channels (especially with DFS) to give each AP a 40 MHz block, which doubles per-client peak rate. Mention that high-density halls use 20 MHz everywhere.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz non-overlapping set: 1, 6, 11; run it at 20 MHz.</li>
<li>5 GHz has UNII-1, UNII-2 and UNII-2e (DFS) and UNII-3; DFS channels are 52 to 144.</li>
<li>Wider channels bond adjacent 20 MHz channels in fixed blocks around a primary channel.</li>
<li>Wider means faster per client but fewer clean cells and 3 dB more noise.</li>
<li>Lab 2: set chan-width 40 in the RF profile, disable low rates, bind with an RF tag, verify Width in the AP summary.</li>
</ul></div>
`,hi:`
<p><b>Channel</b> band ka ek slice hai jise ek cell use karta hai. Sadak ki tarah socho: har lane ek channel hai, aur <b>wider channel</b> kai lanes jodkar bani sadak hai. Zyada lanes zyada cars (data) le jaati hain, lekin shehar ke paas zameen (spectrum) seemit hai, isliye chaudi sadak alag alag mohallon ke liye kam jagah chhodti hai.</p>

<h3>2.4 GHz: teen saaf channels</h3>
<p>2.4 GHz band sirf lagbhag 83 MHz chauda hai (2400 se 2483.5 MHz). Channel numbers 1 se 13 5 MHz ke fasle par hain, lekin Wi-Fi signal lagbhag 20 se 22 MHz chauda hota hai. Isliye channels overlap karte hain jab tak woh kam se kam paanch numbers door na ho. Non-overlapping set hai <b>1, 6, 11</b>. Channel 14 sirf Japan ke liye aur sirf 802.11b ke liye hai. India mein channels 1 se 13 available hain, phir bhi plan 1, 6, 11 hi use karta hai (kuch European plans 1, 5, 9, 13 use karte hain, jo thoda overlap karta hai).</p>
<p>2.4 GHz par 40 MHz channel teen mein se do saaf channels le leta. Isliye lagbhag har enterprise design mein 2.4 GHz <b>20 MHz</b> par chalta hai. Yahi cheez aap Lab 4 mein fix karoge.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="2.4 GHz channels">
<line x1="20" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M30 150 Q80 40 130 150Z" fill="#bae6fd"/><path d="M250 150 Q300 40 350 150Z" fill="#bbf7d0"/><path d="M470 150 Q520 40 570 150Z" fill="#fde68a"/>
<path d="M120 150 Q170 90 220 150Z" fill="#fed7aa" fill-opacity="0.6"/>
<text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 1</text><text x="300" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 6</text><text x="520" y="170" text-anchor="middle" class="svg-ink" font-size="13">ch 11</text><text x="170" y="140" text-anchor="middle" class="svg-muted" font-size="12">ch 3 1 aur 6 dono se overlap</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">2400 MHz se 2483.5 MHz</text>
</svg><p class="cap">Channels 1, 6 aur 11 ek dusre ko nahi chhute. Channel 3 dono padosiyon se overlap karta.</p></div>

<h3>5 GHz: bahut channels, chaar groups mein</h3>
<table class="cmp"><tr><th>Group</th><th>20 MHz channels</th><th>DFS?</th></tr>
<tr><td>UNII-1</td><td>36, 40, 44, 48</td><td>Nahi</td></tr>
<tr><td>UNII-2</td><td>52, 56, 60, 64</td><td>Haan</td></tr>
<tr><td>UNII-2 Extended</td><td>100 se 144 (100, 104 ... 144)</td><td>Haan</td></tr>
<tr><td>UNII-3 / ISM</td><td>149, 153, 157, 161, 165</td><td>Nahi</td></tr></table>
<p>Kaunse channels legal hain yeh <b>regulatory domain</b> (country code) par depend karta hai. India mein 5 GHz band ke ek hisse par DFS rules ke saath available hai; apni site aur model ke liye hamesha current regulation se confirm karo.</p>
<p><b>DFS (Dynamic Frequency Selection)</b> weather aur military radar ko bachata hai jo band share karte hain. DFS channel use karne se pehle AP radar ke liye sunta hai (channel availability check, zyada tar DFS channels par 60 second). Baad mein radar detect ho to use us channel par jaldi transmit karna band karna hota hai aur 30 minute door rehna hota hai. DFS channel par clients tab tak probe request nahi bhej sakte jab tak AP ka beacon na sun lein. DFS events simulator mein concept only hain, jo non-DFS list 36, 40, 44, 48, 149, 153, 157, 161 use karta hai.</p>

<h3>Channel bonding: 20, 40, 80, 160 MHz</h3>
<p>Wider channels paas ke 20 MHz channels ko fixed blocks mein bond karke bante hain. AP ke paas ek <b>primary</b> 20 MHz channel hota hai (beacons aur legacy control frames wahin jaate hain) aur woh usse <b>secondary</b> channels jodta hai.</p>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Channel bonding">
<rect x="20" y="20" width="140" height="30" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">36</text><rect x="165" y="20" width="140" height="30" fill="#bae6fd"/><text x="235" y="40" text-anchor="middle" class="svg-ink" font-size="12">40</text><rect x="310" y="20" width="140" height="30" fill="#bae6fd"/><text x="380" y="40" text-anchor="middle" class="svg-ink" font-size="12">44</text><rect x="455" y="20" width="140" height="30" fill="#bae6fd"/><text x="525" y="40" text-anchor="middle" class="svg-ink" font-size="12">48</text>
<rect x="20" y="60" width="285" height="30" fill="#bbf7d0"/><text x="162" y="80" text-anchor="middle" class="svg-ink" font-size="12">40 MHz (36+40)</text><rect x="310" y="60" width="285" height="30" fill="#bbf7d0"/><text x="452" y="80" text-anchor="middle" class="svg-ink" font-size="12">40 MHz (44+48)</text>
<rect x="20" y="100" width="575" height="30" fill="#ddd6fe"/><text x="307" y="120" text-anchor="middle" class="svg-ink" font-size="12">80 MHz (36 se 48)</text>
<text x="20" y="160" class="svg-muted" font-size="12">Chaar 20 MHz channels do 40 MHz ya ek 80 MHz block mein bond hote hain. Blocks straddle nahi karte.</text>
</svg><p class="cap">UNII-3 (149 se 161) jodne par UNII-1 se aath 20 MHz, chaar 40 MHz aur do 80 MHz blocks milte hain.</p></div>
<p>Bonded blocks: 40 MHz matlab 36+40, 44+48 aur aise hi. 80 MHz matlab 36 se 48, 149 se 161. 160 MHz matlab 36 se 64 ya 100 se 128. Channel 36 plus 40 par 40 MHz AP ka matlab yeh <b>nahi</b> ki channel 40 padosi ke liye free hai.</p>
<table class="cmp"><tr><th>Width</th><th>Model mein non-DFS 5 GHz blocks</th><th>Kis ke liye achha</th></tr>
<tr><td>20 MHz</td><td>8</td><td>High density, bahut APs</td></tr><tr><td>40 MHz</td><td>4</td><td>Medium density, balanced</td></tr><tr><td>80 MHz</td><td>2</td><td>Kam APs, ya home aur small office</td></tr></table>
<p>Wider channel subcarriers jodta hai (zyada speed) lekin noise bhi (har doubling par 3 dB), non-overlapping cells ki ginti kam karta hai, aur interferer us block ke kisi bhi hisse par ho to poora bonded channel block ho jaata hai (802.11ac aur baad ke dynamic bandwidth rules se block ke saaf hisse par transmit kar sakte hain).</p>

<h3>Lab 2: RF profile STD-5 banao</h3>
<p>Floor par do APs aur ek Wi-Fi 6 laptop hai, isliye 40 MHz afford ho sakta hai. 5 GHz ke liye RF profile kholo, width set karo, teen sabse low rates disable karo (24 Mbps mandatory rehta hai), RF tag se bind karo aur dono APs tag karo.</p>
<pre class="code"><span class="c">! 5 GHz band ke liye RF profile</span>
ap dot11 5ghz rf-profile STD-5
 channel chan-width 40
 rate RATE_6M disable
 rate RATE_9M disable
 rate RATE_12M disable
 no shutdown
<span class="c">! profile ko RF tag se bind karo, phir APs tag karo</span>
wireless tag rf RF-STD
 5ghz-rf-policy STD-5
ap name AP1 rf-tag RF-STD
ap name AP2 rf-tag RF-STD</pre>
<p>GUI path: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz Band tab: General, 802.11 data rates, RRM channel width), phir RF tag ke liye <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b>, aur har AP tag karne ke liye <b>Configuration &gt; Wireless &gt; Access Points</b>. Is simulator mein rates aur width <b>Configuration &gt; Wireless &gt; RRM</b> par hain.</p>
<pre class="out">WLC1# show ap dot11 5ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
-------------------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   36       1            <span class="hl">40 MHz</span>
AP2                  All      0011.2233.4411  Enabled   44       1            <span class="hl">40 MHz</span></pre>
<p>Sample output; aapke channels alag ho sakte hain, lekin Width column hi proof hai. Agar koi AP 20 MHz dikhaye, to RF profile shut hai, rf-tag apply nahi hua, ya channel block nahi bana pa raha.</p>

<div class="warn"><p><b>Common galti.</b> Live controller par RF profile ko lab hints ke "shutdown" step ke bina badalna, ya sirf ek AP ko tag karna, jisse same floor par mixed widths reh jaati hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Non-overlapping 2.4 GHz channels 1, 6 aur 11 sirf 20 MHz par hain. 40 MHz par lagbhag ek hi channel milta hai. Aur 5 GHz DFS channels 52 se 144 hain, 149 se 165 nahi.</p></div>

<div class="scn"><h4>12-AP office mein sab jagah 80 MHz</h4><p>Ek naye office mein 12 APs the, sab 80 MHz par, aur users ko low throughput aur bahut retries dikhe. Sirf do 80 MHz non-DFS blocks the, isliye har block par chhe APs the. 20 MHz par jaane se aath non-DFS channels mile, aur DFS enable karne se aur bhi zyada; narrow channel hone ke bawajood per-user throughput badh gaya.</p><p><b>Seekh:</b> channel width AP count aur density se design karo, client ke maximum support se nahi.</p></div>

<div class="iv"><p class="q">"Office mein 2.4 GHz par 20 MHz aur 5 GHz par 40 MHz kyun?"</p><p>Strong answer: 2.4 GHz mein sirf teen saaf channels hain, isliye 40 MHz padosi APs ke beech co-channel interference karata. 5 GHz mein (khaaskar DFS ke saath) har AP ko 40 MHz block dene ke liye kaafi channels hain, jo per-client peak rate double kar deta hai. Batao ki high-density halls har jagah 20 MHz use karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz non-overlapping set: 1, 6, 11; ise 20 MHz par chalao.</li>
<li>5 GHz mein UNII-1, UNII-2 aur UNII-2e (DFS) aur UNII-3 hain; DFS channels 52 se 144 hain.</li>
<li>Wider channels primary channel ke aas paas fixed blocks mein adjacent 20 MHz channels bond karte hain.</li>
<li>Wider matlab per client faster lekin kam saaf cells aur 3 dB zyada noise.</li>
<li>Lab 2: RF profile mein chan-width 40 set karo, low rates disable karo, RF tag se bind karo, AP summary mein Width verify karo.</li>
</ul></div>
`}};export{e as default};